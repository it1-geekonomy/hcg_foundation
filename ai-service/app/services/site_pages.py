"""Indexes the visible text of the public website's static pages (fetched from the running frontend)."""

from __future__ import annotations

import logging
import re
import urllib.request
from html.parser import HTMLParser

from app.config import settings
from app.rag import constants as C

log = logging.getLogger(__name__)

# Every public page with text of its own. Listing pages (patient stories,
# events, projects) render only in the browser and hold nothing but CMS items,
# which are indexed from the CMS itself, as are /terms and /privacy.
SITE_PAGES = [
    "/",
    "/about-us",
    C.TEAM_URL,
    "/contact",
    C.PATIENT_AID_URL,
    C.AWARENESS_URL,
    C.PARTICIPATE_URL,
    C.CSR_URL,
    C.GRANTS_URL,
    C.TRANSPARENCY_URL,
    C.TESTIMONIALS_URL,
]

# "/" server-renders only the intro animation; the same sections are rendered at /home-content.
_FETCH_PATHS = {"/": "/home-content"}

_SKIP_TAGS = {
    "script", "style", "noscript", "svg", "template", "head",
    "nav", "header", "footer", "form", "button", "select", "dialog",
}
_SKIP_IDS = {"donate-form"}
_BLOCK_TAGS = {
    "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "div", "section",
    "article", "br", "tr", "td", "th", "blockquote", "figcaption",
}


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_tag: str | None = None
        self._skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if self._skip_tag:
            if tag == self._skip_tag:
                self._skip_depth += 1
            return
        if tag in _SKIP_TAGS or dict(attrs).get("id") in _SKIP_IDS:
            self._skip_tag, self._skip_depth = tag, 1
            return
        if tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if self._skip_tag:
            if tag == self._skip_tag:
                self._skip_depth -= 1
                if self._skip_depth == 0:
                    self._skip_tag = None
            return
        if tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self._skip_tag:
            self.parts.append(data)


def html_to_text(html: str) -> str:
    parser = _TextExtractor()
    parser.feed(html)
    text = re.sub(r"[ \t\u00a0]+", " ", "".join(parser.parts))
    lines: list[str] = []
    seen: set[str] = set()
    # Responsive layouts render mobile and desktop copies of the same section
    for line in (ln.strip() for ln in text.splitlines()):
        if len(line) < 3 or line in seen:
            continue
        seen.add(line)
        lines.append(line)
    return "\n".join(lines)


def _fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "HCG-Chatbot-Indexer"})
    with urllib.request.urlopen(req, timeout=90) as res:
        return res.read().decode("utf-8", errors="ignore")


def load_site_pages() -> tuple[list[dict], list[str]]:
    """Return (documents, paths that could not be fetched)."""
    base = (settings.site_crawl_url or "").rstrip("/")
    if not base:
        return [], []

    docs: list[dict] = []
    failed: list[str] = []
    for path in SITE_PAGES:
        try:
            text = html_to_text(_fetch(base + _FETCH_PATHS.get(path, path)))
        except Exception as exc:  # noqa: BLE001 - site down should not break the sync
            log.warning("Could not fetch %s%s: %s", base, path, exc)
            failed.append(path)
            continue
        if len(text) < 80:
            failed.append(path)
            continue
        title = C.PAGE_LABELS.get(path, path)
        docs.append(
            {
                "table": "site",
                "source_id": path,
                "title": title,
                "url": path,
                "category": "Page",
                "content": f"Title: {title}\nCategory: Page\nWebsite page: {path}\n\n{text}",
            }
        )
    return docs, failed
