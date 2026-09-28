"use client";

import { useState, useEffect, useCallback } from "react";
import TopicForm from "./components/TopicForm";
import KeyPoints from "./components/KeyPoints";
import FlowchartRenderer from "./components/FlowchartRenderer";
import LoadingState from "./components/LoadingState";

const STORAGE_KEY_HISTORY = "studyflow_history";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [lastTopic, setLastTopic] = useState("");
  const [lastDescription, setLastDescription] = useState("");
  const [activeTab, setActiveTab] = useState("points");
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  const addToHistory = useCallback(
    (topic, data) => {
      const entry = {
        id: Date.now(),
        topic,
        pointsCount: data.keyPoints?.length || 0,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        data,
      };
      const newHistory = [entry, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    },
    [history]
  );

  const handleSubmit = async ({ topic, description }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentTopic(topic);
    setLastTopic(topic);
    setLastDescription(description);
    setActiveTab("points");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data);
      addToHistory(topic, data);

      setTimeout(() => {
        document
          .getElementById("results-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (entry) => {
    setResult(entry.data);
    setCurrentTopic(entry.topic);
    setActiveTab("points");
    setError(null);
    setTimeout(() => {
      document
        .getElementById("results-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">📖</div>
          <h1 className="app-title">StudyFlow</h1>
        </div>
        <p className="app-subtitle">
          Paste any topic and its description — AI extracts the key points and
          builds visual flowcharts so you learn faster.
        </p>
        <div className="free-badge">✨ Free &bull; No sign-up required</div>
      </header>

      {/* Input Form */}
      <TopicForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        currentTopic={lastTopic}
        currentDescription={lastDescription}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card" style={{ marginTop: "var(--space-xl)" }}>
          <LoadingState />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-card" style={{ marginTop: "var(--space-xl)" }}>
          <h3>⚠️ Something went wrong</h3>
          <p>{error}</p>
          <button
            className="btn-retry"
            onClick={() =>
              handleSubmit({ topic: lastTopic, description: lastDescription })
            }
            disabled={!lastTopic || !lastDescription}
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="results-section" id="results-section">
          <div className="results-header">
            <h2 className="results-title">📋 {currentTopic}</h2>
            <div className="results-badge">
              <span>✓</span>
              <span>{result.keyPoints?.length || 0} key points</span>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="summary-card">
              <h3>
                <span>💡</span> Quick Summary
              </h3>
              <p>{result.summary}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "points" ? "active" : ""}`}
              onClick={() => setActiveTab("points")}
              id="tab-points"
            >
              📝 Key Points
            </button>
            <button
              className={`tab-btn ${activeTab === "flowchart" ? "active" : ""}`}
              onClick={() => setActiveTab("flowchart")}
              id="tab-flowchart"
            >
              🔀 Flowchart
            </button>
          </div>

          {activeTab === "points" && <KeyPoints points={result.keyPoints} />}
          {activeTab === "flowchart" && (
            <FlowchartRenderer chartDefinition={result.flowchart} />
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="history-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-lg)",
            }}
          >
            <h3 className="history-title" style={{ marginBottom: 0 }}>
              <span>🕐</span> Recent Topics
            </h3>
            <button
              className="zoom-btn"
              onClick={clearHistory}
              style={{ fontSize: "0.8rem" }}
            >
              Clear History
            </button>
          </div>

          <div className="history-grid">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="history-item"
                onClick={() => loadFromHistory(entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && loadFromHistory(entry)}
              >
                <div className="history-item-topic">{entry.topic}</div>
                <div className="history-item-date">{entry.date}</div>
                <div className="history-item-points">
                  {entry.pointsCount} key points extracted
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Built with ✨ AI &bull; Powered by Google Gemini &bull; Free for
          everyone
        </p>
      </footer>
    </div>
  );
}
