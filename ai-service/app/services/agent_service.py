import json
from openai import OpenAI
from sqlalchemy.orm import Session

from app.config import settings
from app.services import vector_store

_client = OpenAI(api_key=settings.openai_api_key)

SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "search_knowledge_base",
        "description": (
            "Searches the NGO's website content (programs, events, FAQs, pages) "
            "for information relevant to a query. Call this whenever you need "
            "facts to answer the visitor — never guess. You may call it more "
            "than once with different phrasing if the first search doesn't "
            "surface what you need."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "A focused search query, not the full user question verbatim.",
                }
            },
            "required": ["query"],
        },
    },
}

SYSTEM_PROMPT = """You are a helpful assistant for an NGO's website.

You have a tool, search_knowledge_base, that searches the organization's own
content. Use it to find facts before answering — never invent details about
programs, events, or policies. You may call the tool multiple times if the
first result doesn't fully answer the question (e.g. try a rephrased query).

If, after searching, you still don't have the answer, say so plainly and
suggest the visitor contact the organization directly. Keep answers concise
and friendly. When you do answer from retrieved content, you don't need to
cite chunk numbers to the user — just answer naturally."""

MAX_TOOL_ITERATIONS = 3


def answer_question(db: Session, question: str) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]
    sources: set[str] = set()

    for _ in range(MAX_TOOL_ITERATIONS):
        completion = _client.chat.completions.create(
            model=settings.chat_model,
            messages=messages,
            tools=[SEARCH_TOOL],
            temperature=0.3,
        )
        message = completion.choices[0].message

        if not message.tool_calls:
            # Model is done — it has enough to answer.
            return {"answer": message.content or "", "sources": sorted(sources)}

        # Model wants to search. Append its tool-call message, then run
        # every requested search and feed results back in.
        messages.append(message.model_dump(exclude_none=True))

        for tool_call in message.tool_calls:
            args = json.loads(tool_call.function.arguments)
            query = args.get("query", question)

            results = vector_store.similarity_search(db, query, settings.top_k_chunks)
            for r in results:
                sources.add(f"{r['source_table']}#{r['source_id']}")

            tool_result_text = (
                "\n\n".join(r["content"] for r in results)
                if results
                else "No relevant results found."
            )

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result_text,
                }
            )

    # Hit the iteration cap — ask for a final answer without further tool use.
    completion = _client.chat.completions.create(
        model=settings.chat_model,
        messages=messages,
        temperature=0.3,
    )
    return {
        "answer": completion.choices[0].message.content or "",
        "sources": sorted(sources),
    }
