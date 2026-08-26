from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    port: int = 8001

    db_host: str = "localhost"
    db_port: int = 5432
    db_username: str = "postgres"
    db_password: str = "postgres"
    db_name: str = "hcg_vectors"

    openai_api_key: str
    openai_base_url: str = "https://api.groq.com/openai/v1"
    chat_model: str = "llama-3.3-70b-versatile"
    chat_max_tokens: int = 280

    embedding_provider: str = "local"  # local | openai
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimensions: int = 384

    chunk_size: int = 1000
    chunk_overlap: int = 150
    top_k_chunks: int = 4
    context_excerpt_chars: int = 560
    # Cosine distance; higher = weaker match. Skip LLM above this.
    max_retrieval_distance: float = 0.78

    answer_cache_enabled: bool = True
    answer_cache_ttl_seconds: int = 3600
    answer_cache_max_entries: int = 500
    answer_cache_semantic: bool = True
    answer_cache_similarity_threshold: float = 0.90

    internal_api_key: str

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.db_username}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()
