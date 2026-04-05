"""
Research router — Endpoints for search and connection discovery.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.agents.research_agent import (
    run_research_search,
    run_connection_discovery,
    get_default_deps,
)
from app.models.schemas import (
    SearchRequest,
    SearchResponse,
    ConnectionsRequest,
    ConnectionsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/research", tags=["research"])


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    """Execute a research search and return knowledge graph nodes.

    The agent calls Tavily for live web data, then synthesizes the
    results into structured ResearchNode objects with semantic connections.
    """
    try:
        logger.info(f"Research search: {request.query}")
        response = await run_research_search(request.query)
        logger.info(
            f"Search complete: {len(response.nodes)} nodes, "
            f"{len(response.connections)} connections"
        )
        return response
    except RuntimeError as e:
        # Missing API keys, config issues
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        logger.exception("Research search failed")
        raise HTTPException(
            status_code=500,
            detail=f"Research search failed: {type(e).__name__}: {e}",
        ) from e


@router.post("/connections", response_model=ConnectionsResponse)
async def find_connections(request: ConnectionsRequest) -> ConnectionsResponse:
    """Discover semantic connections between existing research nodes.

    Takes a set of node IDs and their summaries, and uses the AI agent
    to find meaningful relationships between them.
    """
    try:
        if len(request.node_ids) < 2:
            raise HTTPException(
                status_code=400,
                detail="At least 2 node IDs are required for connection discovery",
            )

        # Filter summaries to only requested node IDs
        relevant_summaries = {
            nid: summary
            for nid, summary in request.node_summaries.items()
            if nid in request.node_ids
        }

        if len(relevant_summaries) < 2:
            raise HTTPException(
                status_code=400,
                detail="Summaries must be provided for at least 2 of the requested node IDs",
            )

        connections = await run_connection_discovery(relevant_summaries)
        return ConnectionsResponse(connections=connections)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Connection discovery failed")
        raise HTTPException(
            status_code=500,
            detail=f"Connection discovery failed: {type(e).__name__}: {e}",
        ) from e
