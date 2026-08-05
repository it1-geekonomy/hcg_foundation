from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8001

    db_host: str = "localhost"
    db_port: int = 5432
    db_username: str = "postgres"
    db_password: str = "postgres"
    db_name: str = "nestjs_db"

    openai_api_key: str
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chat_model: str = "gpt-4o-mini"

    chunk_size: int = 1000
    chunk_overlap: int = 150

    top_k_chunks: int = 4

    internal_api_key: str

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.db_username}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
