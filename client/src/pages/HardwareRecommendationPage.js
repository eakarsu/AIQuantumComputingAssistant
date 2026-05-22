import React, { useState } from 'react';
import { FiServer, FiSend } from 'react-icons/fi';
import { hardwareRecommendation } from '../services/api';
import { useToast } from '../components/Toast';

function HardwareRecommendationPage() {
  const { addToast } = useToast();
  const [algorithm, setAlgorithm] = useState('');
  const [qubitCount, setQubitCount] = useState('');
  const [depth, setDepth] = useState('');
  const [priority, setPriority] = useState('fidelity');
  const [recommendation, setRecommendation] = useState(null);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!algorithm.trim()) return;

    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const res = await hardwareRecommendation(
        algorithm.trim(),
        qubitCount ? Number(qubitCount) : undefined,
        depth ? Number(depth) : undefined,
        priority
      );
      setRecommendation(res.data.recommendation || null);
      setModel(res.data.model_used || '');
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
          <h1 className="page-title">Hardware Recommendation</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Hardware Recommendation</p>
        </div>
      </div>

      <main className="page-main">
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FiServer style={{ color: '#9945ff' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Recommend hardware for an algorithm</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
                  Algorithm
                </label>
                <input
                  className="form-input"
                  type="text"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  placeholder="e.g. Shor's algorithm, VQE for H2 molecule..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
                    Qubit count
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    value={qubitCount}
                    onChange={(e) => setQubitCount(e.target.value)}
                    min={1}
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
                    Circuit depth
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    min={1}
                    placeholder="e.g. 200"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
                    Priority
                  </label>
                  <select
                    className="form-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="fidelity">Fidelity</option>
                    <option value="speed">Speed</option>
                    <option value="cost">Cost</option>
                    <option value="qubit_count">Qubit count</option>
                    <option value="connectivity">Connectivity</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-ai" disabled={loading || !algorithm.trim()}>
                {loading ? (
                  <span className="btn-loading"><span className="spinner-small" /> Recommending...</span>
                ) : (
                  <><FiSend /> Get Recommendation</>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setAlgorithm(''); setQubitCount(''); setDepth(''); setPriority('fidelity');
                  setRecommendation(null); setError('');
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="card" style={{ padding: '1rem', maxWidth: 900, borderLeft: '4px solid #ef4444', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="card" style={{ padding: '1.5rem', maxWidth: 900 }}>
            <div className="ai-loading-content">
              <div className="ai-spinner" />
              <p>Evaluating hardware options...</p>
            </div>
          </div>
        )}

        {recommendation && !loading && (
          <div className="card" style={{ padding: '1.5rem', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Hardware Recommendation</h3>
              {model && <span className="ai-meta-badge">{model}</span>}
            </div>

            {recommendation.top_choice && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Top Choice</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{recommendation.top_choice}</div>
              </div>
            )}

            {Array.isArray(recommendation.ranked_recommendations) && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7', marginBottom: '0.5rem' }}>
                  Ranked Recommendations
                </div>
                {recommendation.ranked_recommendations.map((r, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{r.hardware}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{r.manufacturer}</span>
                    </div>
                    {r.fit_score !== undefined && (
                      <div style={{ fontSize: '0.8rem', color: '#374151' }}>Fit score: {r.fit_score}</div>
                    )}
                    {r.rationale && <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{r.rationale}</div>}
                    {Array.isArray(r.concerns) && r.concerns.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>
                        Concerns: {r.concerns.join('; ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(recommendation.alternative_providers_to_consider) && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Alternative Providers</div>
                <div style={{ fontSize: '0.9rem' }}>{recommendation.alternative_providers_to_consider.join(', ')}</div>
              </div>
            )}

            {recommendation.general_guidance && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>General Guidance</div>
                <div style={{ fontSize: '0.9rem' }}>{recommendation.general_guidance}</div>
              </div>
            )}

            {recommendation.raw_response && (
              <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{recommendation.raw_response}</pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default HardwareRecommendationPage;
