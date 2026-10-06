"""Keeps chatbot links pointing at pages that actually exist on the public website."""

from __future__ import annotations

import re

from app.rag import constants as C

_SITE_PREFIX = re.compile(r"^https?://(?:www\.)?hcgfoundation\.org", re.I)
_MD_LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
_BARE_SITE_URL = re.compile(r"https?://(?:www\.)?hcgfoundation\.org[^\s)\]]*", re.I)
# The model sometimes imitates the NO_ANSWER_FOUND sentinel with variants of its own
_SENTINEL = re.compile(r"\bNO_[A-Z_]+_FOUND\b[.:]?\s*")
# "URL: /path" lines copied from the context format instead of a proper link
_URL_LINE = re.compile(r"(?im)^([ \t]*(?:[-*]\s+)?)(?:\*\*)?URL:?(?:\*\*)?:?\s*(\S+?)\s*$")

# Rows synced from the CMS carry their own record titles (story names, events...).
_CURATED_TABLES = {"static", "knowledge", "site"}


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
    if u in C.PAGE_LABELS:
        return u
    for prefix in C.DETAIL_PREFIXES:
        slug = u[len(prefix):] if u.startswith(prefix) else ""
        if slug and "/" not in slug and " " not in slug:
            return u
    return None


def clean_answer(text: str) -> str:
    """Make links in a generated answer relative and valid; unlink anything the site doesn't have."""

    def md(m: re.Match) -> str:
        label, url = m.group(1), _SITE_PREFIX.sub("", m.group(2)) or "/"
        valid = public_url(url) if not url.startswith(("mailto:", "tel:")) else url
        if valid:
            # The model tends to name a page after the document it read ("Swasti Gallery page" -> /about-us)
            return f"[{C.PAGE_LABELS.get(valid, label)}]({valid})"
        return label if not url.startswith("http") else m.group(0)

    def bare(m: re.Match) -> str:
        raw = m.group(0)
        trailing = raw[len(raw.rstrip(".,")):]
        url = _SITE_PREFIX.sub("", raw.rstrip(".,")) or "/"
        valid = public_url(url)
        link = f"[{C.PAGE_LABELS.get(valid, 'this page')}]({valid})" if valid else "the website"
        return link + trailing

    def url_line(m: re.Match) -> str:
        valid = public_url(_SITE_PREFIX.sub("", m.group(2)) or "/")
        if not valid:
            return ""
        return f"{m.group(1)}More: [{C.PAGE_LABELS.get(valid, 'details')}]({valid})"

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
    return out.strip()


def source_label(hit: dict, url: str) -> str:
    """Visitor-facing chip label; curated documents are named after the page they link to."""
    if (hit.get("table") or "") in _CURATED_TABLES and url in C.PAGE_LABELS:
        return C.PAGE_LABELS[url]
    return (hit.get("title") or "").strip() or C.PAGE_LABELS.get(url, "HCG Foundation")
