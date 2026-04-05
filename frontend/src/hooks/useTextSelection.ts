"use client";

/**
 * useTextSelection — Global mouseup listener for JIT intelligence.
 *
 * Captures selected text plus ±500 characters of surrounding context,
 * providing anchor position for the Floating UI micro-window.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { TextSelection } from "@/types";

interface UseTextSelectionOptions {
  /** Minimum characters to trigger selection capture */
  minLength?: number;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Whether the hook is active */
  enabled?: boolean;
}

export function useTextSelection(
  options: UseTextSelectionOptions = {},
): TextSelection | null {
  const { minLength = 3, debounceMs = 300, enabled = true } = options;
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const extractContext = useCallback(
    (sel: Selection): string => {
      const anchorNode = sel.anchorNode;
      if (!anchorNode) return "";

      // Walk up to find the nearest block-level element for context
      let contextElement: HTMLElement | null = null;
      let current: Node | null = anchorNode;

      while (current) {
        if (current instanceof HTMLElement) {
          const display = getComputedStyle(current).display;
          if (
            display === "block" ||
            display === "flex" ||
            display === "grid" ||
            current.tagName === "P" ||
            current.tagName === "DIV" ||
            current.tagName === "ARTICLE" ||
            current.tagName === "SECTION"
          ) {
            contextElement = current;
            break;
          }
        }
        current = current.parentNode;
      }

      if (!contextElement) {
        contextElement =
          anchorNode instanceof HTMLElement
            ? anchorNode
            : (anchorNode.parentElement as HTMLElement);
      }

      if (!contextElement) return "";

      const fullText = contextElement.textContent || "";
      const selectedText = sel.toString();
      const selectionStart = fullText.indexOf(selectedText);

      if (selectionStart === -1) return fullText.slice(0, 1000);

      const contextStart = Math.max(0, selectionStart - 500);
      const contextEnd = Math.min(
        fullText.length,
        selectionStart + selectedText.length + 500,
      );

      return fullText.slice(contextStart, contextEnd);
    },
    [],
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      // Don't capture selections inside the R3F canvas or floating UI
      const target = event.target as HTMLElement;
      if (
        target.closest("canvas") ||
        target.closest("[data-floating-ui]") ||
        target.closest(".jit-window")
      ) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setSelection(null);
          return;
        }

        const selectedText = sel.toString().trim();
        if (selectedText.length < minLength) {
          setSelection(null);
          return;
        }

        const context = extractContext(sel);
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelection({
          selectedText,
          context,
          position: {
            x: rect.right + 8,
            y: rect.top + rect.height / 2,
          },
        });
      }, debounceMs);
    },
    [enabled, minLength, debounceMs, extractContext],
  );

  // Clear selection when clicking elsewhere
  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".jit-window") && !target.closest("[data-floating-ui]")) {
        setSelection(null);
      }
    },
    [],
  );

  // Handle Escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousedown", handleMouseDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp, true);
      document.removeEventListener("mousedown", handleMouseDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, handleMouseUp, handleMouseDown, handleKeyDown]);

  return selection;
}
