"""Trustee and team answers built from the published CMS rows.

The website shows them in the Trustees and Team sections of the About Us page.
Retrieval hands the model only a few chunks, so it can neither list everyone nor
reliably pick the right person ("who is ajaykumar"); the index has every
published member, so these questions are answered from it directly.
"""

from __future__ import annotations

import re
from difflib import SequenceMatcher

from app.rag import constants as C
from app.services import vector_store
from app.services.embeddings import chat_complete

_TYPE = re.compile(r"^Type:\s*(\w+)", re.M | re.I)
_BIO = re.compile(r"^Content:\s*", re.M)
_HONORIFICS = {"dr", "mr", "mrs", "ms", "prof", "smt", "shri", "sri"}

_TRUSTEE_WORDS = re.compile(
    r"\btrust(?:ee|ees|ies|is)\b|\bboard\b|\bgoverning\b|\bleadership\b|\bwho\s+runs\b", re.I
)
_TEAM_WORDS = re.compile(
    r"\bteams?\b|\bstaff\b|\bemployees?\b|\bwho\s+works?\b|\bpeople\s+(?:who\s+)?work", re.I
)
_HEADCOUNT = re.compile(
    r"\bhow\s+many\b.*(?:\bstaff\b|\bemploy|\bteam\b|\bpeople\s+(?:who\s+)?work)"
    r"|\b(?:staff|employee|team)\s+(?:count|size|strength)\b|\bheadcount\b|\bworkforce\b",
    re.I,
)
_FOUNDER = re.compile(r"\bfounder\b|\bwho\s+(?:founded|started|established)\b", re.I)
_PERSON_CUE = re.compile(
    r"\bwho\b|\babout\b|\bprofile\b|\brole\b|\bdesignation\b|\bdetails?\b|\bbio\b|\bwhat\s+does\b", re.I
)
_LIST_CUE = re.compile(
    r"\blist\b|\bnames?\b|\bwho\s+(?:are|is\s+in|is\s+on)\b|\bmembers?\b|\bgive\s+me\b|\bshow\b"
    r"|\btell\s+me\s+about\b",
    re.I,
)
# Words that may surround "team"/"trustees" in a bare request such as "HCG Teams".
_FILLER = {
    "hcg", "foundation", "foundations", "the", "a", "an", "our", "your", "its", "of", "all",
    "and", "please", "pls", "kindly", "give", "me", "show", "list", "names", "name", "members",
    "member", "details", "detail", "info", "information", "about", "who", "are", "is", "in",
    "on", "at", "for", "what", "tell", "whole", "full", "complete", "entire", "current", "with",
    "their", "designations", "designation", "roles", "role", "s", "you", "how", "many",
    "total", "number", "count", "there",
}


def _members() -> list[dict]:
    members = []
    for doc in vector_store.documents("teams"):
        if not doc["title"]:
            continue
        kind = _TYPE.search(doc["content"])
        trustee = doc["category"] == "Trustee" or bool(kind and kind.group(1).lower() == "trustee")
        bio = _BIO.split(doc["content"], maxsplit=1)
        members.append(
            {
                "name": doc["title"],
                "role": re.sub(r",?\s*HCG Foundation\s*$", "", doc["designation"], flags=re.I).strip(),
                "trustee": trustee,
                "bio": re.sub(r"\s+", " ", bio[1]).strip() if len(bio) > 1 else "",
            }
        )
    founder_tokens = set(_name_tokens(C.FOUNDER_NAME))
    if not any(founder_tokens & set(_name_tokens(m["name"])) and m["trustee"] for m in members):
        members.append({"name": C.FOUNDER_NAME, "role": C.FOUNDER_ROLE, "trustee": True, "bio": ""})
    # Founder first, then A-Z (the index has no display order)
    members.sort(key=lambda m: ("founder" not in m["role"].lower(), m["name"].lower()))
    return members


def _section(member: dict) -> tuple[str, str]:
    url = C.TRUSTEES_URL if member["trustee"] else C.TEAM_URL
    return C.PAGE_LABELS[url], url


def _name_tokens(name: str) -> list[str]:
    return [t for t in re.findall(r"[a-z]+", name.lower()) if len(t) >= 3 and t not in _HONORIFICS]


def _same_word(name_token: str, word: str) -> bool:
    if name_token == word:
        return True
    return len(name_token) >= 5 and len(word) >= 5 and SequenceMatcher(None, name_token, word).ratio() >= 0.84


def _named_members(question: str, members: list[dict]) -> list[dict]:
    words = re.findall(r"[a-z]+", question.lower())
    scored = []
    for m in members:
        tokens = _name_tokens(m["name"])
        hits = [t for t in tokens if any(_same_word(t, w) for w in words)]
        if hits:
            # "Ajaikumar" alone means Dr. B.S. Ajaikumar more than Anjali Ajaikumar Rossi
            scored.append((10 * len(hits) + (5 if tokens[-1] in hits else 0), m))
    if not scored:
        return []
    best = max(score for score, _ in scored)
    return [m for score, m in scored if score == best]


