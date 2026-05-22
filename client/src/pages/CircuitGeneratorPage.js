import React, { useState } from 'react';
import { FiCpu, FiSend } from 'react-icons/fi';
import { circuitGenerator } from '../services/api';
import { useToast } from '../components/Toast';

function CircuitGeneratorPage() {
  const { addToast } = useToast();
  const [problem, setProblem] = useState('');
  const [qubitCount, setQubitCount] = useState('');
  const [hardware, setHardware] = useState('');
  const [gateSet, setGateSet] = useState('');
  const [circuit, setCircuit] = useState(null);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.trim()) return;
    setLoading(true);
    setError('');
    setCircuit(null);

    try {
      const res = await circuitGenerator(
        problem.trim(),
        qubitCount ? Number(qubitCount) : undefined,
        hardware || undefined,
        gateSet || undefined,
      );
      setCircuit(res.data.circuit || null);
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
          <h1 className="page-title">Circuit Generator</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Circuit Generator</p>
        </div>
      </div>

      <main className="page-main">
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FiCpu style={{ color: '#7b2ff7' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Generate an OpenQASM Circuit</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>
              Problem description
            </label>
            <textarea
              className="form-input form-textarea"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. 3-qubit GHZ state preparation; or a 2-qubit Grover search over {00,01,10,11} with marked state |11>"
              rows={4}
              style={{ marginBottom: '0.75rem' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>Qubit count</label>
                <input className="form-input" type="number" min={1} value={qubitCount} onChange={(e) => setQubitCount(e.target.value)} placeholder="auto" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>Target hardware</label>
                <input className="form-input" type="text" value={hardware} onChange={(e) => setHardware(e.target.value)} placeholder="e.g. IBM Eagle" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem', color: '#374151' }}>Gate set</label>
                <input className="form-input" type="text" value={gateSet} onChange={(e) => setGateSet(e.target.value)} placeholder="e.g. h, cx, rz, ry" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-ai" disabled={loading || !problem.trim()}>
                {loading ? (<span className="btn-loading"><span className="spinner-small" /> Generating...</span>) : (<><FiSend /> Generate</>)}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setProblem(''); setQubitCount(''); setHardware(''); setGateSet(''); setCircuit(null); setError(''); }}>
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
            <div className="ai-loading-content"><div className="ai-spinner" /><p>Generating circuit...</p></div>
          </div>
        )}

        {circuit && !loading && (
          <div className="card" style={{ padding: '1.5rem', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Generated Circuit</h3>
              {model && <span className="ai-meta-badge">{model}</span>}
            </div>

            {(circuit.qubit_count !== undefined || circuit.depth !== undefined) && (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {circuit.qubit_count !== undefined && <div><strong>Qubits:</strong> {circuit.qubit_count}</div>}
                {circuit.depth !== undefined && <div><strong>Depth:</strong> {circuit.depth}</div>}
              </div>
            )}

            {circuit.qasm && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7', marginBottom: '0.25rem' }}>QASM</div>
                <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{circuit.qasm}</pre>
              </div>
            )}

            {circuit.gate_summary && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Gate summary</div>
                <pre style={{ background: '#f3f4f6', padding: '0.5rem', borderRadius: 6, fontSize: '0.8rem' }}>{JSON.stringify(circuit.gate_summary, null, 2)}</pre>
              </div>
            )}

            {circuit.explanation && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Explanation</div>
                <div style={{ fontSize: '0.9rem' }}>{circuit.explanation}</div>
              </div>
            )}

            {Array.isArray(circuit.assumptions) && circuit.assumptions.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7b2ff7' }}>Assumptions</div>
                <ul style={{ fontSize: '0.85rem' }}>{circuit.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}

            {Array.isArray(circuit.caveats) && circuit.caveats.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>Caveats</div>
                <ul style={{ fontSize: '0.85rem' }}>{circuit.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}

            {circuit.raw_response && (
              <pre style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{circuit.raw_response}</pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CircuitGeneratorPage;
