from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ai_provider: str = "groq"
    ai_model: str = "qwen3.6-27b"
    ai_api_key: str | None = None
    ai_search_service_key: str | None = None
    port: int = 8000


@lru_cache
def get_settings() -> Settings:
    return Settings()
