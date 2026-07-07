from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    data_file: Path = Field(default=Path("data/take-home-data.json"), alias="DATA_FILE")
    cors_origins: list[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"],
        alias="CORS_ORIGINS",
    )
    rate_limit: str = Field(default="80/minute", alias="RATE_LIMIT")

    model_config = SettingsConfigDict(populate_by_name=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
