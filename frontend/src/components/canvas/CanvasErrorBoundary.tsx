"use client";

/**
 * CanvasErrorBoundary — React Error Boundary for the R3F Canvas.
 *
 * Catches WebGPU/WebGL/R3F initialization errors and falls back
 * to a 2D card-based view of the research results.
 */

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      "[CanvasErrorBoundary] 3D canvas failed, falling back to 2D:",
      error,
      errorInfo,
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="canvas-container">
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              padding: "2rem",
              zIndex: 5,
            }}
          >
            <div
              className="glass"
              style={{
                padding: "1.5rem 2rem",
                marginBottom: "1rem",
                display: "inline-block",
              }}
            >
              <p style={{ color: "var(--color-amber-glow)", fontSize: "0.875rem" }}>
                ⚠ 3D rendering unavailable — using 2D fallback
              </p>
              {this.state.error && (
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  {this.state.error.message}
                </p>
              )}
            </div>
          </div>
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}
