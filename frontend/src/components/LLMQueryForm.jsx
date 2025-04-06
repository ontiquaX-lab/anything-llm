import React, { useState } from 'react';

export default function LLMQueryForm({ onSubmit }) {
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSubmitting(true);
    setResult(null);

    const response = await onSubmit(query);
    setResult(response);
    setSubmitting(false);
  };

  return (
    <div className="llm-query-form">
      <h2>Ask ONTI AI</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about market trends, tokenomics, or investment strategies..."
            rows={4}
            disabled={submitting}
          />
        </div>
        <button type="submit" disabled={submitting || !query.trim()}>
          {submitting ? 'Processing...' : 'Submit Query'}
        </button>
        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            {result.success ? (
              <div className="ai-response">
                <h3>AI Response:</h3>
                <p>{result.data}</p>
              </div>
            ) : (
              <p>Error: {result.message}</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
