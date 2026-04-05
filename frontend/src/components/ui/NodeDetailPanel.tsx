"use client";

/**
 * NodeDetailPanel — Slide-in panel for selected node details.
 */

import React from "react";
import type { PositionedNode, Connection } from "@/types";
import { CATEGORY_COLORS } from "@/types";

interface NodeDetailPanelProps {
  node: PositionedNode;
  connections: Connection[];
  allNodes: PositionedNode[];
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  connections,
  allNodes,
  onClose,
  onSelectNode,
}) => {
  const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.general;

  // Find connections involving this node
  const nodeConnections = connections.filter(
    (c) => c.source_id === node.id || c.target_id === node.id,
  );

  // Get connected node details
  const connectedNodes = nodeConnections
    .map((conn) => {
      const otherId =
        conn.source_id === node.id ? conn.target_id : conn.source_id;
      const otherNode = allNodes.find((n) => n.id === otherId);
      return otherNode ? { node: otherNode, connection: conn } : null;
    })
    .filter(Boolean) as { node: PositionedNode; connection: Connection }[];

  return (
    <div
      id="node-detail-panel"
      className="glass-solid animate-slide-in-right"
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        bottom: "20px",
        width: "360px",
        zIndex: 100,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "var(--radius-xl)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 10px ${color}`,
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
              {node.category}
            </span>
          </div>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--color-text-primary)",
            }}
          >
            {node.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            padding: "6px",
            display: "flex",
            transition: "all var(--duration-fast) ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--color-text-primary)";
            el.style.borderColor = "var(--glass-border-hover)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--color-text-muted)";
            el.style.borderColor = "var(--glass-border)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Relevance bar */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
            Relevance
          </span>
          <span style={{ fontSize: "0.7rem", color }}>
            {Math.round(node.relevance * 100)}%
          </span>
        </div>
        <div
          style={{
            height: "3px",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${node.relevance * 100}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              borderRadius: "2px",
              transition: "width var(--duration-slow) var(--ease-out-expo)",
            }}
          />
        </div>
      </div>

      {/* Summary */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: 1.8,
            color: "var(--color-text-primary)",
            marginBottom: "20px",
          }}
        >
          {node.summary}
        </p>

        {/* Key Terms */}
        {node.key_terms.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: "8px",
              }}
            >
              Key Concepts
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {node.key_terms.map((term, i) => (
                <span
                  key={i}
                  style={{
                    padding: "3px 12px",
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    color,
                    fontWeight: 500,
                  }}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source URL */}
        {node.url && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: "6px",
              }}
            >
              Source
            </p>
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.8rem",
                color: "var(--color-cyan-glow)",
                textDecoration: "none",
                wordBreak: "break-all",
              }}
            >
              {node.url}
            </a>
          </div>
        )}

        {/* Connected Nodes */}
        {connectedNodes.length > 0 && (
          <div>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: "8px",
              }}
            >
              Connected ({connectedNodes.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {connectedNodes.map(({ node: cn, connection }) => {
                const cnColor =
                  CATEGORY_COLORS[cn.category] || CATEGORY_COLORS.general;
                return (
                  <button
                    key={cn.id}
                    onClick={() => onSelectNode(cn.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all var(--duration-fast) ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.borderColor = "var(--glass-border-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "var(--glass-border)";
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: cnColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-text-primary)",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cn.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {connection.relationship} · {Math.round(connection.strength * 100)}%
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
