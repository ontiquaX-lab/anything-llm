import React from 'react';

export default function OptimizationSuggestions({ suggestions }) {
  if (!suggestions?.length) return <div>No optimization suggestions available</div>;

  return (
    <div className="optimization-suggestions">
      <h2>Profit Optimization</h2>
      <ul className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="suggestion-item">
            <h3>{suggestion.title}</h3>
            <p>{suggestion.description}</p>
            <div className="suggestion-meta">
              <span>Potential ROI: {suggestion.roi}</span>
              <span>Risk Level: {suggestion.risk}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
