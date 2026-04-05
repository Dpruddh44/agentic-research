"""
Explain router — JIT contextual intelligence endpoint.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.agents.research_agent import run_contextual_explain
from app.models.schemas import ExplainRequest, ExplainResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/explain", tags=["explain"])


@router.post("", response_model=ExplainResponse)
async def explain_selection(request: ExplainRequest) -> ExplainResponse:
    """Generate a context-aware explanation for highlighted text.

    The user highlights text on the research canvas. We receive the selected
    text plus ±500 characters of surrounding context, and the Gemini agent
    provides a contextual explanation inferred from the surrounding material.
    """
    try:
        logger.info(
            f"Explain request: '{request.selected_text[:50]}...' "
            f"(context: {len(request.surrounding_context)} chars)"
        )
        response = await run_contextual_explain(
            selected_text=request.selected_text,
            surrounding_context=request.surrounding_context,
        )
        return response
    except Exception as e:
        logger.exception("Contextual explanation failed")
        raise HTTPException(
            status_code=500,
            detail=f"Explanation failed: {type(e).__name__}: {e}",
        ) from e
