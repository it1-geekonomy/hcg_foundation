from fastapi import FastAPI
from app.config import settings
from app.routers import sync, chat, health

app = FastAPI(
    title="NGO Chatbot AI Service",
    description="Agentic RAG microservice: ingests CMS content via webhooks, answers questions via a tool-using LLM agent.",
    version="1.0.0",
)

app.include_router(health.router)
app.include_router(sync.router)
app.include_router(chat.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
