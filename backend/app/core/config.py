from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = ""
    fuseki_url: str = "http://localhost:3030"
    fuseki_dataset: str = "fruit"
    ontology_namespace: str = "http://example.org/fruit-ontology#"
    llm_timeout: float = 60.0
    fuseki_timeout: float = 30.0
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000", "http://localhost:5173"])
    chat_database_path: str = "data/chat.db"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False)

    @property
    def fuseki_query_url(self) -> str:
        return f"{self.fuseki_url.rstrip('/')}/{self.fuseki_dataset.strip('/')}/query"

    @property
    def normalized_namespace(self) -> str:
        return self.ontology_namespace if self.ontology_namespace.endswith(("#", "/")) else f"{self.ontology_namespace}#"


@lru_cache
def get_settings() -> Settings:
    return Settings()