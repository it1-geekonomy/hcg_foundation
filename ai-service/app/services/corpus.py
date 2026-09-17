"""Static synthetic pages + curated knowledge documents for RAG."""

from __future__ import annotations

import re
from pathlib import Path

from app.config import settings
from app.rag import constants as C


def _static_documents() -> list[dict]:
    return [
        {
            "table": "static",
            "source_id": "home",
            "title": "Home",
            "url": "/",
            "category": "Page",
            "content": (
                "Title: Home\nCategory: Page\n\n"
                "HCG Foundation is a charitable trust focused on cancer care, "
                "patient aid, awareness, and community programs in India."
            ),
        },
        {
            "table": "static",
            "source_id": "about-us",
            "title": "About Us",
            "url": "/about-us",
            "category": "Page",
            "content": (
                "Title: About Us\nCategory: Page\n\n"
                f"HCG Foundation works to support cancer patients and families. "
                f"Founder and Managing Trustee: {C.FOUNDER_NAME}. "
                f"Contact: {C.OFFICIAL_EMAIL}, {C.OFFICIAL_PHONE}. "
                f"Address: {C.OFFICIAL_ADDRESS}."
            ),
        },
        {
            "table": "static",
            "source_id": "patient-aid",
            "title": "Patient Aid",
            "url": "/patient-aid",
            "category": "Page",
            "content": (
                "Title: Patient Aid\nCategory: Page\n\n"
                "Patient Aid helps eligible cancer patients access treatment support "
                "through HCG Foundation. Application guidance is published on the website. "
                "How do I apply for Patient Aid? Review the Patient Aid information and "
                f"contact {C.OFFICIAL_EMAIL} or {C.OFFICIAL_PHONE}. "
                "Sponsorship / adopt-a-patient inquiries can also be directed to the same contacts. "
                "The Foundation is a trust and partners with HCG hospital facilities for care — "
                "it does not claim to own the hospitals."
            ),
        },
        {
            "table": "static",
            "source_id": "donate-now",
            "title": "Donate Now",
            "url": "/donate",
            "category": "Page",
            "content": (
                "Title: Donate Now\nCategory: Page\n\n"
                "How can I donate to HCG Foundation? Use the Donate Now option on the website. "
                "Eligible Indian donations may receive an 80G tax receipt as described in "
                "registration materials. Do not invent cash, UPI, cheque, or monthly giving "
                "unless separately published. "
                f"Contact: {C.OFFICIAL_EMAIL}, {C.OFFICIAL_PHONE}. Address: {C.OFFICIAL_ADDRESS}."
            ),
        },
        {
            "table": "static",
            "source_id": "contact-us",
            "title": "Contact Us",
            "url": "/contact",
            "category": "Page",
            "content": (
                "Title: Contact Us\nCategory: Page\n\n"
                f"Email: {C.OFFICIAL_EMAIL}\n"
                f"Phone: {C.OFFICIAL_PHONE}\n"
                f"Address: {C.OFFICIAL_ADDRESS}"
            ),
        },
        {
            "table": "static",
            "source_id": "internship",
            "title": "Internship Program",
            "url": "/internship",
            "category": "Page",
            "content": (
                "Title: Internship Program\nCategory: Page\n\n"
                "HCG Foundation offers internship opportunities as published on the website. "
                "For internship applications and eligibility, use the Internship Program page "
                f"or contact {C.OFFICIAL_EMAIL} / {C.OFFICIAL_PHONE}."
            ),
        },
        {
            "table": "static",
            "source_id": "partnerships",
            "title": "Partnerships",
            "url": "/partnerships",
            "category": "Page",
            "content": (
                "Title: Partnerships\nCategory: Page\n\n"
                "Organizations can explore CSR and partnership opportunities with HCG Foundation. "
                f"Reach out via {C.OFFICIAL_EMAIL} or {C.OFFICIAL_PHONE}."
            ),
        },
        {
            "table": "static",
            "source_id": "awareness",
            "title": "Awareness and Prevention",
            "url": "/awareness",
            "category": "Page",
            "content": (
                "Title: Awareness and Prevention\nCategory: Page\n\n"
                "HCG Foundation runs awareness and prevention initiatives related to cancer care, "
                "including community screening and education programs as published on the site."
            ),
        },
        {
            "table": "static",
            "source_id": "registration-summary",
            "title": "Registration Certificates Summary",
            "url": "/about-us",
            "category": "Page",
            "content": (
                "Title: Registration Certificates Summary\nCategory: Page\n\n"
                "HCG Foundation maintains charitable registrations commonly referenced as "
                "12A, 80G, CSR-1, FCRA, and Darpan where applicable. "
                "For foreign donations, refer to FCRA registration materials — not only Donate Now. "
                "For Indian tax-exempt receipts, refer to 80G materials. "
                "Ask the website/CMS published certificate pages for the latest numbers and dates. "
                f"Contact {C.OFFICIAL_EMAIL} for verification copies."
            ),
        },
        {
            "table": "static",
            "source_id": "mission-overview",
            "title": "Mission and Programs Overview",
            "url": "/about-us",
            "category": "Page",
            "content": (
                "Title: Mission and Programs Overview\nCategory: Page\n\n"
                "HCG Foundation’s mission focuses on cancer care support: Patient Aid, "
                "awareness and prevention, diagnostics support, and related community programs. "
                "Published materials may mention psychological / counseling support as part of "
                "holistic patient care. Programs and projects listed in the CMS should be treated "
                "as the source of truth for current initiatives."
            ),
        },
        {
            "table": "static",
            "source_id": "founder",
            "title": f"{C.FOUNDER_NAME} — {C.FOUNDER_ROLE}",
            "url": "/about/our-team",
            "category": "Trustee",
            "designation": C.FOUNDER_ROLE,
            "content": (
                f"Title: {C.FOUNDER_NAME}\n"
                f"Category: Trustee\n"
                f"Designation: {C.FOUNDER_ROLE}\n\n"
                f"{C.FOUNDER_NAME} is the {C.FOUNDER_ROLE} of HCG Foundation."
            ),
        },
    ]


