from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    port: int = 8001

    db_host: str = "localhost"
    db_port: int = 5432
    db_username: str = "postgres"
    db_password: str = "postgres"
    db_name: str = "hcg_db"

    openai_api_key: str = ""
    # Prefer OPENAI_MODEL / OPENAI_EMBEDDING_MODEL (also accept legacy names)
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    chat_model: str | None = None
    embedding_model: str | None = None
    embedding_dimensions: int = 1536

    chunk_size: int = 1000
    chunk_overlap: int = 150

    retrieval_top_k: int = 5
    retrieval_candidate_k: int = 15
    similarity_threshold: float = 0.35
    max_sources: int = 3
    source_score_margin: float = 0.05
    conversation_memory_size: int = 6
    openai_timeout_seconds: int = 30

    # Legacy alias used by older .env
    top_k_chunks: int = 4

    internal_api_key: str = ""
    sync_api_key: str | None = None

    chroma_persist_dir: str = "./data/chroma"
    chroma_collection: str = "hcg_foundation_knowledge"
    knowledge_dir: str = "./knowledge/public"
    site_base_url: str = "https://hcgfoundation.org"

    @property
    def resolved_chat_model(self) -> str:
        return self.chat_model or self.openai_model or "gpt-4o-mini"

    @property
    def resolved_embedding_model(self) -> str:
        return (
            self.embedding_model
            or self.openai_embedding_model
            or "text-embedding-3-small"
        )

    @property
    def resolved_sync_api_key(self) -> str:
        return self.sync_api_key or self.internal_api_key

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.db_username}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()
