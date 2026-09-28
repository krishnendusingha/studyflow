"use client";

import { useState } from "react";

// Safe clipboard copy — falls back to execCommand for HTTP/non-secure contexts
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for HTTP (localhost dev)
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

export default function KeyPoints({ points }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!points || points.length === 0) return null;

  const handleCopy = async (point, index) => {
    try {
      await copyToClipboard(`${point.title}\n${point.description}`);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // silently fail — clipboard not available
    }
  };

  const handleCopyAll = async () => {
    try {
      const text = points
        .map((p, i) => `${i + 1}. ${p.title}\n${p.description}`)
        .join("\n\n");
      await copyToClipboard(text);
      setCopiedIndex("all");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // silently fail
    }
  };

  return (
    <div>
      <div className="key-points-toolbar">
        <span className="key-points-count">{points.length} key points</span>
        <button
          className="copy-all-btn"
          onClick={handleCopyAll}
          title="Copy all key points"
        >
          {copiedIndex === "all" ? "✅ Copied!" : "📋 Copy All"}
        </button>
      </div>

      <ul className="key-points-list">
        {points.map((point, index) => (
          <li key={index} className="key-point-item">
            <div className="key-point-number">{index + 1}</div>
            <div className="key-point-content">
              <div className="key-point-title">{point.title}</div>
              <div className="key-point-description">{point.description}</div>
            </div>
            <button
              className={`copy-point-btn ${copiedIndex === index ? "copied" : ""}`}
              onClick={() => handleCopy(point, index)}
              title="Copy this point"
            >
              {copiedIndex === index ? "✅" : "📋"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
