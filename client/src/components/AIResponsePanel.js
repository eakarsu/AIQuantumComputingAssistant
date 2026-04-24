import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiZap, FiCpu, FiClock, FiHash } from 'react-icons/fi';

function AIResponsePanel({ response, loading, error }) {
  if (loading) {
    return (
      <div className="ai-panel ai-panel-loading">
        <div className="ai-panel-header">
          <FiZap className="ai-icon pulse" />
          <span>AI Analysis in Progress</span>
        </div>
        <div className="ai-loading-content">
          <div className="ai-spinner" />
          <p>Quantum AI is analyzing your data...</p>
          <div className="ai-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-panel ai-panel-error">
        <div className="ai-panel-header">
          <FiZap className="ai-icon" />
          <span>AI Analysis Error</span>
        </div>
        <div className="ai-error-content">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const aiText = response.response || response.aiResult?.response || '';
  const model = response.model || response.aiResult?.model || '';
  const usage = response.usage || response.aiResult?.usage;
  const success = response.success !== undefined ? response.success : response.aiResult?.success;

  return (
    <div className={`ai-panel ${success === false ? 'ai-panel-warning' : 'ai-panel-success'}`}>
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <FiZap className="ai-icon glow" />
          <span>AI Analysis Result</span>
        </div>
        <div className="ai-panel-meta">
          {model && (
            <span className="ai-meta-badge">
              <FiCpu /> {model}
            </span>
          )}
          {usage && (
            <>
              {usage.prompt_tokens && (
                <span className="ai-meta-badge">
                  <FiHash /> {usage.prompt_tokens + (usage.completion_tokens || 0)} tokens
                </span>
              )}
            </>
          )}
          <span className="ai-meta-badge">
            <FiClock /> {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className="ai-panel-body">
        <div className="ai-markdown-content">
          <ReactMarkdown>{aiText}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default AIResponsePanel;
