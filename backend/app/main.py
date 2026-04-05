"""
FastAPI Application Entry Point

Research Assistant Backend — 3D Spatial Knowledge Graph.
Provides REST endpoints for the Next.js frontend to interact
with the PydanticAI-powered Gemini 2.0 Flash agents.
"""

from __future__ import annotations

import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import research, explain

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI app."""

    app = FastAPI(
        title="Research Assistant API",
        description=(
            "3D Spatial Knowledge Graph Research Assistant — "
            "Powered by PydanticAI + Gemini 2.0 Flash + Tavily"
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    origins = [origin.strip() for origin in cors_origins.split(",")]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────
    app.include_router(research.router)
    app.include_router(explain.router)

    # ── Health Check ──────────────────────────
    @app.get("/health", tags=["system"])
    async def health_check() -> dict[str, str]:
        """Check if the backend is running and API keys are configured."""
        google_key = os.getenv("GOOGLE_API_KEY", "")
        tavily_key = os.getenv("TAVILY_API_KEY", "")
        return {
            "status": "healthy",
            "google_api_key": "configured" if google_key and not google_key.startswith("your_") else "missing",
            "tavily_api_key": "configured" if tavily_key and not tavily_key.startswith("your_") else "missing",
        }

    logger.info("Research Assistant API initialized")
    logger.info(f"CORS origins: {origins}")

    return app


# Create the app instance (used by uvicorn)
app = create_app()


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
    )
