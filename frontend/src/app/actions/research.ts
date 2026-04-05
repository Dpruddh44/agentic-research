"use server";

/**
 * Server Action: Research Search Proxy
 *
 * Proxies research queries from the client to the FastAPI backend,
 * keeping API URLs and secrets server-side only.
 */

import { apiPost } from "@/lib/api";
import type { SearchRequest, SearchResponse, ConnectionsRequest, ConnectionsResponse } from "@/types";

export async function searchResearch(query: string): Promise<SearchResponse> {
  try {
    const response = await apiPost<SearchRequest, SearchResponse>(
      "/api/research/search",
      { query },
    );
    return response;
  } catch (error) {
    console.error("[Server Action] Research search failed:", error);
    throw new Error(
      error instanceof Error
        ? `Search failed: ${error.message}`
        : "An unexpected error occurred during search",
    );
  }
}

export async function getConnections(
  nodeIds: string[],
  nodeSummaries: Record<string, string>,
): Promise<ConnectionsResponse> {
  try {
    const response = await apiPost<ConnectionsRequest, ConnectionsResponse>(
      "/api/research/connections",
      { node_ids: nodeIds, node_summaries: nodeSummaries },
    );
    return response;
  } catch (error) {
    console.error("[Server Action] Connection discovery failed:", error);
    throw new Error(
      error instanceof Error
        ? `Connection discovery failed: ${error.message}`
        : "An unexpected error occurred during connection discovery",
    );
  }
}
