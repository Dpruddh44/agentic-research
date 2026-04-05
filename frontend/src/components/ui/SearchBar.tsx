"use client";

/**
 * SearchBar — Glassmorphic search input with animated glow border.
 */

import React, { useState, useCallback, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isSearching,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed && !isSearching) {
        onSearch(trimmed);
      }
    },
    [query, isSearching, onSearch],
  );

  return (
    <form
      onSubmit={handleSubmit}
      id="search-bar"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
      }}
    >
      <div
        className="glow-border"
        style={{
          position: "relative",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          className="glass"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 20px",
            borderRadius: "var(--radius-full)",
          }}
        >
          {/* Search icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>

          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Research any topic... (e.g., 'quantum computing breakthroughs 2026')"
            disabled={isSearching}
            autoComplete="off"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-text-primary)",
              fontSize: "0.95rem",
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.01em",
            }}
          />

          {/* Submit button / Loading spinner */}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            id="search-submit"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              background:
                isSearching || !query.trim()
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, var(--color-cyan-glow), var(--color-violet-glow))",
              cursor: isSearching || !query.trim() ? "default" : "pointer",
              transition:
                "background var(--duration-normal) var(--ease-out-expo), transform var(--duration-fast) ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isSearching && query.trim()) {
                (e.target as HTMLElement).style.transform = "scale(1.08)";
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1)";
            }}
          >
            {isSearching ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-cyan-glow)"
                strokeWidth="2"
                style={{ animation: "spin-slow 1s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
