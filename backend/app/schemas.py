"""
schemas.py — Pydantic request/response schemas for all API endpoints.
"""
from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


# ── Shared ──────────────────────────────────────────────────────────────────

class ArticleRequest(BaseModel):
    text: str = Field(..., min_length=10, description="News article or headline text")


# ── /api/predict ─────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    predicted_label: str
    predicted_index: int
    probabilities: dict[str, float]
    model_id: str
    device: str
    truncated: bool = Field(
        False,
        description="True if the input was longer than the model's max token limit and was truncated",
    )


# ── /api/explain ─────────────────────────────────────────────────────────────

class WordContribution(BaseModel):
    word: str
    weight: float  # positive = supports predicted class, negative = against it
    position: int  # index in the original word list


class ExplanationResponse(BaseModel):
    predicted_label: str
    predicted_index: int
    probabilities: dict[str, float]
    contributions: list[WordContribution]
    model_id: str
    lime_num_samples: int
    available: bool = True
    error: str | None = None


# ── /api/model-info ──────────────────────────────────────────────────────────

class ModelInfoResponse(BaseModel):
    model_id: str
    architecture: str
    label_mapping: dict[str, str]
    max_token_length: int
    device: str
    task: str
    license_info: str
    limitations: list[str]
