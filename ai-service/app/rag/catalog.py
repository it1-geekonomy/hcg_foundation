"""Answers "how many ..." / "list all ..." questions from the index itself.

Retrieval hands the model only a handful of chunks, so it cannot count or list
everything the website has published; the index can.
"""

from __future__ import annotations

import re

from app.rag import constants as C
from app.services import vector_store

# (question pattern, source table, singular, plural, listing page)
_CATALOG = [
    (r"patient\s+stor(?:y|ies)|\bstories\b", "patient_stories", "patient story", "patient stories", C.PATIENT_STORIES_URL),
    (r"testimonials?", "patient_testimonials", "testimonial", "testimonials", C.TESTIMONIALS_URL),
    (r"\bevents?\b", "events", "event", "events", C.EVENTS_URL),
    (r"\bprojects?\b", "projects", "project", "projects", C.PROJECTS_URL),
    (r"team\s+members?|\bteam\b|\bstaff\b|\bemploy|\bworkforce\b|\bheadcount\b|people\s+work",
     "teams", "team member", "team members", C.TEAM_URL),
    (r"\bawards?\b", "awards", "award", "awards", "/about-us"),
    (r"annual\s+reports?", "annual_reports", "annual report", "annual reports", C.TRANSPARENCY_URL),
    (r"\bblogs?\b|\barticles?\b", "blogs", "blog post", "blog posts", None),
]

_COUNT = re.compile(r"\bhow\s+(?:many|much)\b|\btotal\b|\bcount\b|\bnumber\s+of\b", re.I)
_LIST = re.compile(r"\blist\b|\bnames?\s+of\b|\ball\s+(?:the\s+)?(?:\w+\s+)?\w+\b|\bwhich\b.*\bare\s+there\b", re.I)
# Upcoming/past events depend on dates, which the normal pipeline handles.
_TIME = re.compile(r"\b(?:upcoming|next|past|previous|recent|latest|last|this\s+(?:week|month|year))\b", re.I)
# The Our Team page shows featured members only, not the organisation's total headcount.
_HEADCOUNT = re.compile(r"\bstaff\b|\bemploy|\bworkforce\b|\bheadcount\b|people\s+work", re.I)

_COUNT_PREVIEW = 10
_LIST_LIMIT = 25


def answer_catalog_question(question: str) -> dict | None:
    q = question or ""
    counting = bool(_COUNT.search(q))
    if not (counting or _LIST.search(q)) or _TIME.search(q):
        return None

    match = next((entry for entry in _CATALOG if re.search(entry[0], q, re.I)), None)
    if not match:
        return None
    _, table, singular, plural, url = match

    titles = vector_store.list_titles(table)
    n = len(titles)
    label = C.PAGE_LABELS.get(url, plural.title()) if url else ""
    see_all = f" You can read them all on the [{label}]({url}) page." if url else ""
    sources = [{"title": label, "url": url}] if url else []

    if table == "teams" and counting and _HEADCOUNT.search(q):
        answer = "HCG Foundation’s total staff count is not published on our website."
        if n:
            answer += (
                f" The [{label}]({url}) page features {n} team "
                f"{'member' if n == 1 else 'members'}: {', '.join(titles[:_LIST_LIMIT])}."
            )
        answer += f" For staffing details, contact {C.OFFICIAL_EMAIL} or {C.OFFICIAL_PHONE}."
    elif n == 0:
        answer = f"There are no {plural} published on the website right now."
    elif n == 1:
        answer = f"There is 1 {singular} published on the website: {titles[0]}.{see_all}"
    elif counting:
        shown = titles[:_COUNT_PREVIEW]
        more = f", and {n - len(shown)} more" if n > len(shown) else ""
        lead = "including" if n > len(shown) else "namely"
        answer = f"There are **{n} {plural}** published on the website, {lead} {', '.join(shown)}{more}.{see_all}"
    else:
        shown = titles[:_LIST_LIMIT]
        lines = [f"Here are the {n} {plural} published on the website:"]
        lines += [f"- {t}" for t in shown]
        if n > len(shown):
            lines.append(f"…and {n - len(shown)} more.")
        answer = "\n".join(lines) + (f"\n\n{see_all.strip()}" if see_all else "")

    return {"answer": answer, "sources": sources}
