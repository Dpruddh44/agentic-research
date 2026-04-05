"use client";

/**
 * useResearchAgent — Core DRY hook for all Gemini interactions.
 *
 * Centralizes research search, contextual explanation, and connection
 * discovery through the Next.js Server Actions proxy layer.
 * Uses React 19 useTransition for non-blocking calls.
 */

import { useState, useTransition, useCallback, useRef } from "react";
import { searchResearch, getConnections } from "@/app/actions/research";
import { explainSelection } from "@/app/actions/explain";
import { computeGraphLayout } from "@/lib/graph";
import type {
  PositionedNode,
  Connection,
  ExplainResponse,
  SearchResponse,
} from "@/types";

interface ResearchAgentState {
  nodes: PositionedNode[];
  connections: Connection[];
  searchSummary: string;
  explanation: ExplainResponse | null;
  error: string | null;
  isSearching: boolean;
  isExplaining: boolean;
}

interface ResearchAgentActions {
  search: (query: string) => Promise<void>;
  explain: (text: string, context: string) => Promise<void>;
  discoverConnections: (nodeIds: string[]) => Promise<void>;
  clearExplanation: () => void;
  clearError: () => void;
}

export type UseResearchAgentReturn = ResearchAgentState & ResearchAgentActions;

export function useResearchAgent(): UseResearchAgentReturn {
  const [nodes, setNodes] = useState<PositionedNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchSummary, setSearchSummary] = useState<string>("");
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isSearchPending, startSearchTransition] = useTransition();
  const [isExplainPending, startExplainTransition] = useTransition();

  // Deduplication: track in-flight queries
  const activeSearchRef = useRef<string | null>(null);
  const activeExplainRef = useRef<string | null>(null);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || activeSearchRef.current === trimmed) return;

    activeSearchRef.current = trimmed;
    setError(null);

    startSearchTransition(async () => {
      try {
        const response: SearchResponse = await searchResearch(trimmed);

        // Compute 3D positions using force-directed layout
        const positionedNodes = computeGraphLayout(
          response.nodes,
          response.connections,
        );

        setNodes(positionedNodes);
        setConnections(response.connections);
        setSearchSummary(response.summary);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Search failed";
        setError(message);
        console.error("[useResearchAgent] Search error:", err);
      } finally {
        activeSearchRef.current = null;
      }
    });
  }, []);

  const explain = useCallback(async (text: string, context: string) => {
    const key = `${text}::${context}`;
    if (activeExplainRef.current === key) return;

    activeExplainRef.current = key;
    setError(null);

    startExplainTransition(async () => {
      try {
        const response = await explainSelection(text, context);
        setExplanation(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Explanation failed";
        setError(message);
        console.error("[useResearchAgent] Explain error:", err);
      } finally {
        activeExplainRef.current = null;
      }
    });
  }, []);

  const discoverConnections = useCallback(
    async (nodeIds: string[]) => {
      if (nodeIds.length < 2) return;

      const nodeSummaries: Record<string, string> = {};
      for (const node of nodes) {
        if (nodeIds.includes(node.id)) {
          nodeSummaries[node.id] = node.summary;
        }
      }

      try {
        const response = await getConnections(nodeIds, nodeSummaries);
        setConnections((prev) => {
          // Merge new connections, avoiding duplicates
          const existingKeys = new Set(
            prev.map((c) => `${c.source_id}-${c.target_id}`),
          );
          const newConns = response.connections.filter(
            (c) => !existingKeys.has(`${c.source_id}-${c.target_id}`),
          );
          return [...prev, ...newConns];
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Connection discovery failed";
        setError(message);
      }
    },
    [nodes],
  );

  const clearExplanation = useCallback(() => setExplanation(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    nodes,
    connections,
    searchSummary,
    explanation,
    error,
    isSearching: isSearchPending,
    isExplaining: isExplainPending,
    search,
    explain,
    discoverConnections,
    clearExplanation,
    clearError,
  };
}
