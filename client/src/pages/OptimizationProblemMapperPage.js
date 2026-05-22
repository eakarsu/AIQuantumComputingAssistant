import React, { useState } from 'react';
import { FiTrendingUp, FiSend } from 'react-icons/fi';
import { optimizationProblemMapper } from '../services/api';
import { useToast } from '../components/Toast';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>{children}</div>
    </div>
  );
}

function OptimizationProblemMapperPage() {
  const { addToast } = useToast();
  const [problem, setProblem] = useState('');
  const [mapping, setMapping] = useState(null);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setLoading(true);
    setError('');
    setMapping(null);

    try {
      const res = await optimizationProblemMapper(problem.trim());
      setMapping(res.data.mapping || null);
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
          <h1 className="page-title">Optimization Problem Mapper</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Optimization Problem Mapper</p>
        </div>
      </div>

      <main className="page-main">
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FiTrendingUp style={{ color: '#9945ff' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Map a classical optimization problem to a quantum approach</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              className="form-input form-textarea"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe your optimization problem (e.g. minimize total tour length over 50 cities given distance matrix)..."
              rows={6}
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-ai" disabled={loading || !problem.trim()}>
                {loading ? (
                  <span className="btn-loading"><span className="spinner-small" /> Mapping...</span>
                ) : (
                  <><FiSend /> Map to Quantum</>
                )}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setProblem(''); setMapping(null); setError(''); }}>
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
              <p>Analyzing problem structure...</p>
            </div>
          </div>
        )}

        {mapping && !loading && (
          <div className="card" style={{ padding: '1.5rem', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Quantum Mapping</h3>
              {model && <span className="ai-meta-badge">{model}</span>}
            </div>

            {mapping.classical_problem_class && (
              <Section title="Classical Problem Class">{mapping.classical_problem_class}</Section>
            )}
            {mapping.recommended_quantum_approach && (
              <Section title="Recommended Quantum Approach">{mapping.recommended_quantum_approach}</Section>
            )}
            {mapping.rationale && (
              <Section title="Rationale">{mapping.rationale}</Section>
            )}
            {mapping.qubo_formulation_sketch && (
              <Section title="QUBO/Ising Sketch">
                <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{mapping.qubo_formulation_sketch}</pre>
              </Section>
            )}
            {mapping.estimated_qubit_count !== undefined && (
              <Section title="Estimated Qubit Count">{mapping.estimated_qubit_count}</Section>
            )}
            {mapping.expected_speedup && (
              <Section title="Expected Speedup">{mapping.expected_speedup}</Section>
            )}
            {Array.isArray(mapping.hybrid_classical_steps) && (
              <Section title="Hybrid Classical Steps">
                <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  {mapping.hybrid_classical_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </Section>
            )}
            {mapping.hardware_recommendation && (
              <Section title="Hardware Recommendation">{mapping.hardware_recommendation}</Section>
            )}
            {Array.isArray(mapping.caveats) && (
              <Section title="Caveats">
                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  {mapping.caveats.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </Section>
            )}
            {mapping.raw_response && (
              <Section title="Raw Response">
                <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{mapping.raw_response}</pre>
              </Section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default OptimizationProblemMapperPage;
