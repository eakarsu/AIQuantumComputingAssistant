import React, { useState } from 'react';
import { FiBook, FiSend, FiCpu } from 'react-icons/fi';
import { algorithmExplainer } from '../services/api';
import AIResponsePanel from '../components/AIResponsePanel';
import { useToast } from '../components/Toast';

const EXAMPLES = [
  'Shor\'s algorithm',
  'Grover\'s algorithm',
  'Quantum Phase Estimation',
  'VQE (Variational Quantum Eigensolver)',
  'QAOA (Quantum Approximate Optimization Algorithm)',
];

function AlgorithmExplainerPage() {
  const { addToast } = useToast();
  const [algorithm, setAlgorithm] = useState('');
  const [audienceLevel, setAudienceLevel] = useState('intermediate');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!algorithm.trim()) return;

    setLoading(true);
    setError('');
    setAiResponse(null);

    try {
      const res = await algorithmExplainer(algorithm.trim(), audienceLevel);
      setAiResponse({
        success: true,
        response: res.data.explanation,
        model: res.data.model_used,
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Request failed. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <div>
          <h1 className="page-title">Algorithm Explainer</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Algorithm Explainer</p>
        </div>
      </div>

      <main className="page-main">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FiBook style={{ color: '#7b2ff7' }} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Explain a Quantum Algorithm</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
                  Algorithm name or description
                </label>
                <textarea
                  className="form-input form-textarea"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  placeholder="e.g. Shor's algorithm, or describe a method..."
                  rows={3}
                  style={{ marginBottom: '0.75rem' }}
                />

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
                  Audience level
                </label>
                <select
                  className="form-input"
                  value={audienceLevel}
                  onChange={(e) => setAudienceLevel(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="researcher">Researcher</option>
                </select>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-ai" disabled={loading || !algorithm.trim()}>
                    {loading ? (
                      <span className="btn-loading"><span className="spinner-small" /> Thinking...</span>
                    ) : (
                      <><FiSend /> Explain</>
                    )}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setAlgorithm(''); setAiResponse(null); setError(''); }}>
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {(loading || aiResponse || error) && (
              <AIResponsePanel response={aiResponse} loading={loading} error={error} />
            )}
          </div>

          <div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FiCpu style={{ color: '#00d4ff' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Examples</h3>
              </div>
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setAlgorithm(ex)}
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
                  }}
                  onMouseEnter={(e) => { e.target.style.borderColor = '#7b2ff7'; e.target.style.background = '#faf5ff'; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = 'none'; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AlgorithmExplainerPage;
