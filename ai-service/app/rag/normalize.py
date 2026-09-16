import re

TYPO_MAP = {
    "donet": "donate",
    "donaiton": "donation",
    "patiant": "patient",
    "patiants": "patients",
    "hosiptal": "hospital",
    "forign": "foreign",
    "foregin": "foreign",
    "banglore": "bangalore",
    "trustis": "trustees",
    "trusties": "trustees",
    "anual": "annual",
    "reciept": "receipt",
    "intership": "internship",
    "internsip": "internship",
    "fcraa": "fcra",
}


def normalize_for_retrieval(text: str) -> str:
    """Fix domain typos for search only — do not change the displayed user message."""
    words = re.findall(r"[A-Za-z0-9']+|[^\sA-Za-z0-9]", text or "")
    rebuilt = ""
    for token in words:
        key = token.lower()
        fixed = TYPO_MAP.get(key, token)
        if re.fullmatch(r"[^\sA-Za-z0-9]", fixed):
            rebuilt += fixed
        else:
            if rebuilt and not rebuilt.endswith((" ", "(", "[")):
                rebuilt += " "
            rebuilt += fixed
    return rebuilt.strip()
