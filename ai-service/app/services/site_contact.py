"""The Foundation's phone, email and address as published on the website's Contact page.

Read on every full sync, so a contact change on the website reaches the chatbot
without a code change. The values in ``constants`` are only a fallback for when
the page can't be read; anything written with them (prompts, curated documents,
quick answers) is rewritten to the published values by ``apply``.
"""

from __future__ import annotations

import json
import logging
import re
import threading

from app.database import SessionLocal
from app.models.document_chunk import RagMeta
from app.rag import constants as C

log = logging.getLogger(__name__)

_META_KEY = "site_contact"
_CONTACT_PAGE = "/contact"

_PHONE = re.compile(r"\bPhone(?:\s+Numbers?)?\s*:?\s*(\+?\d[\d\s\-()]{7,}\d)", re.I)
_EMAIL = re.compile(r"\bE-?mail\s*:?\s*([\w.+-]+@[\w-]+(?:\.[\w-]+)+)", re.I)
_ADDRESS = re.compile(r"\bAddress\s*:?\s*\n?([^\n]+)", re.I)
_PIN = re.compile(r"\b\d{6}\b")

_state: dict | None = None
_lock = threading.Lock()


def _digits(phone: str) -> str:
    return re.sub(r"\D", "", phone or "")


def _loose(text: str) -> str:
    return re.sub(r"\W", "", (text or "").lower())


def parse(page_text: str) -> dict:
    """Extract whichever contact fields the page text clearly states."""
    found: dict[str, str] = {}
    if m := _PHONE.search(page_text):
        phone = " ".join(m.group(1).split())
        if 10 <= len(_digits(phone)) <= 13:
            found["phone"] = phone
    if m := _EMAIL.search(page_text):
        found["email"] = m.group(1)
    if m := _ADDRESS.search(page_text):
        line = m.group(1)
        # Responsive layouts render the address more than once on the same line
        end = line.find("India")
        address = (line[: end + len("India")] if end >= 0 else line).strip(" ,")
        if _PIN.search(address) and len(address) <= 200:
            # Same address as the fallback: keep the fallback's punctuation
            found["address"] = C.OFFICIAL_ADDRESS if _loose(address) == _loose(C.OFFICIAL_ADDRESS) else address
    return found


def refresh() -> dict:
    """Re-read the Contact page; keeps previously published values for fields it can't read."""
    global _state
    from app.services import site_pages, site_routes

    try:
        status, body, _ = site_routes._get(_CONTACT_PAGE)
    except Exception as exc:  # noqa: BLE001 - site down must not break the sync
        log.warning("Could not read the Contact page: %s", exc)
        return current()
    if status != 200:
        log.warning("Contact page returned HTTP %s; keeping previous contact details", status)
        return current()

    found = parse(site_pages.html_to_text(body))
    state = {**(_load() or {}), **found}
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
    return current()


def _load() -> dict:
    global _state
    if _state is not None:
        return _state
    with _lock:
        if _state is None:
            db = SessionLocal()
            try:
                row = db.get(RagMeta, _META_KEY)
                _state = json.loads(row.value) if row else _from_index()
            except Exception:  # noqa: BLE001 - e.g. DB not migrated yet
                _state = {}
            finally:
                db.close()
    return _state


def _from_index() -> dict:
    """Contact page text from the last sync that could read the website."""
    from app.services import vector_store

    for doc in vector_store.documents("site"):
        if doc["source_id"] == _CONTACT_PAGE:
            return parse(doc["content"])
    return {}


def current() -> dict:
    state = _load()
    return {
        "phone": state.get("phone") or C.OFFICIAL_PHONE,
        "email": state.get("email") or C.OFFICIAL_EMAIL,
        "address": state.get("address") or C.OFFICIAL_ADDRESS,
    }


def _phone_pattern(phone: str) -> re.Pattern[str]:
    """Any common way of writing ``phone``: +91-80-..., 080 ..., 91..., with or without separators."""
    local = _digits(phone)[-10:]
    sep = r"[\s\-.]*"
    return re.compile(r"(?<!\d)(?:\+?91" + sep + r"|0)?" + sep.join(local) + r"(?!\d)")


def apply(text: str) -> str:
    """Rewrite fallback contact details in ``text`` to the ones the website publishes."""
    if not text:
        return text
    now = current()
    out = text

    if _digits(now["phone"])[-10:] != _digits(C.OFFICIAL_PHONE)[-10:]:
        old = _phone_pattern(C.OFFICIAL_PHONE)
        tel = "tel:+91" + _digits(now["phone"])[-10:]
        out = re.sub(r"tel:" + old.pattern, tel, out)
        out = old.sub(now["phone"], out)
    if now["email"].lower() != C.OFFICIAL_EMAIL.lower():
        out = re.sub(re.escape(C.OFFICIAL_EMAIL), now["email"], out, flags=re.I)
    if now["address"] != C.OFFICIAL_ADDRESS:
        out = out.replace(C.OFFICIAL_ADDRESS, now["address"])

    # Text that listed the old and the new number side by side now repeats one
    for value in (now["phone"], now["email"]):
        v = re.escape(value)
        out = re.sub(rf"{v}(\s*(?:,|/|or|and)\s*{v})+", value, out)
    return out
