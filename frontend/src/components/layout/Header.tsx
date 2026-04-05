"use client";

/**
 * Header — App header with logo and search bar integration.
 */

import React from "react";
import { SearchBar } from "@/components/ui/SearchBar";

interface HeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  nodeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  isSearching,
  nodeCount,
}) => {
  return (
    <header
      id="app-header"
      className="glass-solid"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "12px 24px",
        borderRadius: 0,
        borderBottom: "1px solid var(--glass-border)",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background:
              "linear-gradient(135deg, var(--color-cyan-glow), var(--color-violet-glow))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(6, 214, 242, 0.3)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </div>
        <div>
          <h1
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Research Assistant
          </h1>
          <p
            style={{
              fontSize: "0.65rem",
              color: "var(--color-text-muted)",
              letterSpacing: "0.02em",
            }}
          >
            3D Spatial Knowledge Graph
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <SearchBar onSearch={onSearch} isSearching={isSearching} />
      </div>

      {/* Node counter */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {nodeCount > 0 && (
          <div
            className="glass"
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-emerald-glow)",
                boxShadow: "0 0 6px var(--color-emerald-glow)",
              }}
            />
            {nodeCount} node{nodeCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </header>
  );
};
