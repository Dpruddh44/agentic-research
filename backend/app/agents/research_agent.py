"""
PydanticAI Research Agent — Type-safe Gemini 2.0 Flash tool-calling.

This module defines the central AI agent that powers the Research Assistant.
It uses PydanticAI for structured tool-calling with Gemini, and Tavily
for live web research.
"""

from __future__ import annotations

import os
import json
import logging
from dataclasses import dataclass

from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from tavily import TavilyClient

from app.models.schemas import (
    ResearchNode,
    Connection,
    SearchResponse,
    ExplainResponse,
)

load_dotenv()

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Agent Dependencies (Dependency Injection)
# ──────────────────────────────────────────────

@dataclass
class ResearchDeps:
    """Runtime dependencies injected into the agent's tools."""
    tavily_client: TavilyClient
    max_results: int = 8


def _build_tavily_client() -> TavilyClient:
    """Create a Tavily client from environment."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key or api_key.startswith("your_"):
        raise RuntimeError(
            "TAVILY_API_KEY is not set. "
            "Add it to backend/.env to enable live web research."
        )
    return TavilyClient(api_key=api_key)


def get_default_deps() -> ResearchDeps:
    """Build default dependencies for the agent."""
    return ResearchDeps(tavily_client=_build_tavily_client())


# ──────────────────────────────────────────────
# Agent: Research Search
# ──────────────────────────────────────────────

RESEARCH_SYSTEM_PROMPT = """\
You are an advanced research assistant powering a 3D Spatial Knowledge Graph.
Your task is to analyze search results and synthesize them into structured
knowledge nodes for a visual research canvas.

When given search results, you MUST:
1. Create distinct research nodes — each representing a key concept, paper, or finding.
2. Identify semantic connections between nodes (causal, hierarchical, related, contrasts).
3. Assign a relevance score (0-1) based on how central each node is to the query.
4. Categorize each node (technology, science, history, business, philosophy, health, etc.).
5. Extract key terms from each node for tagging.
6. Write concise but informative 2-3 sentence summaries.
7. Provide an overall synthesis paragraph.

Aim for 5-8 nodes per query to create a rich but navigable graph.
Be precise, factual, and cite sources where available.
"""

research_agent = Agent(
    "google-gla:gemini-2.5-flash",
    system_prompt=RESEARCH_SYSTEM_PROMPT,
    deps_type=ResearchDeps,
    output_type=SearchResponse,
    retries=2,
)


@research_agent.tool
async def search_web(ctx: RunContext[ResearchDeps], query: str) -> str:
    """Search the live web using Tavily for up-to-the-minute research data.

    Args:
        query: The search query to execute against the web.

    Returns:
        JSON string of search results with titles, URLs, and content snippets.
    """
    logger.info(f"Tavily search: {query}")
    try:
        results = ctx.deps.tavily_client.search(
            query=query,
            max_results=ctx.deps.max_results,
            search_depth="advanced",
            include_raw_content=False,
        )
        # Flatten to a clean structure for the LLM
        cleaned = []
        for r in results.get("results", []):
            cleaned.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", "")[:500],
                "score": r.get("score", 0.0),
            })
        return json.dumps(cleaned, indent=2)
    except Exception as e:
        logger.error(f"Tavily search failed: {e}")
        return json.dumps({"error": str(e)})


@research_agent.tool_plain
def format_nodes_with_connections(
    nodes_json: str,
    connections_json: str,
    synthesis: str,
) -> str:
    """Structure the final research output with nodes, connections, and synthesis.

    Args:
        nodes_json: JSON array of research node objects.
        connections_json: JSON array of connection objects.
        synthesis: Overall synthesis paragraph of the research.

    Returns:
        Formatted JSON combining all elements.
    """
    try:
        nodes = json.loads(nodes_json) if isinstance(nodes_json, str) else nodes_json
        connections = json.loads(connections_json) if isinstance(connections_json, str) else connections_json
    except json.JSONDecodeError:
        nodes = []
        connections = []

    return json.dumps({
        "nodes": nodes,
        "connections": connections,
        "summary": synthesis,
    })


# ──────────────────────────────────────────────
# Agent: Contextual Explanation (JIT)
# ──────────────────────────────────────────────

EXPLAIN_SYSTEM_PROMPT = """\
You are a contextual intelligence engine embedded in a research tool.
When a user highlights text, you receive:
1. The exact selected text
2. ±500 characters of surrounding context

