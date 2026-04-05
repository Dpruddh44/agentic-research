"use client";

/**
 * Main Research Assistant Page
 *
 * Assembles the 3D Research Canvas, Header with SearchBar,
 * JIT Explanation micro-window, and Node Detail panel into
 * the complete application.
 */

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { JITExplanation } from "@/components/ui/JITExplanation";
import { NodeDetailPanel } from "@/components/ui/NodeDetailPanel";
import { FallbackView } from "@/components/ui/FallbackView";
import { useResearchAgent } from "@/hooks/useResearchAgent";
import { useTextSelection } from "@/hooks/useTextSelection";
import type { PositionedNode } from "@/types";

// Dynamically import the 3D Canvas (no SSR — WebGPU/WebGL is client-only)
const ResearchCanvas = dynamic(
  () =>
    import("@/components/canvas/ResearchCanvas").then(
      (mod) => mod.ResearchCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="canvas-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "2px solid var(--color-cyan-glow)",
              borderTopColor: "transparent",
              animation: "spin-slow 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.85rem",
            }}
          >
            Initializing 3D canvas...
          </p>
        </div>
      </div>
    ),
  },
);

export default function ResearchPage() {
  const {
    nodes,
    connections,
    searchSummary,
    explanation,
    error,
    isSearching,
    isExplaining,
    search,
    explain,
    clearExplanation,
    clearError,
  } = useResearchAgent();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const textSelection = useTextSelection({ enabled: true });

  // Get selected node details
  const selectedNode: PositionedNode | undefined = nodes.find(
    (n) => n.id === selectedNodeId,
  );

  // Trigger JIT explanation when text is selected
  useEffect(() => {
    if (textSelection && textSelection.selectedText.length >= 3) {
      explain(textSelection.selectedText, textSelection.context);
    }
  }, [textSelection, explain]);

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleDismissExplanation = useCallback(() => {
    clearExplanation();
  }, [clearExplanation]);

  return (
    <main
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header with Search */}
      <Header
        onSearch={search}
        isSearching={isSearching}
        nodeCount={nodes.length}
      />

      {/* 3D Research Canvas */}
      <ResearchCanvas
        nodes={nodes}
        connections={connections}
        selectedNodeId={selectedNodeId}
        onSelectNode={handleSelectNode}
        fallback={
          <FallbackView
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => handleSelectNode(id)}
          />
        }
      />

      {/* Empty State */}
      {nodes.length === 0 && !isSearching && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(6, 214, 242, 0.15) 0%, transparent 70%)",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-cyan-dim)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.6 }}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 300,
              color: "var(--color-text-secondary)",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Begin your research
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--color-text-muted)",
              maxWidth: "400px",
            }}
          >
            Search any topic to build a 3D knowledge graph.
            <br />
            Highlight text anywhere for instant AI explanations.
          </p>
        </div>
      )}

      {/* Search Summary Bar */}
      {searchSummary && nodes.length > 0 && (
        <div
          className="glass animate-fade-in-up"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "12px 20px",
            maxWidth: "700px",
            width: "calc(100% - 80px)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "var(--color-cyan-glow)",
                marginRight: "8px",
              }}
            >
              Synthesis
            </span>
            {searchSummary}
          </p>
        </div>
      )}

      {/* Node Detail Panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          connections={connections}
          allNodes={nodes}
          onClose={() => handleSelectNode(null)}
          onSelectNode={(id) => handleSelectNode(id)}
        />
      )}

      {/* JIT Explanation Micro-Window */}
      {textSelection && (
        <JITExplanation
          selection={textSelection}
          explanation={explanation}
          isLoading={isExplaining}
          onDismiss={handleDismissExplanation}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div
          className="glass animate-fade-in-up"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 300,
            padding: "12px 20px",
            maxWidth: "400px",
            borderColor: "rgba(244, 63, 94, 0.2)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-rose-glow)",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                flex: 1,
              }}
            >
              {error}
            </p>
            <button
              onClick={clearError}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
