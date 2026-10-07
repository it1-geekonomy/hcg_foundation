"""Keeps chatbot links pointing at pages that actually exist on the public website."""

from __future__ import annotations

import re
from urllib.parse import urlparse

from app.rag import constants as C
from app.services import site_routes

_SITE_PREFIX = re.compile(r"^https?://(?:www\.)?hcgfoundation\.org", re.I)
_MD_LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
_BARE_SITE_URL = re.compile(r"https?://(?:www\.)?hcgfoundation\.org[^\s)\]]*", re.I)
# The model sometimes imitates the NO_ANSWER_FOUND sentinel with variants of its own
_SENTINEL = re.compile(r"\bNO_[A-Z_]+_FOUND\b[.:]?\s*")
# "URL: /path" lines copied from the context format instead of a proper link
_URL_LINE = re.compile(r"(?im)^([ \t]*(?:[-*]\s+)?)(?:\*\*)?URL:?(?:\*\*)?:?\s*(\S+?)\s*$")

# Rows synced from the CMS carry their own record titles (story names, events...).
_CURATED_TABLES = {"static", "knowledge", "site"}

# External sites our published content actually links to; any other external URL
# in an answer was made up by the model, so it is unlinked / dropped.
_ALLOWED_EXTERNAL_HOSTS = {"fcraonline.nic.in"}
_EXTERNAL_URL = re.compile(r"(?<![(\w/])https?://[^\s)\]]+")


def _allowed_external(url: str) -> bool:
    host = (urlparse(url).hostname or "").lower().removeprefix("www.")
    return host in _ALLOWED_EXTERNAL_HOSTS


def _detail_slug(u: str, prefix: str) -> str:
    slug = u[len(prefix):] if u.startswith(prefix) else ""
    return slug if slug and "/" not in slug and " " not in slug else ""


def public_url(url: str | None) -> str | None:
    """Return a valid public route for ``url``, or None if the site has no such page."""
    u = (url or "").strip()
    u = C.LEGACY_URLS.get(u.rstrip("/") or "/", u)
    for old, new in C.LEGACY_SECTION_PREFIXES.items():
        if u.startswith(old):
            u = new
    for old, new in C.LEGACY_DETAIL_PREFIXES.items():
        if u.startswith(old):
            u = new + u[len(old):]

    known = site_routes.routes()
    if known is None:
        # Site pages not learned yet (first start, or page crawling disabled)
        if u in C.PAGE_LABELS:
            return u
        return u if any(_detail_slug(u, p) for p in C.DETAIL_PREFIXES) else None

    path, _, anchor = u.partition("#")
    if not path:
        return u if u in C.PAGE_LABELS else None
    path = site_routes.alias(path.rstrip("/") or "/")
    if path in known:
        with_anchor = f"{path}#{anchor}" if anchor else path
        # Unknown section anchors fall back to the page itself
        return with_anchor if not anchor or with_anchor in C.PAGE_LABELS else path
    for prefix in C.DETAIL_PREFIXES:
        if _detail_slug(path, prefix) and prefix.rstrip("/") in known:
            return path
    return None


def page_label(url: str, default: str = "") -> str:
    """The website's own name for a page (menu label), falling back to curated labels."""
    if "#" in url and url in C.PAGE_LABELS:
        return C.PAGE_LABELS[url]
    return (site_routes.routes() or {}).get(url) or C.PAGE_LABELS.get(url) or default


def valid_sources(sources: list[dict] | None) -> list[dict]:
    """Final check on "Learn more" chips: only real pages, no home page, no duplicates."""
    page_names = set(C.PAGE_LABELS.values())
    out: list[dict] = []
    seen: set[str] = set()
    for source in sources or []:
        raw = source.get("url")
        url = public_url(raw)
        if not url or url == "/" or url in seen:
            continue
        seen.add(url)
        title = (source.get("title") or "").strip()
        if not title or title in page_names or url != raw:
            title = page_label(url, title or "HCG Foundation")
        out.append({"title": title, "url": url})
    return out


def clean_answer(text: str) -> str:
    """Make links in a generated answer relative and valid; unlink anything the site doesn't have."""

    def md(m: re.Match) -> str:
        label, url = m.group(1), _SITE_PREFIX.sub("", m.group(2)) or "/"
        valid = public_url(url) if not url.startswith(("mailto:", "tel:")) else url
        if valid:
            # The model tends to name a page after the document it read ("Swasti Gallery page" -> /about-us)
            return f"[{page_label(valid, label)}]({valid})"
        return m.group(0) if _allowed_external(url) else label

    def bare(m: re.Match) -> str:
        raw = m.group(0)
        trailing = raw[len(raw.rstrip(".,")):]
        url = _SITE_PREFIX.sub("", raw.rstrip(".,")) or "/"
        valid = public_url(url)
        link = f"[{page_label(valid, 'this page')}]({valid})" if valid else "the website"
        return link + trailing

    def url_line(m: re.Match) -> str:
        valid = public_url(_SITE_PREFIX.sub("", m.group(2)) or "/")
        if not valid:
            return ""
        return f"{m.group(1)}More: [{page_label(valid, 'details')}]({valid})"

    out = _SENTINEL.sub("", text or "")
    out = _URL_LINE.sub(url_line, out)
    out = re.sub(r"\n{3,}", "\n\n", out)
    out = _MD_LINK.sub(md, out)
    # Bare site URLs outside Markdown links
    out = re.sub(
        r"(?<!\()" + _BARE_SITE_URL.pattern,
        bare,
        out,
        flags=re.I,
    )

    removed = False

    def external(m: re.Match) -> str:
        nonlocal removed
        raw = m.group(0)
        url = raw.rstrip(".,;:")
        if _allowed_external(url):
            return raw
        removed = True
        return raw[len(url):]

    out = _EXTERNAL_URL.sub(external, out)
    if removed:
        out = re.sub(r"(?<=\S)[ \t]{2,}", " ", out)
        out = re.sub(r"(?<=\S)[ \t]+([.,;:])", r"\1", out)
    return out.strip()


def source_label(hit: dict, url: str) -> str:
    """Visitor-facing chip label; curated documents are named after the page they link to."""
    if (hit.get("table") or "") in _CURATED_TABLES and page_label(url):
        return page_label(url)
    return (hit.get("title") or "").strip() or page_label(url, "HCG Foundation")
