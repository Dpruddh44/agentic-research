"use client";

/**
 * JITExplanation — Floating UI glassmorphic micro-window.
 *
 * Rendered when the user selects text, positioned beside the cursor
 * using Floating UI with flip and shift strategies.
 */

import React, { useEffect, useRef } from "react";
import {
  useFloating,
  autoUpdate,
  flip,
  shift,
  offset,
} from "@floating-ui/react";
import type { ExplainResponse, TextSelection } from "@/types";

interface JITExplanationProps {
  selection: TextSelection;
  explanation: ExplainResponse | null;
  isLoading: boolean;
  onDismiss: () => void;
}

export const JITExplanation: React.FC<JITExplanationProps> = ({
  selection,
  explanation,
  isLoading,
  onDismiss,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  // Create a virtual anchor element at the selection position
  const virtualEl = useRef({
    getBoundingClientRect() {
      return {
        x: selection.position.x,
        y: selection.position.y,
        top: selection.position.y,
        left: selection.position.x,
        bottom: selection.position.y,
        right: selection.position.x,
        width: 0,
        height: 0,
      };
    },
  });

  // Update virtual element when selection position changes
  useEffect(() => {
    virtualEl.current = {
      getBoundingClientRect() {
        return {
          x: selection.position.x,
          y: selection.position.y,
          top: selection.position.y,
          left: selection.position.x,
          bottom: selection.position.y,
          right: selection.position.x,
          width: 0,
          height: 0,
        };
      },
    };
  }, [selection.position.x, selection.position.y]);

  const { refs, floatingStyles } = useFloating({
    elements: {
      reference: virtualEl.current as any,
    },
    placement: "right-start",
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ["left-start", "bottom", "top"] }),
      shift({ padding: 16 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <div
      ref={refs.setFloating}
      data-floating-ui="jit"
      className="jit-window animate-fade-in-up"
      style={{
        ...floatingStyles,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isLoading
                ? "var(--color-amber-glow)"
                : "var(--color-cyan-glow)",
              boxShadow: isLoading
                ? "0 0 8px var(--color-amber-glow)"
                : "0 0 8px var(--color-cyan-glow)",
              animation: isLoading ? "pulse-glow 1s ease-in-out infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
            }}
          >
            {isLoading ? "Analyzing..." : "Context Intelligence"}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            transition: "color var(--duration-fast) ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.color = "var(--color-text-primary)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.color = "var(--color-text-muted)")
          }
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selected text preview */}
      <div
        style={{
          padding: "8px 12px",
          marginBottom: "12px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "var(--radius-sm)",
          borderLeft: "2px solid var(--color-cyan-glow)",
          fontSize: "0.8rem",
          color: "var(--color-text-secondary)",
          fontStyle: "italic",
          lineHeight: 1.5,
          maxHeight: "60px",
          overflow: "hidden",
        }}
      >
        "{selection.selectedText.length > 100
          ? selection.selectedText.slice(0, 100) + "..."
          : selection.selectedText}"
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="skeleton" style={{ height: "14px", width: "100%" }} />
          <div className="skeleton" style={{ height: "14px", width: "85%" }} />
          <div className="skeleton" style={{ height: "14px", width: "92%" }} />
          <div className="skeleton" style={{ height: "14px", width: "70%" }} />
        </div>
      ) : explanation ? (
        <div>
          {/* Explanation */}
          <p
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: "var(--color-text-primary)",
              marginBottom: "12px",
            }}
          >
            {explanation.explanation}
          </p>

          {/* Key Terms */}
          {explanation.key_terms.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              {explanation.key_terms.map((term, i) => (
                <span key={i} className="jit-term">
                  {term}
                </span>
              ))}
            </div>
          )}

          {/* Confidence */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "2px",
                borderRadius: "1px",
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${explanation.confidence * 100}%`,
                  background:
                    "linear-gradient(90deg, var(--color-cyan-glow), var(--color-violet-glow))",
                  borderRadius: "1px",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.65rem",
                color: "var(--color-text-muted)",
              }}
            >
              {Math.round(explanation.confidence * 100)}% confidence
            </span>
          </div>

          {/* Follow-up Questions */}
          {explanation.follow_up_questions.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "4px",
                  fontWeight: 500,
                }}
              >
                Follow-up:
              </p>
              {explanation.follow_up_questions.map((q, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-cyan-dim)",
                    lineHeight: 1.5,
                    cursor: "pointer",
                  }}
                >
                  → {q}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
