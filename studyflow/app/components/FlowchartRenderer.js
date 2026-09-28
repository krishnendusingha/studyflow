"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function FlowchartRenderer({ chartDefinition }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);
  const [rendered, setRendered] = useState(false);

  const renderChart = useCallback(async () => {
    if (!chartDefinition || !containerRef.current) return;

    try {
      setError(null);
      setRendered(false);

      // Dynamically import mermaid to avoid SSR issues
      const mermaid = (await import("mermaid")).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#6366f1",
          primaryTextColor: "#f1f5f9",
          primaryBorderColor: "#6366f1",
          lineColor: "#a78bfa",
          secondaryColor: "#1e1b4b",
          tertiaryColor: "#111827",
          fontSize: "14px",
          fontFamily: "Inter, system-ui, sans-serif",
          nodeTextColor: "#f1f5f9",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 20,
          nodeSpacing: 50,
          rankSpacing: 60,
        },
        securityLevel: "loose",
      });

      // Clean the chart definition
      let cleanChart = chartDefinition.trim();

      // Fix common issues with escaped newlines from JSON
      cleanChart = cleanChart.replace(/\\n/g, "\n");

      // Ensure it starts with a valid graph declaration
      if (
        !cleanChart.startsWith("graph") &&
        !cleanChart.startsWith("flowchart")
      ) {
        cleanChart = "graph TD\n" + cleanChart;
      }

      // Generate a unique ID for this render
      const id = `flowchart-${Date.now()}`;

      // Clear previous content
      containerRef.current.innerHTML = "";

      const { svg } = await mermaid.render(id, cleanChart);
      containerRef.current.innerHTML = svg;
      setRendered(true);
    } catch (err) {
      console.error("Mermaid render error:", err);
      setError(
        "Could not render the flowchart. The AI may have generated invalid syntax."
      );

      // Show the raw definition as fallback
      if (containerRef.current) {
        containerRef.current.innerHTML = `<pre style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem; white-space: pre-wrap; padding: 1rem;">${chartDefinition.replace(/\\n/g, "\n")}</pre>`;
      }
    }
  }, [chartDefinition]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.3));
  const handleReset = () => setScale(1);

  if (!chartDefinition) return null;

  return (
    <div>
      {/* Outer wrapper reserves layout space; inner div scales without collapsing */}
      <div className="flowchart-outer">
        <div
          className="flowchart-container"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.3s ease",
          }}
        >
          <div ref={containerRef} />
        </div>
      </div>

      {error && (
        <div
          className="error-card"
          style={{ marginTop: "var(--space-md)", textAlign: "left" }}
        >
          <p>⚠️ {error}</p>
        </div>
      )}

      {rendered && (
        <div className="flowchart-zoom-controls">
          <button
            className="zoom-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            ➖ Zoom Out
          </button>
          <button className="zoom-btn" onClick={handleReset} title="Reset Zoom">
            🔄 Reset
          </button>
          <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
            ➕ Zoom In
          </button>
        </div>
      )}
    </div>
  );
}
