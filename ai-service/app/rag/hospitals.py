"""Which HCG hospitals Foundation patients are treated at, from what the published content mentions.

No official list is published, but patient stories and newsletters name the HCG
hospitals where patients were treated. Those mentions are scattered across dozens
of documents, too many for normal retrieval to hand the model, so they are
collected here straight from the index (always reflecting what is published now).
"""

from __future__ import annotations

import re

from app.rag import constants as C
from app.services import vector_store

# (display name, pattern). Patterns only match a hospital reference ("HCG Hospital, Nagpur",
# "HCG Hubli", "HCG Hospitals in Ahmedabad"), never "HCG Foundation, ... Bangalore".
_PREFIX = r"\bHCG(?:\s+(?:Hospitals?|Cancer\s+(?:Hospital|Cent(?:re|er))))?\s*[,(]?\s*(?:in\s+|at\s+)?"
_CITIES = [
    ("HCG Bengaluru", r"Bengaluru|Bangalore|Malleshwaram|MSR\b|KR\s+(?:Road|Hospital)\b"),
    ("HCG Ranchi (HCG Abdur Razzaque Ansari Cancer Hospital)", r"Ranchi"),
    ("HCG Hubballi", r"Hubli|Hubballi"),
    ("HCG Kalaburagi", r"Gulbarga|Kalaburagi"),
    ("HCG Nagpur", r"Nagpur"),
    ("HCG Ahmedabad", r"Ahmedabad"),
    ("HCG Mysuru (Bharath Cancer HCG Hospital)", r"Mysuru|Mysore"),
    ("HCG Belagavi", r"Belgaum|Belagavi"),
    ("HCG Shivamogga", r"Shimoga|Shivamogga"),
    ("HCG Ballari", r"Bellary|Ballari"),
    ("HCG Mangaluru", r"Mangalore|Mangaluru"),
    ("HCG Mumbai", r"Mumbai"),
    ("HCG Nashik", r"Nashik"),
    ("HCG Kolkata", r"Kolkata"),
    ("HCG Cuttack", r"Cuttack"),
    ("HCG Bhubaneswar", r"Bhubaneswar"),
    ("HCG Vadodara", r"Vadodara|Baroda"),
    ("HCG Rajkot", r"Rajkot"),
    ("HCG Bhavnagar", r"Bhavnagar"),
    ("HCG Jaipur", r"Jaipur"),
    ("HCG Hyderabad", r"Hyderabad"),
    ("HCG Vijayawada", r"Vijayawada"),
    ("HCG Visakhapatnam", r"Visakhapatnam|Vizag"),
    ("HCG Chennai", r"Chennai"),
]
_HOSPITALS = [(name, re.compile(_PREFIX + rf"\(?(?:{cities})", re.I)) for name, cities in _CITIES]
_HOSPITALS.insert(1, ("HCG Ranchi (HCG Abdur Razzaque Ansari Cancer Hospital)",
                      re.compile(r"Abdu[lr]\s+Razz?aq?ue\s+Ansari", re.I)))
_HOSPITALS.append(("HCG Mysuru (Bharath Cancer HCG Hospital)",
                   re.compile(r"Bharath\s+Cancer\s+HCG|HCG\s+Bharath", re.I)))

_EXAMPLES = 2


def _mentions() -> dict[str, list[str]]:
    """Hospital name -> names of published patient stories (or updates) that mention it."""
    found: dict[str, dict[str, tuple[str, bool]]] = {}
    for chunk in vector_store.chunks_matching(r"\mHCG\M"):
        if chunk["table"] == "static":
            continue
        for name, pattern in _HOSPITALS:
            if pattern.search(chunk["content"]):
                doc = f"{chunk['table']}#{chunk['source_id']}"
                found.setdefault(name, {})[doc] = (chunk["title"], chunk["table"] == "patient_stories")
    return {
        name: sorted(title for title, is_story in docs.values() if is_story and title)
        for name, docs in sorted(found.items(), key=lambda kv: -len(kv[1]))
    }


def hospital_context() -> dict | None:
    """A context block for any hospital question, so every phrasing gets the same facts."""
    mentions = _mentions()
    if not mentions:
        return None
    lines = [
        "HCG has a pan-India network of hospitals for cancer treatment. HCG Foundation is a separate "
        "charitable trust and does not own these hospitals: patients approved for Patient Aid are "
        "treated at HCG hospitals, which give them a discount, and the Foundation pays the "
        "discounted bill.",
        "An official list of the hospitals is not published on the website. Published patient "
        "stories and Foundation updates mention patients treated at these HCG hospitals:",
    ]
    for name, stories in mentions.items():
        examples = f" (patient stories: {', '.join(stories[:_EXAMPLES])})" if stories else ""
        lines.append(f"- {name}{examples}")
    lines.append(
        f"For the complete list of hospitals, contact {C.OFFICIAL_EMAIL} or {C.OFFICIAL_PHONE}."
    )
    return {
        "id": "hospital-mentions",
        "content": "\n".join(lines),
        "title": "HCG hospitals where Foundation patients are treated",
        "url": C.PATIENT_STORIES_URL,
        "category": "Page",
        "table": "knowledge",
        "source_id": "hospital-mentions",
        "parent_source_id": "knowledge#hospital-mentions",
        "designation": "",
        "slug": "",
        "chunk_index": None,
        "expanded": True,
    }
