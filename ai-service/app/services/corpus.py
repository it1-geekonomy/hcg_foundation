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
            "url": C.PATIENT_AID_URL,
            "category": "Page",
            "content": (
                "Title: Patient Aid\nCategory: Page\n\n"
                "Patient Aid (also called Aasha Daan — The Gift of Hope) helps eligible, "
                "economically disadvantaged cancer patients, with a focus on pediatric patients "
                "and young adults, access treatment support through HCG Foundation. "
                "Referrals come through the treating hospital: doctors and Medical Social Workers "
                "identify financially challenged patients and start the assessment. "
                "For questions, families can "
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
            "url": C.DONATE_URL,
            "category": "Page",
            "content": (
                "Title: Donate Now\nCategory: Page\n\n"
                "How can I donate to HCG Foundation? Use the Donate Now option on the website. "
                "Eligible donations from Indian donors qualify for an 80G tax receipt. "
                "Do not invent cash, UPI, cheque, or monthly giving "
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
            "title": "Volunteer, Intern and Fundraise",
            "url": C.PARTICIPATE_URL,
            "category": "Page",
            "content": (
                "Title: Volunteer, Intern and Fundraise\nCategory: Page\n\n"
                "Individuals can get involved with HCG Foundation in three ways, described on the "
                "Get Involved > Participate page of the website: Fundraise, Volunteer, and Intern. "
                "HCG Foundation offers internship opportunities; apply through the Intern option on "
                "the Participate page. Volunteers can also sign up there. "
                f"For eligibility questions contact {C.OFFICIAL_EMAIL} / {C.OFFICIAL_PHONE}."
            ),
        },
        {
            "table": "static",
            "source_id": "events",
            "title": "Events",
            "url": C.EVENTS_URL,
            "category": "Page",
            "content": (
                "Title: Events\nCategory: Page\n\n"
                "Upcoming and past HCG Foundation events are listed on the Events page of the "
                "website (Resources > Events)."
            ),
        },
        {
            "table": "static",
            "source_id": "partnerships",
            "title": "Partnerships",
            "url": C.CSR_URL,
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
            "url": C.AWARENESS_URL,
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
                f"Organisation PAN: {C.OFFICIAL_PAN}. "
                "For foreign donations, refer to FCRA registration and the FCRA SBI bank account details. "
                "For Indian tax-exempt receipts, refer to 80G materials. "
                "Ask the website/CMS published certificate pages for the latest numbers and dates. "
                f"Contact {C.OFFICIAL_EMAIL} for verification copies."
            ),
        },
        {
            "table": "static",
            "source_id": "pan-details",
            "title": "HCG Foundation PAN",
            "url": "/about-us",
            "category": "Page",
            "content": (
                "Title: HCG Foundation PAN\nCategory: Page\n\n"
                f"Entity: HCG FOUNDATION\n"
                f"PAN: {C.OFFICIAL_PAN}\n"
                "If asked whether HCG Foundation has a PAN card or for the PAN number, "
                f"share {C.OFFICIAL_PAN}."
            ),
        },
        {
            "table": "static",
            "source_id": "fcra-bank-details",
            "title": "FCRA Bank Account Details",
            "url": "/about-us",
            "category": "Page",
            "content": (
                "Title: FCRA Bank Account Details\nCategory: Page\n\n"
                "For foreign / overseas / NRI / FCRA remittances:\n"
                f"Account holder: {C.FCRA_ACCOUNT_HOLDER}\n"
                f"Bank: {C.FCRA_BANK_NAME}\n"
                f"Account number: {C.FCRA_ACCOUNT_NUMBER}\n"
                f"IFSC: {C.FCRA_IFSC}\n"
                f"SWIFT: {C.FCRA_SWIFT}\n"
                f"Branch: {C.FCRA_BRANCH}\n"
                "Share these when visitors ask for bank account details for foreign payment. "
                "For domestic Indian donations, prefer Donate Now on the website."
            ),
        },
        {
            "table": "static",
            "source_id": "mission-overview",
            "title": "Programs and Initiatives",
            "url": "/about-us",
            "category": "Page",
            "content": (
                "Title: Programs and Initiatives\nCategory: Page\n\n"
                "What programs does HCG Foundation run? What projects and initiatives does it have?\n"
                "HCG Foundation supports cancer patients, families and communities through:\n"
                f"- Patient Aid ({C.PATIENT_AID_URL}) — financial support for patients / "
                "Aasha Daan (The Gift of Hope): financial assistance for economically disadvantaged "
                "cancer patients, with a focus on children and young adults. HCG hospitals give "
                "approved patients a discount and the Foundation pays the discounted bill.\n"
                f"- Awareness & Screening Camps ({C.AWARENESS_URL}) — cancer screening and awareness "
                "camps focused on breast, oral and cervical cancers; Mobile Screening that takes "
                "screening to underserved and remote areas; Student Outreach healthy-habits campaigns "
                "for 4th–6th grade students in government schools since 2018; HPV vaccination.\n"
                f"- Swasthi Art Gallery ({C.SWASTI_URL}) — art gallery and art therapy "
                "initiative since 2007 at HCG hospitals; proceeds support cancer patients.\n"
                f"- Pink Hope Support Group ({C.PINK_HOPE_URL}).\n"
                f"- Research & Innovation ({C.RESEARCH_URL}).\n"
                "- Counselling for patients and families (About Us page).\n"
                f"- Projects ({C.PROJECTS_URL}) — funded projects such as cancer diagnostic support "
                "and ventilator support.\n"
                f"Ways to get involved: Participate ({C.PARTICIPATE_URL}) to fundraise, volunteer or "
                f"intern; CSR Partnership ({C.CSR_URL}); Grants & Philanthropy "
                f"({C.GRANTS_URL})."
            ),
        },
        {
            "table": "static",
            "source_id": "founder",
            "title": f"{C.FOUNDER_NAME} — {C.FOUNDER_ROLE}",
            "url": C.TRUSTEES_URL,
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
        lower = line.lower().strip()
        # Strip staff/internal proposal noise — keep official org PAN / FCRA bank lines.
        if any(
            k in lower
            for k in (
                "contact person:",
                "phone number:",
                "submitted to:",
                "cancelled cheque",
            )
        ):
            continue
        # Drop non-FCRA bank slip rows from partner proposals
        if (
            any(k in lower for k in ("account no", "a/c no", "beneficiary bank", "ifsc code"))
            and "fcra" not in lower
            and "sbin0000691" not in lower
            and C.FCRA_ACCOUNT_NUMBER not in line
        ):
            continue

        def repl(m: re.Match) -> str:
            digits = re.sub(r"\D", "", m.group(0))
            if digits in _OFFICIAL_VARIANTS or digits.endswith("8046607760"):
                return C.OFFICIAL_PHONE
            return "[contact via website]"

        lines.append(_MOBILE_RE.sub(repl, line))
    return "\n".join(lines).strip()


def _title_from_txt(path: Path) -> tuple[str, str, str]:
    stem = path.stem.replace("_", " ").replace("-", " ").title()
    lower = stem.lower()
    category = "Page"
    url = "/about-us"
    if "newsletter" in lower:
        category = "Newsletter"
        url = C.TRANSPARENCY_URL
    elif "patient" in lower:
        url = C.PATIENT_AID_URL
    elif "donate" in lower:
        url = C.DONATE_URL
    elif "financial" in lower:
        url = C.TRANSPARENCY_URL
    elif "trustee" in lower or "founder" in lower:
        url = C.TRUSTEES_URL
    elif "contact" in lower:
        url = "/contact"
    return stem, category, url


def load_knowledge_files() -> list[dict]:
    root = Path(settings.knowledge_dir)
    if not root.exists():
        return []

    docs: list[dict] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".txt", ".md"}:
            continue
        raw = path.read_text(encoding="utf-8", errors="ignore")
        cleaned = sanitize_knowledge_text(raw)
        if not cleaned:
            continue
        title, category, url = _title_from_txt(path)
        docs.append(
            {
                "table": "knowledge",
                "source_id": f"public/{path.name}",
                "title": title,
                "url": url,
                "category": category,
                "content": f"Title: {title}\nCategory: {category}\n\n{cleaned}",
            }
        )
    return docs


