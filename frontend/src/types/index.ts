/**
 * Shared TypeScript types for the Research Assistant.
 *
 * These mirror the Pydantic schemas in the Python backend
 * to ensure end-to-end type safety.
 */

import type { Vector3Tuple } from "three";

// ──────────────────────────────────────────────
// Research / Knowledge Graph
// ──────────────────────────────────────────────

export interface ResearchNode {
  id: string;
  title: string;
  summary: string;
  url: string | null;
  relevance: number;
  category: NodeCategory;
  key_terms: string[];
}

export type NodeCategory =
  | "technology"
  | "science"
  | "history"
  | "business"
  | "health"
  | "philosophy"
  | "general";

export interface Connection {
  source_id: string;
  target_id: string;
  strength: number;
  relationship: string;
}

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  query: string;
  nodes: ResearchNode[];
  connections: Connection[];
  summary: string;
}

// ──────────────────────────────────────────────
// JIT Contextual Explanation
// ──────────────────────────────────────────────

export interface ExplainRequest {
  selected_text: string;
  surrounding_context: string;
}

export interface ExplainResponse {
  explanation: string;
  key_terms: string[];
  confidence: number;
  follow_up_questions: string[];
}

// ──────────────────────────────────────────────
// Connections Discovery
// ──────────────────────────────────────────────

export interface ConnectionsRequest {
  node_ids: string[];
  node_summaries: Record<string, string>;
}

export interface ConnectionsResponse {
  connections: Connection[];
}

// ──────────────────────────────────────────────
// 3D Canvas Types
// ──────────────────────────────────────────────

export interface PositionedNode extends ResearchNode {
  /** Computed 3D position from force-directed layout */
  position: Vector3Tuple;
}

export interface CameraTarget {
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
}

// ──────────────────────────────────────────────
// UI State Types
// ──────────────────────────────────────────────

export interface TextSelection {
  selectedText: string;
  context: string;
  position: { x: number; y: number };
}

export interface AppState {
  nodes: PositionedNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  searchQuery: string;
  isSearching: boolean;
  explanation: ExplainResponse | null;
  isExplaining: boolean;
  error: string | null;
}

// ──────────────────────────────────────────────
// Category Color Mapping
// ──────────────────────────────────────────────

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  technology: "#06d6f2",
  science: "#a855f7",
  history: "#f59e0b",
  business: "#10b981",
  health: "#f43f5e",
  philosophy: "#7c3aed",
  general: "#0891b2",
} as const;
