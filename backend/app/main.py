"""
main.py — FastAPI application entry point.

Endpoints:
  GET  /api/health       — Liveness check
  GET  /api/model-info   — Model metadata
  POST /api/predict      — Run inference
  POST /api/explain      — Run inference + LIME explanation
"""
from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .schemas import (
    ArticleRequest,
    ExplanationResponse,
    ModelInfoResponse,
    PredictionResponse,
    WordContribution,
)
from . import model_service, explanation_service

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


# ── Startup / shutdown ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — loading model ...")
    model_service.load_model()
    logger.info("Model ready.")
    yield
    logger.info("Shutting down.")


# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Explainable Fake News Detection API",
    version="1.0.0",
    description=(
        "Backend API for the Explainable Fake News Detection research demo. "
        "Provides transformer-based classification and LIME word-level explanations."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ── Error handler ─────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Check backend logs."},
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "model_id": settings.model_id}


@app.get("/api/model-info", response_model=ModelInfoResponse, tags=["Model"])
async def model_info():
    try:
        info = model_service.get_model_info()
        return ModelInfoResponse(**info)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@app.post("/api/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict(request: ArticleRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Article text cannot be empty.")
    if len(text) > settings.max_article_length:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Article exceeds maximum length of {settings.max_article_length} characters. "
                f"Received {len(text)} characters."
            ),
        )
    try:
        result = model_service.predict(text)
        return PredictionResponse(**result)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Prediction failed: %s", exc)
        raise HTTPException(status_code=500, detail="Inference failed. Check backend logs.")


@app.post("/api/explain", response_model=ExplanationResponse, tags=["Explanation"])
async def explain(request: ArticleRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Article text cannot be empty.")
    if len(text) > settings.max_article_length:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Article exceeds maximum length of {settings.max_article_length} characters. "
                f"Received {len(text)} characters."
            ),
        )
    if len(text.split()) < 5:
        raise HTTPException(
            status_code=422,
            detail="Please provide at least 5 words for a meaningful explanation.",
        )
    result = explanation_service.explain(text)
    contributions = [WordContribution(**c) for c in result["contributions"]]
    return ExplanationResponse(
        predicted_label=result["predicted_label"],
        predicted_index=result["predicted_index"],
        probabilities=result["probabilities"],
        contributions=contributions,
        model_id=result["model_id"],
        lime_num_samples=result["lime_num_samples"],
        available=result["available"],
        error=result["error"],
    )
