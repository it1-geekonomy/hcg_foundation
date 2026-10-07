"""Learns the public website's pages from the site itself, so new or renamed pages
(SEO changes on the frontend) need no chatbot code change.

On every full sync the menu and footer links (server-rendered on every page) are
read for page paths and their visitor-facing labels. Pages the chatbot knows from
``constants`` (or learned earlier) but no longer in the menu are probed: kept if
they load, followed if they redirect, matched by content to a newly appeared page
if they 404 (a rename without a redirect), and otherwise reported as broken. The
result is stored in ``rag_meta`` so it survives restarts and a temporarily-down frontend.
"""

from __future__ import annotations

import html
import json
import logging
import math
import re
import threading
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.config import settings
from app.database import SessionLocal
from app.models.document_chunk import RagMeta
from app.rag import constants as C

log = logging.getLogger(__name__)

_META_KEY = "site_routes"
# Any page server-renders the full navbar and footer; a second one covers a bad deploy of the first.
_MENU_PAGES = ("/about-us", "/contact")
# Fewer menu links than this means we fetched an error page, not the real site.
_MIN_ROUTES = 5

_ANCHOR = re.compile(r"<a\b[^>]*?\bhref=\"(/[^\"]*)\"[^>]*>(.*?)</a>", re.I | re.S)
_TAG = re.compile(r"<[^>]+>")
_PAGE_PATH = re.compile(r"^/[a-z0-9\-/]*$")
_SKIP_PREFIXES = ("/_next", "/api", "/admin", "/cms", "/login", "/register")
# A vanished page is treated as renamed only on a clear content match with one new page.
_RENAME_MIN_SIMILARITY = 0.5
_RENAME_MARGIN = 0.15

_state: dict | None = None
_lock = threading.Lock()


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):  # noqa: ANN002, ANN003
        return None


_opener = urllib.request.build_opener(_NoRedirect)


def _base() -> str:
    return (settings.site_crawl_url or "").rstrip("/")


def _get(path: str) -> tuple[int, str, str]:
    """(status, body, redirect location) without following redirects."""
    req = urllib.request.Request(_base() + path, headers={"User-Agent": "HCG-Chatbot-Indexer"})
    try:
        with _opener.open(req, timeout=60) as res:
            return res.status, res.read().decode("utf-8", errors="ignore"), ""
    except urllib.error.HTTPError as exc:
        return exc.code, "", exc.headers.get("Location") or ""


def _clean_label(raw: str) -> str:
    label = " ".join(html.unescape(_TAG.sub(" ", raw)).split())
    # Responsive menus render the same label twice ("Home Home")
    words = label.split()
    half = len(words) // 2
    if half and len(words) % 2 == 0 and words[:half] == words[half:]:
        label = " ".join(words[:half])
    return label


def _label_score(path: str, label: str) -> tuple[int, int]:
    """Prefer the label that names the page ("About Us" for /about-us, not "Team")."""
    slug_words = set(re.findall(r"[a-z0-9]+", path.lower()))
    label_words = set(re.findall(r"[a-z0-9]+", label.lower()))
    return len(slug_words & label_words), len(label)


def _menu_routes() -> dict[str, str]:
    candidates: dict[str, list[str]] = {}
    for page in _MENU_PAGES:
        try:
            status, body, _ = _get(page)
        except Exception as exc:  # noqa: BLE001 - site down must not break the sync
            log.warning("Could not read site menu from %s: %s", page, exc)
            continue
        if status != 200:
            continue
        for href, inner in _ANCHOR.findall(body):
            path = href.split("#")[0].split("?")[0].rstrip("/") or "/"
            label = _clean_label(inner)
            if not label or not _PAGE_PATH.match(path) or path.startswith(_SKIP_PREFIXES):
                continue
            candidates.setdefault(path, []).append(label)
        if len(candidates) >= _MIN_ROUTES:
            break
    return {
        path: ("Home" if path == "/" else max(labels, key=lambda lb: _label_score(path, lb)))
        for path, labels in candidates.items()
    }


def _known_page_paths() -> set[str]:
    paths = {p.split("#")[0] or "/" for p in C.PAGE_LABELS if not p.startswith("#")}
    paths |= {p.rstrip("/") for p in C.DETAIL_PREFIXES}
    return paths


def _words(text: str) -> Counter:
    return Counter(w for w in re.findall(r"[a-z]{4,}", (text or "").lower()))


def _similarity(a: Counter, b: Counter, idf: dict[str, float]) -> float:
    dot = sum(a[w] * b[w] * idf.get(w, 1.0) ** 2 for w in a.keys() & b.keys())
    norm_a = math.sqrt(sum((n * idf.get(w, 1.0)) ** 2 for w, n in a.items()))
    norm_b = math.sqrt(sum((n * idf.get(w, 1.0)) ** 2 for w, n in b.items()))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