def load_geekonomy_documents() -> list[dict]:
    """Whitelist PDF/DOCX/PPTX from knowledge/source-docs."""
    from app.services import doc_extract
    from app.services.knowledge_whitelist import (
        MAX_CHARS_PER_DOC,
        classify_doc,
        is_allowed_knowledge_file,
    )

    root = Path(settings.geekonomy_docs_dir)
    if not root.exists():
        return []

    docs: list[dict] = []
    for path in sorted(root.rglob("*")):
        if not is_allowed_knowledge_file(path, root):
            continue
        raw = doc_extract.extract_file(path)
        cleaned = sanitize_knowledge_text(raw)
        if len(cleaned) < 40:
            # Likely scanned image PDF with no text layer — skip quietly
            continue
        if len(cleaned) > MAX_CHARS_PER_DOC:
            cleaned = (
                cleaned[:MAX_CHARS_PER_DOC]
                + "\n\n[Document truncated for chatbot indexing.]"
            )
        title, category, url = classify_doc(path)
        rel = path.relative_to(root).as_posix()
        docs.append(
            {
                "table": "knowledge",
                "source_id": f"geekonomy/{rel}",
                "title": title,
                "url": url,
                "category": category,
                "content": (
                    f"Title: {title}\nCategory: {category}\nSource file: {rel}\n\n"
                    f"{cleaned}"
                ),
            }
        )
    return docs


def load_corpus_documents() -> list[dict]:
    return _static_documents() + load_knowledge_files() + load_geekonomy_documents()
