import React, { useState } from 'react';
import { FiBarChart2, FiSend } from 'react-icons/fi';
import { benchmarkAnalysis } from '../services/api';
import { useToast } from '../components/Toast';

function BenchmarkAnalysisPage() {
  const { addToast } = useToast();
  const [hardwareFilter, setHardwareFilter] = useState('');
  const [benchmarkResults, setBenchmarkResults] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysis(null);

    let parsedResults;
    if (benchmarkResults.trim()) {
      try {
        parsedResults = JSON.parse(benchmarkResults);
      } catch (_) {
        const msg = 'benchmark_results must be valid JSON.';
        setError(msg);
        addToast(msg, 'error');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await benchmarkAnalysis(parsedResults, hardwareFilter || undefined);
      setAnalysis(res.data.analysis || null);
      setModel(res.data.model_used || '');
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.error || 'Request failed. Please try again.';
      if (status === 503) msg = msg + ' (No AI key configured on server.)';
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
          <h1 className="page-title">Benchmark Analysis</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Benchmark Analysis</p>
        </div>
      </div>

      <main className="page-main">
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FiBarChart2 style={{ color: '#ff9945' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Compare Quantum Hardware</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
              Hardware filter (optional)
            </label>
            <input
              className="form-input"
              type="text"
              value={hardwareFilter}
              onChange={(e) => setHardwareFilter(e.target.value)}
              placeholder="e.g. IBM"
              style={{ marginBottom: '0.75rem' }}
            />

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
              Benchmark results (optional JSON; leave blank to use DB)
            </label>
            <textarea
              className="form-input form-textarea"
              value={benchmarkResults}
              onChange={(e) => setBenchmarkResults(e.target.value)}
              placeholder='[{"hardware":"IBM Eagle","metric":"fidelity","value":0.97}]'
              rows={5}
              style={{ marginBottom: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-ai" disabled={loading}>
                {loading ? (<span className="btn-loading"><span className="spinner-small" /> Analysing...</span>) : (<><FiSend /> Analyse</>)}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setHardwareFilter(''); setBenchmarkResults(''); setAnalysis(null); setError(''); }}>
                Clear
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="card" style={{ padding: '1rem', maxWidth: 900, borderLeft: '4px solid #ef4444', color: '#991b1b' }}>{error}</div>
        )}

        {loading && (
          <div className="card" style={{ padding: '1.5rem', maxWidth: 900 }}>
            <div className="ai-loading-content"><div className="ai-spinner" /><p>Comparing platforms...</p></div>
          </div>
        )}

        {analysis && !loading && (
          <div className="card" style={{ padding: '1.5rem', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Analysis</h3>
              {model && <span className="ai-meta-badge">{model}</span>}
            </div>

            {Array.isArray(analysis.ranking) && analysis.ranking.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7', marginBottom: '0.5rem' }}>Ranking</div>
                {analysis.ranking.map((r, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{r.hardware}</strong>
                      {r.score !== undefined && <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Score: {r.score}</span>}
                    </div>
                    {Array.isArray(r.strengths) && r.strengths.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '0.25rem' }}>
                        Strengths: {r.strengths.join('; ')}
                      </div>
                    )}
                    {Array.isArray(r.weaknesses) && r.weaknesses.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>
                        Weaknesses: {r.weaknesses.join('; ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {analysis.best_for_low_depth && (
                <div><strong style={{ fontSize: '0.8rem', color: '#7b2ff7' }}>Low depth:</strong> <div>{analysis.best_for_low_depth}</div></div>
              )}
              {analysis.best_for_high_qubit_count && (
                <div><strong style={{ fontSize: '0.8rem', color: '#7b2ff7' }}>High qubits:</strong> <div>{analysis.best_for_high_qubit_count}</div></div>
              )}
              {analysis.best_for_fidelity && (
                <div><strong style={{ fontSize: '0.8rem', color: '#7b2ff7' }}>Fidelity:</strong> <div>{analysis.best_for_fidelity}</div></div>
              )}
            </div>

            {analysis.comparative_summary && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Summary</div>
                <div style={{ fontSize: '0.9rem' }}>{analysis.comparative_summary}</div>
              </div>
            )}

            {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Recommendations</div>
                <ul style={{ fontSize: '0.85rem' }}>{analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}

            {Array.isArray(analysis.caveats) && analysis.caveats.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>Caveats</div>
                <ul style={{ fontSize: '0.85rem' }}>{analysis.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}

            {analysis.raw_response && (
              <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{analysis.raw_response}</pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default BenchmarkAnalysisPage;
