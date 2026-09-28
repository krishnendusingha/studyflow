"use client";

import { useState, useRef, useEffect } from "react";

const EXAMPLES = [
  "Photosynthesis",
  "Newton's Laws",
  "Binary Search",
  "French Revolution",
  "DNA Replication",
  "Ohm's Law",
  "Supply & Demand",
  "Recursion",
];

export default function TopicForm({
  onSubmit,
  isLoading,
  currentTopic,
  currentDescription,
}) {
  const [topic, setTopic] = useState(currentTopic || "");
  const [description, setDescription] = useState(currentDescription || "");
  const descRef = useRef(null);

  // Sync values when parent updates them after submit
  useEffect(() => {
    if (currentTopic !== undefined) setTopic(currentTopic);
  }, [currentTopic]);

  useEffect(() => {
    if (currentDescription !== undefined) setDescription(currentDescription);
  }, [currentDescription]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ topic: topic.trim(), description: description.trim() });
  };

  const handleExampleClick = (example) => {
    setTopic(example);
    descRef.current?.focus();
  };

  const charCount = description.length;
  const charWarning = charCount > 4000;

  return (
    <div className="form-section">
      <div className="glass-card">
        {/* Example chips */}
        <div className="examples-row">
          <span className="examples-label">Try an example:</span>
          <div className="example-chips">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className={`chip ${topic === ex ? "chip-active" : ""}`}
                onClick={() => handleExampleClick(ex)}
                disabled={isLoading}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topic-input" className="form-label">
              📚 Topic
            </label>
            <input
              id="topic-input"
              name="topic"
              type="text"
              className="form-input"
              placeholder="e.g. Photosynthesis, Newton's Laws, Binary Search..."
              required
              disabled={isLoading}
              autoComplete="off"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="description-input" className="form-label">
                📝 Description / Notes
              </label>
              <span className={`char-count ${charWarning ? "char-warn" : ""}`}>
                {charCount.toLocaleString()} chars
              </span>
            </div>
            <textarea
              id="description-input"
              name="description"
              ref={descRef}
              className="form-textarea"
              placeholder="Paste your study material, textbook notes, lecture content, or any description of the topic here. The more detail you provide, the better the key points and flowchart will be..."
              required
              disabled={isLoading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !topic.trim() || !description.trim()}
            id="generate-btn"
          >
            {isLoading ? (
              <>
                <span
                  className="loading-spinner"
                  style={{ width: 20, height: 20 }}
                />
                Analyzing...
              </>
            ) : (
              <>✨ Generate Study Notes &amp; Flowchart</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