Your job:
- Provide a CONTEXT-AWARE explanation. The meaning of the selected text
  should be inferred from the surrounding context, NOT from generic knowledge.
- If the text is a technical term, explain it in the context it appears.
- If the text is a claim, evaluate its accuracy based on the context.
- Extract 2-4 key terms and provide brief definitions.
- Suggest 1-3 follow-up research questions.
- Rate your confidence (0-1) in the explanation.

Keep explanations concise (3-5 sentences). Be precise and scholarly.
"""

explain_agent = Agent(
    "google-gla:gemini-2.5-flash",
    system_prompt=EXPLAIN_SYSTEM_PROMPT,
    output_type=ExplainResponse,
    retries=2,
)


# ──────────────────────────────────────────────
# Agent: Connection Discovery
# ──────────────────────────────────────────────

CONNECTIONS_SYSTEM_PROMPT = """\
You are a semantic analysis engine. Given a set of research node summaries,
discover meaningful connections between them.

For each connection, specify:
- source_id and target_id
- strength (0-1): how strong the semantic relationship is
- relationship: a short label (e.g., "causes", "contrasts", "extends",
  "is_part_of", "related_to", "contradicts", "supports")

Only create connections where there is a genuine semantic relationship.
Aim for quality over quantity — 2-5 connections per pair analysis.
"""

connections_agent = Agent(
    "google-gla:gemini-2.5-flash",
    system_prompt=CONNECTIONS_SYSTEM_PROMPT,
    output_type=list[Connection],
    retries=2,
)


# ──────────────────────────────────────────────
# Public API Functions
# ──────────────────────────────────────────────

async def run_research_search(query: str, deps: ResearchDeps | None = None) -> SearchResponse:
    """Execute a research search and return structured knowledge graph data.

    Args:
        query: The user's research query.
        deps: Optional dependencies (uses defaults if not provided).

    Returns:
        SearchResponse with nodes, connections, and synthesis summary.
    """
    if deps is None:
        deps = get_default_deps()

    result = await research_agent.run(
        f"Research this topic and create a knowledge graph: {query}",
        deps=deps,
    )
    # Ensure the query is set on the response
    response = result.output
    response.query = query
    return response


async def run_contextual_explain(
    selected_text: str,
    surrounding_context: str,
) -> ExplainResponse:
    """Generate a context-aware explanation for highlighted text.

    Args:
        selected_text: The text the user highlighted.
        surrounding_context: ±500 chars around the selection.

    Returns:
        ExplainResponse with explanation, key terms, and follow-ups.
    """
    prompt = (
        f"Explain the following highlighted text in context.\n\n"
        f"SELECTED TEXT:\n\"{selected_text}\"\n\n"
        f"SURROUNDING CONTEXT:\n\"{surrounding_context}\""
    )
    result = await explain_agent.run(prompt)
    return result.output


async def run_connection_discovery(
    node_summaries: dict[str, str],
) -> list[Connection]:
    """Discover semantic connections between research nodes.

    Args:
        node_summaries: Map of node_id → summary text.

    Returns:
        List of discovered Connection objects.
    """
    prompt = "Analyze these research nodes and discover semantic connections:\n\n"
    for node_id, summary in node_summaries.items():
        prompt += f"- Node [{node_id}]: {summary}\n"

    result = await connections_agent.run(prompt)
    return result.output
