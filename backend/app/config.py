"""
config.py — Application configuration loaded from environment variables / .env
"""
from __future__ import annotations

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=(),
    )

    # Hugging Face model identifier
    model_id: str = "hamzab/roberta-fake-news-classification"

    # Local cache directory for downloaded model weights
    hf_cache_dir: str = ".hf_cache"

    # Maximum article length (characters) accepted by the API
    max_article_length: int = 5000

    # LIME number of perturbation samples
    lime_num_samples: int = 300

    # Allowed CORS origin for the local frontend
    cors_origin: str = "http://localhost:5173"

    # Device selection: "auto", "cuda", or "cpu"
    device: str = "auto"


settings = Settings()
