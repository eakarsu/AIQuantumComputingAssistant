import React, { useState } from 'react';
import { FiZap, FiSend, FiCpu, FiBook } from 'react-icons/fi';
import { quantumQuery } from '../services/api';
import AIResponsePanel from '../components/AIResponsePanel';
import { useToast } from '../components/Toast';

const EXAMPLE_QUESTIONS = [
  'What is quantum entanglement and how is it used in quantum computing?',
  'Explain the difference between quantum error correction codes: surface codes vs. color codes.',
  'How does Shor\'s algorithm achieve exponential speedup over classical factoring?',
  'What are the main challenges in building fault-tolerant quantum computers?',
  'Compare superconducting qubits vs. trapped ion qubits for NISQ applications.',
];

function QuantumQueryPage() {
  const { addToast } = useToast();
  const [question, setQuestion] = useState('');
  const [includeContext, setIncludeContext] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAiResponse(null);

    try {
      const res = await quantumQuery(question.trim(), includeContext);
      setAiResponse({ success: true, response: res.data.answer, model: res.data.model_used });
      setHistory(prev => [{ question: question.trim(), answer: res.data.answer, model: res.data.model_used, ts: new Date() }, ...prev.slice(0, 9)]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Query failed. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (q) => {
    setQuestion(q);
    setAiResponse(null);
    setError('');
  };

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <div>
          <h1 className="page-title">Quantum Query</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Quantum Query</p>
        </div>
      </div>

      <main className="page-main">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          {/* Main Query Panel */}
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FiZap style={{ color: '#7b2ff7' }} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Ask the Quantum AI</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <textarea
                  className="form-input form-textarea"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask any quantum computing question..."
                  rows={4}
                  style={{ marginBottom: '0.75rem' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includeContext}
                      onChange={(e) => setIncludeContext(e.target.checked)}
                    />
                    Include platform context (circuit/hardware stats)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-ai" disabled={loading || !question.trim()}>
                    {loading ? (
                      <span className="btn-loading"><span className="spinner-small" /> Thinking...</span>
                    ) : (
                      <><FiSend /> Ask AI</>
                    )}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setQuestion(''); setAiResponse(null); setError(''); }}>
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {(loading || aiResponse || error) && (
              <AIResponsePanel response={aiResponse} loading={loading} error={error} />
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Queries</h3>
                {history.map((item, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <button
                      onClick={() => { setQuestion(item.question); setAiResponse({ success: true, response: item.answer, model: item.model }); setError(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: 0 }}
                    >
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#7b2ff7', margin: '0 0 0.25rem' }}>{item.question}</p>
                      <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>{item.ts.toLocaleTimeString()}</p>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Examples */}
          <div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FiBook style={{ color: '#00d4ff' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Example Questions</h3>
              </div>
              {EXAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExample(q)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0.6rem 0.75rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: '#374151',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.target.style.borderColor = '#7b2ff7'; e.target.style.background = '#faf5ff'; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = 'none'; }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FiCpu style={{ color: '#9945ff' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Tips</h3>
              </div>
              <ul style={{ fontSize: '0.8rem', color: '#6b7280', paddingLeft: '1rem', margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>Be specific about your quantum computing topic</li>
                <li style={{ marginBottom: '0.5rem' }}>Enable "platform context" for questions about your data</li>
                <li style={{ marginBottom: '0.5rem' }}>Ask follow-up questions from history</li>
                <li>AI rate limit: 20 queries/hour</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuantumQueryPage;