def _bio_summary(question: str, member: dict) -> str:
    try:
        text = chat_complete(
            [
                {"role": "system", "content": "You write short, factual answers for HCG Foundation's website assistant."},
                {
                    "role": "user",
                    "content": (
                        f"Visitor asked: {question}\n\n"
                        f"Person: {member['name']}\n"
                        f"Role at HCG Foundation: {member['role'] or ('Trustee' if member['trustee'] else 'Team member')}\n"
                        f"Published profile:\n{member['bio'][:2500]}\n\n"
                        "Write 2-3 sentences in the third person about this person, using only the "
                        f"profile. Start with \"{member['name']} is\". No links, headings or contact details."
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=220,
        ).strip()
    except Exception:
        text = ""
    if text:
        return text
    return " ".join(re.split(r"(?<=[.!?])\s+", member["bio"])[:2])


def _person_answer(question: str, member: dict) -> dict:
    label, url = _section(member)
    role = member["role"]
    if len(member["bio"]) >= 40:
        intro = _bio_summary(question, member)
    elif member["trustee"]:
        role = role or "Trustee"
        article = "the" if re.search(r"founder|managing|chair", role, re.I) else "a"
        intro = (
            f"{member['name']} is {article} {role} of HCG Foundation. "
            "No further profile details are published on the website."
        )
    else:
        detail = f", working as {role}" if role else ""
        intro = (
            f"{member['name']} is part of the HCG Foundation team{detail}. "
            "No further profile details are published on the website."
        )
    return {
        "answer": f"{intro}\n\nSee the [{label}]({url}) section on the About Us page.",
        "sources": [{"title": label, "url": url}],
    }


def _bullet(member: dict) -> str:
    return f"- {member['name']} — {member['role']}" if member["role"] else f"- {member['name']}"


def list_answer(trustees: bool = True, team: bool = True) -> dict | None:
    members = _members()
    board = [m for m in members if m["trustee"]]
    staff = [m for m in members if not m["trustee"]]
    lines: list[str] = []
    sources: list[dict] = []

    if trustees and board:
        lines += ["**Board of Trustees**", *map(_bullet, board), ""]
        sources.append({"title": C.PAGE_LABELS[C.TRUSTEES_URL], "url": C.TRUSTEES_URL})
    if team and staff:
        lines += ["**Team**", *map(_bullet, staff), ""]
        sources.append({"title": C.PAGE_LABELS[C.TEAM_URL], "url": C.TEAM_URL})
    if not lines:
        return None

    links = " and ".join(f"[{s['title']}]({s['url']})" for s in sources)
    noun = "sections" if len(sources) > 1 else "section"
    lines.append(f"You can see their profiles in the {links} {noun} of the About Us page.")
    return {"answer": "\n".join(lines), "sources": sources}


def _headcount_answer() -> dict:
    members = _members()
    staff = [m["name"] for m in members if not m["trustee"]]
    board = [m for m in members if m["trustee"]]
    label = C.PAGE_LABELS[C.TEAM_URL]
    answer = "HCG Foundation’s total staff count is not published on our website."
    if staff:
        answer += (
            f" The [{label}]({C.TEAM_URL}) section of the About Us page features {len(staff)} team "
            f"{'member' if len(staff) == 1 else 'members'}: {', '.join(staff)}."
        )
    if board:
        answer += f" The Board of Trustees has {len(board)} {'trustee' if len(board) == 1 else 'trustees'}."
    answer += f" For staffing details, contact {C.OFFICIAL_EMAIL} or {C.OFFICIAL_PHONE}."
    return {"answer": answer, "sources": [{"title": label, "url": C.TEAM_URL}]}


def _is_list_request(question: str) -> tuple[bool, bool] | None:
    """(wants trustees, wants team) for "HCG Teams", "list the trustees"...; None otherwise."""
    t = question.lower()
    trustees, team = bool(_TRUSTEE_WORDS.search(t)), bool(_TEAM_WORDS.search(t))
    if not (trustees or team):
        return None
    rest = [w for w in re.findall(r"[a-z]+", _TEAM_WORDS.sub(" ", _TRUSTEE_WORDS.sub(" ", t))) if w not in _FILLER]
    if rest and not _LIST_CUE.search(t):
        return None
    return trustees, team


def answer_team_question(question: str) -> dict | None:
    q = (question or "").strip()
    if not q:
        return None

    if _HEADCOUNT.search(q):
        return _headcount_answer()

    members = _members()
    words = re.findall(r"[a-z]+", q.lower())
    named = _named_members(q, members)
    if named and (_PERSON_CUE.search(q) or len(words) <= 5):
        if len(named) == 1:
            return _person_answer(q, named[0])
        lines = ["More than one person on the About Us page matches that name:"]
        lines += [_bullet(m) for m in named]
        lines.append("Which of them would you like to know about?")
        return {"answer": "\n".join(lines), "sources": [{"title": _section(named[0])[0], "url": _section(named[0])[1]}]}

    if _FOUNDER.search(q):
        founder = next((m for m in members if "founder" in m["role"].lower()), None)
        if founder:
            return _person_answer(q, founder)
        return {
            "answer": C.FOUNDER_INTENT_ANSWER,
            "sources": [{"title": C.PAGE_LABELS[C.TRUSTEES_URL], "url": C.TRUSTEES_URL}],
        }

    wanted = _is_list_request(q)
    if wanted:
        trustees, team = wanted
        # "Teams" alone gets trustees too: the About Us page shows both
        return list_answer(trustees=trustees or team, team=team)
    return None
