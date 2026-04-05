"""
Pydantic schemas for the Research Assistant API.

These models define the request/response contracts between the
FastAPI backend and the Next.js frontend Server Actions.
"""

from __future__ import annotations

import uuid
from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Research / Search
# ──────────────────────────────────────────────

class SearchRequest(BaseModel):
    """Incoming search query from the frontend."""
    query: str = Field(..., min_length=1, max_length=500, description="Research query string")


class ResearchNode(BaseModel):
    """A single node in the 3D knowledge graph."""
    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12])
    title: str = Field(..., description="Short title for the node")
    summary: str = Field(..., description="2-3 sentence research summary")
    url: str | None = Field(default=None, description="Source URL if available")
    relevance: float = Field(
        default=0.8,
        ge=0.0, le=1.0,
        description="Relevance score 0-1 relative to the original query"
    )
    category: str = Field(
        default="general",
        description="Semantic category for color coding (e.g. 'technology', 'science', 'history')"
    )
    key_terms: list[str] = Field(
        default_factory=list,
        description="Key terms/concepts extracted from this node"
    )


class Connection(BaseModel):
    """A semantic link between two research nodes."""
    source_id: str
    target_id: str
    strength: float = Field(
        default=0.5,
        ge=0.0, le=1.0,
        description="Strength of the semantic connection"
    )
    relationship: str = Field(
        default="related",
        description="Short label describing the relationship"
    )


class SearchResponse(BaseModel):
    """Response from a research search operation."""
    query: str
    nodes: list[ResearchNode] = Field(default_factory=list)
    connections: list[Connection] = Field(default_factory=list)
    summary: str = Field(default="", description="Overall synthesis of the research findings")


# ──────────────────────────────────────────────
# JIT Contextual Explanation
# ──────────────────────────────────────────────

class ExplainRequest(BaseModel):
    """Request for contextual explanation of highlighted text."""
    selected_text: str = Field(..., min_length=1, max_length=1000, description="The highlighted text")
    surrounding_context: str = Field(
        ...,
        max_length=1500,
        description="±500 characters of surrounding context from the page"
    )


class ExplainResponse(BaseModel):
    """AI-generated contextual explanation."""
    explanation: str = Field(..., description="Context-aware explanation of the selected text")
    key_terms: list[str] = Field(
        default_factory=list,
        description="Key terminology extracted and defined"
    )
    confidence: float = Field(
        default=0.9,
        ge=0.0, le=1.0,
        description="Confidence in the explanation accuracy"
    )
    follow_up_questions: list[str] = Field(
        default_factory=list,
        description="Suggested follow-up research queries"
    )


# ──────────────────────────────────────────────
# Connections Discovery
# ──────────────────────────────────────────────

class ConnectionsRequest(BaseModel):
    """Request to discover connections between existing nodes."""
    node_ids: list[str] = Field(..., min_length=2, description="IDs of nodes to find connections for")
    node_summaries: dict[str, str] = Field(
        default_factory=dict,
        description="Map of node_id -> summary text for semantic analysis"
    )


class ConnectionsResponse(BaseModel):
    """Discovered semantic connections between nodes."""
    connections: list[Connection] = Field(default_factory=list)
