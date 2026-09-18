"""Whitelist of source-docs files safe/useful for the public chatbot."""

from __future__ import annotations

import re
from pathlib import Path

# Match against posix-relative path lowercased under the source-docs root.
_ALLOW: list[re.Pattern[str]] = [
    re.compile(p, re.I)
    for p in (
        r"about_hcg_foundation_2026\.pptx$",
        r"abb_hcgf_patient.?aid.?proposal\.docx$",
        r"hcgf_patient.?aid.?proposal",
        r"hcgf cancer care diagnostic",
        r"hcgf hpv vaccination",
        r"hcgf_oral cancer screening",
        r"hcgf_ventilator\.docx$",
        r"12a - incorporation certificate\.pdf$",
        r"certificates of renewal\s+12a\.pdf$",
        r"certificates of renewal\s+80g\.pdf$",
        r"80g hcg-foundation\.pdf$",
        r"csr registration certificate\.pdf$",
        r"darpan hcgf\.pdf$",
        r"fcra registration-certificate\.pdf$",
        r"trust registration certificate 12a\.pdf$",
        r"gst declaration\.pdf$",
        r"gst non applicability\.pdf$",
        r"newsletter/.+\.(pdf|docx)$",
        r"audit reports/financials fy.+\.pdf$",
    )
]

# Hard deny even if somehow matched
_DENY: list[re.Pattern[str]] = [
    re.compile(p, re.I)
    for p in (
        r"cancelled cheque",
        r"pan card",
        r"fcra bank",
        r"poa for",
        r"trust deed",
        r"trust resolution",
        r"further resolved",
        r"supplimental trust",
        r"form\s*10b",
        r"form\s*10bb",
        r"form10b",
        r"certificate of merit",
        r"leadership award",
    )
]

# Cap extracted body so huge PPTX/newsletters don't blow the index
MAX_CHARS_PER_DOC = 40_000


def is_allowed_knowledge_file(path: Path, root: Path) -> bool:
    if not path.is_file():
        return False
    if path.suffix.lower() not in {".pdf", ".docx", ".pptx", ".txt", ".md"}:
        return False
    try:
        rel = path.relative_to(root).as_posix().lower()
    except ValueError:
        return False
    if any(p.search(rel) for p in _DENY):
        return False
    return any(p.search(rel) for p in _ALLOW)


def classify_doc(path: Path) -> tuple[str, str, str]:
    """Return (title, category, url) for chatbot metadata."""
    name = path.stem.replace("_", " ").replace("-", " ").strip()
    title = re.sub(r"\s+", " ", name)
    lower = path.as_posix().lower()

    if "newsletter" in lower:
        return title, "Newsletter", "/resources"
    if "financials" in lower:
        return title, "Page", "/resources/annual-reports"
    if any(
        k in lower
        for k in ("12a", "80g", "fcra", "csr", "darpan", "gst", "registration")
    ):
        return title, "Page", "/about-us"
    if "patient aid" in lower:
        return title, "Page", "/patient-aid"
    if any(
        k in lower
        for k in (
            "diagnostic",
            "hpv",
            "oral cancer",
            "ventilator",
            "about_hcg",
            "about hcg",
        )
    ):
        return title, "Project", "/resources/projects"
    return title, "Page", "/about-us"
