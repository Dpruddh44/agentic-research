# 3D Spatial Knowledge Graph — Research Assistant

A high-end AI-powered research assistant with a 3D spatial knowledge graph interface.

## Architecture

```
┌──────────────────────┐      ┌──────────────────────────────┐
│  Next.js 15+ (React  │      │  FastAPI + PydanticAI         │
│  19) Frontend        │ ◄──► │  (Gemini 2.0 Flash +         │
│  R3F + WebGPU + GSAP │      │   Tavily Live Search)        │
│  :3000               │      │  :8000                        │
└──────────────────────┘      └──────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js 20.9+** → [nodejs.org](https://nodejs.org)
- **Python 3.12+** (via uv) → [docs.astral.sh/uv](https://docs.astral.sh/uv)
- **API Keys**: `GOOGLE_API_KEY` (Gemini) + `TAVILY_API_KEY` (Tavily Search)

### 1. Setup Backend

```bash
cd backend

# Install uv (if not already installed)
# Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
# macOS/Linux: curl -LsSf https://astral.sh/uv/install.sh | sh

# Create venv and install deps
uv sync

# Configure API keys
# Edit backend/.env and add your GOOGLE_API_KEY and TAVILY_API_KEY

# Start the backend
uv run python -m app.main
# Or: uv run uvicorn app.main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 3. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in Chrome (for WebGPU support).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 15+ (App Router, React 19) |
| 3D Engine | React Three Fiber + Three.js r174 (WebGPU) |
| Styling | Tailwind CSS 4.0 (CSS-first) |
| Camera Staging | GSAP 3.12+ |
| Contextual UI | Floating UI (autoUpdate, flip) |
| Backend | FastAPI + Uvicorn |
| AI Agent | PydanticAI (Gemini 2.0 Flash) |
| Search | Tavily API (live web research) |

## Features

- **3D Knowledge Graph** — Search results rendered as interactive 3D nodes
- **WebGPU Rendering** — Default WebGPU with automatic WebGL 2 fallback
- **JIT Intelligence** — Highlight any text for instant, context-aware explanations
- **GSAP Camera Staging** — Smooth fly-to animations when selecting nodes
- **Force-Directed Layout** — Automatic 3D positioning based on semantic connections
- **Glassmorphic Design** — Deep-space aesthetic with glow effects and micro-animations

## Project Structure

```
research-ai-assistant/
├── backend/                     # Python: FastAPI + PydanticAI
│   ├── app/
│   │   ├── agents/              # PydanticAI agent definitions
│   │   ├── models/              # Pydantic schemas
│   │   ├── routers/             # API endpoints
│   │   └── main.py              # FastAPI app
│   └── pyproject.toml
│
└── frontend/                    # TypeScript: Next.js 15+
    └── src/
        ├── app/                 # Pages, layouts, server actions
        ├── components/
        │   ├── canvas/          # R3F 3D components
        │   ├── ui/              # UI components
        │   └── layout/          # Header, sidebar
        ├── hooks/               # Custom hooks (DRY abstractions)
        ├── lib/                 # Utilities (API, graph layout)
        └── types/               # Shared TypeScript types
```