def _detect_renames(missing: list[str], new_pages: list[str], labels: dict[str, str]) -> dict[str, str]:
    """Pair pages that vanished with pages that appeared, by content (renames without redirects).

    The vanished page's text is still in the index from the previous sync; the new
    page's text is fetched now. Words shared by every page (donate sections and the
    like) are down-weighted so only page-specific content decides the match.
    """
    if not missing or not new_pages:
        return {}
    from app.services import site_pages, vector_store

    old_text = {d["source_id"]: d.get("content") or "" for d in vector_store.documents("site")}
    old = {p: _words(old_text.get(p) or labels.get(p, "")) for p in missing}
    new: dict[str, Counter] = {}
    for path in new_pages:
        try:
            status, body, _ = _get(path)
        except Exception:  # noqa: BLE001
            continue
        if status == 200:
            new[path] = _words(f"{labels.get(path, '')}\n{site_pages.html_to_text(body)}")
    if not new:
        return {}

    corpus = [*old.values(), *new.values(), *(_words(t) for t in old_text.values())]
    idf = {
        w: math.log((1 + len(corpus)) / (1 + sum(1 for doc in corpus if w in doc))) + 1
        for w in set().union(*corpus)
    }
    renames: dict[str, str] = {}
    for path, words in old.items():
        scored = sorted(((_similarity(words, nw, idf), np) for np, nw in new.items()), reverse=True)
        best, target = scored[0]
        runner_up = scored[1][0] if len(scored) > 1 else 0.0
        if best >= _RENAME_MIN_SIMILARITY and best - runner_up >= _RENAME_MARGIN:
            log.info("Page %s looks renamed to %s (similarity %.2f)", path, target, best)
            renames[path] = target
    return renames


def refresh() -> dict | None:
    """Re-learn the site's pages. Keeps the previous result if the site can't be read."""
    global _state
    if not _base():
        return None
    routes = _menu_routes()
    if len(routes) < _MIN_ROUTES:
        log.warning("Site menu returned %d links; keeping the previously learned pages", len(routes))
        return routes_state()

    previous = routes_state() or {}
    prev_routes: dict[str, str] = previous.get("routes", {})
    prev_aliases: dict[str, str] = previous.get("aliases", {})
    labels = {**C.PAGE_LABELS, **prev_routes, **routes}

    # Everything the chatbot has known as a page, minus what the menu still lists
    to_check = (_known_page_paths() | set(prev_routes) | set(prev_aliases)) - set(routes)
    to_check = {p for p in to_check if not p.startswith(C.DETAIL_PREFIXES)}

    aliases: dict[str, str] = {}
    gone: list[str] = []
    for path in sorted(to_check):
        try:
            status, _, location = _get(path)
        except Exception as exc:  # noqa: BLE001
            log.warning("Could not check page %s: %s", path, exc)
            continue
        if status == 200:
            routes[path] = labels.get(path, path)
        elif status in (301, 302, 307, 308) and location:
            aliases[path] = urlparse(location).path.rstrip("/") or "/"
        elif prev_aliases.get(path) in routes:
            # Rename detected on an earlier sync (old page text is no longer indexed)
            aliases[path] = prev_aliases[path]
        else:
            gone.append(path)

    new_pages = sorted(p for p in routes if p not in prev_routes and p not in _known_page_paths())
    try:
        aliases.update(_detect_renames(gone, new_pages, labels))
    except Exception:  # noqa: BLE001 - rename detection is best-effort
        log.exception("Page rename detection failed")
    aliases = {old: new for old, new in aliases.items() if new in routes}
    broken = [p for p in gone if p not in aliases]
    if broken:
        log.warning("Chatbot pages that no longer exist on the website: %s", ", ".join(broken))

    state = {
        "routes": routes,
        "aliases": aliases,
        "broken": broken,
        "updated": datetime.now(timezone.utc).isoformat(),
    }
    db = SessionLocal()
    try:
        row = db.get(RagMeta, _META_KEY)
        if row:
            row.value = json.dumps(state)
        else:
            db.add(RagMeta(key=_META_KEY, value=json.dumps(state)))
        db.commit()
    finally:
        db.close()
    with _lock:
        _state = state
    return state


def routes_state() -> dict | None:
    """Last learned site pages, or None if never learned (callers fall back to constants)."""
    global _state
    if _state is not None:
        return _state or None
    with _lock:
        if _state is None:
            db = SessionLocal()
            try:
                row = db.get(RagMeta, _META_KEY)
                _state = json.loads(row.value) if row else {}
            except Exception:  # noqa: BLE001 - e.g. DB not migrated yet
                _state = {}
            finally:
                db.close()
    return _state or None


def routes() -> dict[str, str] | None:
    state = routes_state()
    return state["routes"] if state else None


def alias(path: str) -> str:
    state = routes_state()
    return (state or {}).get("aliases", {}).get(path, path)


def broken() -> list[str]:
    return list((routes_state() or {}).get("broken", []))
