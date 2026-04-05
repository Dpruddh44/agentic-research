"use server";

/**
 * Server Action: JIT Contextual Explanation Proxy
 *
 * Proxies highlighted text + context to the FastAPI backend's
 * explain endpoint, which uses Gemini to generate a context-aware
 * explanation.
 */

import { apiPost } from "@/lib/api";
import type { ExplainRequest, ExplainResponse } from "@/types";

export async function explainSelection(
  selectedText: string,
  surroundingContext: string,
): Promise<ExplainResponse> {
  try {
    const response = await apiPost<ExplainRequest, ExplainResponse>(
      "/api/explain",
      {
        selected_text: selectedText,
        surrounding_context: surroundingContext,
      },
    );
    return response;
  } catch (error) {
    console.error("[Server Action] Explanation failed:", error);
    throw new Error(
      error instanceof Error
        ? `Explanation failed: ${error.message}`
        : "An unexpected error occurred during explanation",
    );
  }
}
