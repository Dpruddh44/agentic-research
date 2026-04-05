"use client";

/**
 * FallbackView — 2D card grid fallback when WebGPU/WebGL fails.
 */

import React from "react";
import type { PositionedNode, Connection } from "@/types";
import { CATEGORY_COLORS } from "@/types";

interface FallbackViewProps {
  nodes: PositionedNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export const FallbackView: React.FC<FallbackViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
}) => {
  if (nodes.length === 0) return null;

  return (
    <div
      id="fallback-view"
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        padding: "100px 40px 40px 40px",
        background: "var(--color-void)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {nodes.map((node, i) => {
          const color =
            CATEGORY_COLORS[node.category] || CATEGORY_COLORS.general;
          const isSelected = selectedNodeId === node.id;

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className="glass glass-hover animate-fade-in-up"
              style={{
                padding: "20px",
                textAlign: "left",
                cursor: "pointer",
                animationDelay: `${i * 50}ms`,
                animationFillMode: "both",
                borderColor: isSelected ? `${color}40` : undefined,
                boxShadow: isSelected
                  ? `0 0 20px ${color}20`
                  : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {node.category}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.65rem",
                    color,
                  }}
                >
                  {Math.round(node.relevance * 100)}%
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                {node.title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                }}
              >
                {node.summary}
              </p>
              {node.key_terms.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    marginTop: "12px",
                  }}
                >
                  {node.key_terms.slice(0, 4).map((term, j) => (
                    <span
                      key={j}
                      style={{
                        padding: "2px 8px",
                        background: `${color}10`,
                        border: `1px solid ${color}25`,
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.7rem",
                        color,
                      }}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
