"use client";

import { useState, useEffect } from "react";

// Defined outside component so the array reference is stable
const STEPS = [
  "Reading your content",
  "Extracting key concepts",
  "Building flowchart",
  "Finalizing notes",
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Reset step counter each time LoadingState mounts
    setActiveStep(0);

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev; // Stay at last step
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []); // Empty deps — runs once on mount, cleans up on unmount

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <div className="loading-text">✨ AI is analyzing your topic...</div>
      <div className="loading-steps">
        {STEPS.map((step, index) => (
          <div
            key={index}
            className={`loading-step ${
              index < activeStep
                ? "done"
                : index === activeStep
                ? "active"
                : ""
            }`}
          >
            <span className="loading-step-dot" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
