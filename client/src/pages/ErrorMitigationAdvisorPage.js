import React, { useState } from 'react';
import { FiShield, FiSend } from 'react-icons/fi';
import { errorMitigationAdvisor } from '../services/api';
import { useToast } from '../components/Toast';

function ErrorMitigationAdvisorPage() {
  const { addToast } = useToast();
  const [circuit, setCircuit] = useState('');
  const [hardware, setHardware] = useState('');
  const [noiseProfile, setNoiseProfile] = useState('');
  const [targetFidelity, setTargetFidelity] = useState('');
  const [advice, setAdvice] = useState(null);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!circuit.trim()) return;
    setLoading(true);
    setError('');
    setAdvice(null);

    let np;
    if (noiseProfile.trim()) {
      try {
        np = JSON.parse(noiseProfile);
      } catch (_) {
        const msg = 'noise_profile must be valid JSON.';
        setError(msg);
        addToast(msg, 'error');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await errorMitigationAdvisor(
        circuit.trim(),
        hardware || undefined,
        np,
        targetFidelity || undefined,
      );
      setAdvice(res.data.advice || res.data.recommendation || res.data || null);
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
          <h1 className="page-title">Error Mitigation Advisor</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Error Mitigation Advisor</p>
        </div>
      </div>

      <main className="page-main">
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FiShield style={{ color: '#00d4ff' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Recommend Error-Mitigation Strategies</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
              Circuit description
            </label>
            <textarea
              className="form-input form-textarea"
              value={circuit}
              onChange={(e) => setCircuit(e.target.value)}
              placeholder="e.g. 5-qubit VQE ansatz, 30 layers, CNOT-heavy on linear topology"
              rows={4}
              style={{ marginBottom: '0.75rem' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>Hardware</label>
                <input className="form-input" type="text" value={hardware} onChange={(e) => setHardware(e.target.value)} placeholder="e.g. IBM Eagle" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>Target fidelity</label>
                <input className="form-input" type="text" value={targetFidelity} onChange={(e) => setTargetFidelity(e.target.value)} placeholder="e.g. 0.99" />
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', marginTop: '0.75rem', color: '#374151' }}>
              Noise profile (optional JSON)
            </label>
            <textarea
              className="form-input form-textarea"
              value={noiseProfile}
              onChange={(e) => setNoiseProfile(e.target.value)}
              placeholder='{"T1_us":120,"T2_us":80,"single_qubit_error":0.001,"two_qubit_error":0.01}'
              rows={3}
              style={{ marginBottom: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-ai" disabled={loading || !circuit.trim()}>
                {loading ? (<span className="btn-loading"><span className="spinner-small" /> Advising...</span>) : (<><FiSend /> Get Advice</>)}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setCircuit(''); setHardware(''); setNoiseProfile(''); setTargetFidelity(''); setAdvice(null); setError(''); }}>
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
            <div className="ai-loading-content"><div className="ai-spinner" /><p>Selecting strategies...</p></div>
          </div>
        )}

        {advice && !loading && (
          <div className="card" style={{ padding: '1.5rem', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Mitigation Strategies</h3>
              {model && <span className="ai-meta-badge">{model}</span>}
            </div>

            {Array.isArray(advice.primary_techniques) && advice.primary_techniques.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7', marginBottom: '0.5rem' }}>Primary Techniques</div>
                {advice.primary_techniques.map((t, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{t.name}</strong>
                      {t.overhead && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Overhead: {t.overhead}</span>}
                    </div>
                    {t.rationale && <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{t.rationale}</div>}
                    {t.expected_improvement && (
                      <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '0.25rem' }}>
                        Expected improvement: {t.expected_improvement}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(advice.circuit_modifications) && advice.circuit_modifications.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Circuit Modifications</div>
                <ul style={{ fontSize: '0.85rem' }}>{advice.circuit_modifications.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
            )}

            {Array.isArray(advice.post_processing_steps) && advice.post_processing_steps.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Post-processing Steps</div>
                <ul style={{ fontSize: '0.85rem' }}>{advice.post_processing_steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {advice.estimated_total_overhead && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Estimated overhead</div>
                  <div style={{ fontSize: '0.9rem' }}>{advice.estimated_total_overhead}</div>
                </div>
              )}
              {advice.expected_fidelity_gain && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Expected fidelity gain</div>
                  <div style={{ fontSize: '0.9rem' }}>{advice.expected_fidelity_gain}</div>
                </div>
              )}
            </div>

            {Array.isArray(advice.caveats) && advice.caveats.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>Caveats</div>
                <ul style={{ fontSize: '0.85rem' }}>{advice.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}

            {advice.raw_response && (
              <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{advice.raw_response}</pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ErrorMitigationAdvisorPage;
