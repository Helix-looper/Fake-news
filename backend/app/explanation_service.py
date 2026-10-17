"""
explanation_service.py — Generates LIME word-level explanations for individual predictions.

LIME wraps our model's predict_proba function.  It perturbs the input text,
calls the model on each perturbation, and fits a sparse linear model to
approximate how each word contributes to the predicted class probability.

This module intentionally does NOT cache explanations between requests because:
  - Each explanation is tied to a specific piece of text + model state.
  - Caching would require a keying strategy beyond the scope of this demo.
"""
from __future__ import annotations

import logging
from typing import Callable

import numpy as np
from lime.lime_text import LimeTextExplainer

from .config import settings
from . import model_service

logger = logging.getLogger(__name__)

# Class names must be in the same order as model output indices
_CLASS_NAMES = ["Fake", "Real"]  # index 0 = Fake, index 1 = Real


def _build_predict_proba() -> Callable[[list[str]], np.ndarray]:
    """
    Returns a function that maps a list of text strings → probability matrix.
    LIME uses this to evaluate perturbed variants of the original text.
    """
    tokenizer = model_service.get_tokenizer()
    import torch
    import torch.nn.functional as F
    from . import model_service as ms

    device = ms.get_device()
    # Access the underlying model object directly to avoid re-loading
    model = ms._model  # type: ignore[attr-defined]

    def predict_proba(texts: list[str]) -> np.ndarray:
        all_probs: list[np.ndarray] = []
        # Process in small batches to avoid OOM on GPU
        batch_size = 16
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            inputs = tokenizer(
                batch,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True,
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}
            with torch.no_grad():
                outputs = model(**inputs)
            probs = F.softmax(outputs.logits, dim=-1).cpu().numpy()
            all_probs.append(probs)
        return np.vstack(all_probs)

    return predict_proba


def explain(text: str) -> dict:
    """
    Generate a LIME explanation for *text* and return structured word contributions.

    Returns a dict with:
        - predicted_label, predicted_index, probabilities (from actual inference)
        - contributions: list of {word, weight, position}
        - available: bool
        - error: str or None
    """
    try:
        # Run actual inference first to get the predicted class
        prediction = model_service.predict(text)
        predicted_index = prediction["predicted_index"]

        predict_proba_fn = _build_predict_proba()

        explainer = LimeTextExplainer(
            class_names=_CLASS_NAMES,
            random_state=42,
            split_expression=r"\s+",  # split on whitespace
        )

        logger.info(
            "Running LIME with %d samples for class index %d ...",
            settings.lime_num_samples,
            predicted_index,
        )

        explanation = explainer.explain_instance(
            text,
            predict_proba_fn,
            num_features=20,
            num_samples=settings.lime_num_samples,
            labels=(predicted_index,),
        )

        raw_contributions = explanation.as_list(label=predicted_index)

        # Map words back to positions in the original token list
        words = text.split()
        word_lower = [w.lower().strip(".,!?;:\"'()[]{}") for w in words]

        contributions: list[dict] = []
        for word, weight in raw_contributions:
            word_stripped = word.lower().strip(".,!?;:\"'()[]{}") 
            # Find best position match
            pos = -1
            for idx, w in enumerate(word_lower):
                if w == word_stripped:
                    pos = idx
                    break
            contributions.append(
                {"word": word, "weight": float(weight), "position": pos}
            )

        # Sort by absolute weight descending
        contributions.sort(key=lambda x: abs(x["weight"]), reverse=True)

        return {
            "predicted_label": prediction["predicted_label"],
            "predicted_index": predicted_index,
            "probabilities": prediction["probabilities"],
            "contributions": contributions,
            "model_id": prediction["model_id"],
            "lime_num_samples": settings.lime_num_samples,
            "available": True,
            "error": None,
        }

    except Exception as exc:
        logger.exception("LIME explanation failed: %s", exc)
        return {
            "predicted_label": "",
            "predicted_index": -1,
            "probabilities": {},
            "contributions": [],
            "model_id": settings.model_id,
            "lime_num_samples": settings.lime_num_samples,
            "available": False,
            "error": str(exc),
        }