_MOBILE_RE = re.compile(r"(?:\+91[-\s]?)?[6-9]\d{9}")
_OFFICIAL_VARIANTS = {
    "08046607760",
    "080-4660-7760",
    "+918046607760",
    "+91-80-4660-7760",
    "918046607760",
}


def sanitize_knowledge_text(text: str) -> str:
    lines = []
    for line in (text or "").splitlines():
        lower = line.lower()
        if any(
            k in lower
            for k in (
                "contact person:",
                "phone number:",
                "submitted to:",
                "cancelled cheque",
                "bank account",
                "pan number",
                "pan:",
            )
        ):
            continue

        def repl(m: re.Match) -> str:
            digits = re.sub(r"\D", "", m.group(0))
            if digits in _OFFICIAL_VARIANTS or digits.endswith("8046607760"):
                return C.OFFICIAL_PHONE
            return "[contact via website]"

        lines.append(_MOBILE_RE.sub(repl, line))
    return "\n".join(lines).strip()


def load_knowledge_files() -> list[dict]:
    root = Path(settings.knowledge_dir)
    if not root.exists():
        return []

    docs: list[dict] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".txt", ".md"}:
            # PDF/DOCX/PPTX can be added later with optional deps
            continue
        raw = path.read_text(encoding="utf-8", errors="ignore")
        cleaned = sanitize_knowledge_text(raw)
        if not cleaned:
            continue
        stem = path.stem.replace("_", " ").replace("-", " ").title()
        category = "Page"
        lower = stem.lower()
        if any(k in lower for k in ("80g", "12a", "fcra", "csr", "darpan", "registration")):
            category = "Page"
        elif "newsletter" in lower:
            category = "Newsletter"
        docs.append(
            {
                "table": "knowledge",
                "source_id": path.as_posix(),
                "title": stem,
                "url": "/about-us",
                "category": category,
                "content": f"Title: {stem}\nCategory: {category}\n\n{cleaned}",
            }
        )
    return docs


def load_corpus_documents() -> list[dict]:
    return _static_documents() + load_knowledge_files()
