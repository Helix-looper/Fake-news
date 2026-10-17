"""
model_service.py — Loads the transformer model once and exposes predict().

Model: hamzab/roberta-fake-news-classification
Labels verified from model config:
  - LABEL_0 → "Fake"
  - LABEL_1 → "Real"
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from .config import settings

logger = logging.getLogger(__name__)

# ── Label mapping (verified against model card config.json) ──────────────────
# hamzab/roberta-fake-news-classification uses id2label:
#   0 → "Fake"   1 → "Real"
LABEL_MAP: dict[int, str] = {0: "Fake", 1: "Real"}

_tokenizer: Optional[AutoTokenizer] = None
_model: Optional[AutoModelForSequenceClassification] = None
_device: Optional[torch.device] = None
_model_architecture: str = "Unknown"


def _resolve_device() -> torch.device:
    if settings.device == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return torch.device(settings.device)


def load_model() -> None:
    """Download (on first run) and load the model into memory."""
    global _tokenizer, _model, _device, _model_architecture

    cache_dir = Path(__file__).parent.parent / settings.hf_cache_dir
    cache_dir.mkdir(parents=True, exist_ok=True)

    _device = _resolve_device()
    logger.info("Using device: %s", _device)

    logger.info("Loading tokenizer for %s ...", settings.model_id)
    _tokenizer = AutoTokenizer.from_pretrained(
        settings.model_id,
        cache_dir=str(cache_dir),
    )

    logger.info("Loading model %s ...", settings.model_id)
    _model = AutoModelForSequenceClassification.from_pretrained(
        settings.model_id,
        cache_dir=str(cache_dir),
    )
    _model.to(_device)
    _model.eval()

    _model_architecture = type(_model).__name__
    logger.info("Model loaded: %s on %s", _model_architecture, _device)

    # ── Verify label configuration ───────────────────────────────────────────
    if hasattr(_model.config, "id2label"):
        remote_labels = {int(k): v for k, v in _model.config.id2label.items()}
        logger.info("Model id2label from config: %s", remote_labels)
        synonyms = {"real": {"real", "true"}, "fake": {"fake", "false"}}
        for idx, name in LABEL_MAP.items():
            if idx in remote_labels:
                remote_str = remote_labels[idx].lower()
                allowed = synonyms.get(name.lower(), {name.lower()})
                if remote_str not in allowed:
                    logger.warning(
                        "LABEL MISMATCH at index %d: config says '%s', we expect '%s'",
                        idx, remote_labels[idx], name,
                    )


def _ensure_loaded() -> None:
    if _model is None or _tokenizer is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")


def predict(text: str) -> dict:
    """
    Run inference on *text* and return predicted label + class probabilities.
    """
    _ensure_loaded()

    inputs = _tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True,
    )

    # Track if the input was truncated
    token_count = inputs["input_ids"].shape[1]
    raw_token_count = len(_tokenizer.encode(text, truncation=False))
    was_truncated = raw_token_count > 512

    inputs = {k: v.to(_device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = _model(**inputs)

    probs = F.softmax(outputs.logits, dim=-1)[0]
    probs_np = probs.cpu().numpy()

    predicted_index = int(probs_np.argmax())
    predicted_label = LABEL_MAP[predicted_index]

    prob_dict = {LABEL_MAP[i]: float(probs_np[i]) for i in range(len(probs_np))}

    return {
        "predicted_label": predicted_label,
        "predicted_index": predicted_index,
        "probabilities": prob_dict,
        "model_id": settings.model_id,
        "device": str(_device),
        "truncated": was_truncated,
    }


def get_model_info() -> dict:
    """Return static metadata about the currently loaded model."""
    _ensure_loaded()
    return {
        "model_id": settings.model_id,
        "architecture": _model_architecture,
        "label_mapping": {str(k): v for k, v in LABEL_MAP.items()},
        "max_token_length": 512,
        "device": str(_device),
        "task": "Binary text classification: Fake News vs Real News",
        "license_info": (
            "Model weights published under the Apache 2.0 licence via Hugging Face. "
            "Original fine-tuning dataset: ISOT Fake News Dataset. "
            "See https://huggingface.co/hamzab/roberta-fake-news-classification"
        ),
        "limitations": [
            "Fine-tuned on English-language news articles; may underperform on other languages or styles.",
            "Training data has a specific date range; the model may not reflect post-training events.",
            "High model confidence does not imply factual correctness.",
            "Short headlines may produce less reliable predictions than full articles.",
            "The model reflects biases present in its training corpus.",
            "CPU inference may take 1–3 seconds per article; GPU is faster.",
            "LIME explanations are local approximations and should not be interpreted as causal.",
        ],
    }


def get_tokenizer() -> AutoTokenizer:
    _ensure_loaded()
    return _tokenizer


def get_device() -> torch.device:
    _ensure_loaded()
    return _device
