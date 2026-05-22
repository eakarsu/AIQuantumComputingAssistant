import React, { useState, useEffect } from 'react';
import { FiServer, FiCpu, FiZap, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getFiltered, transpileCircuit } from '../services/api';
import AIResponsePanel from '../components/AIResponsePanel';
import { useToast } from '../components/Toast';

function HardwareTranspilerPage() {
  const { addToast } = useToast();
  const [hardwareProfiles, setHardwareProfiles] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [selectedHardware, setSelectedHardware] = useState('');
  const [selectedCircuit, setSelectedCircuit] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hwRes, circRes] = await Promise.all([
          getFiltered('hardware-profiles', { limit: 100 }),
          getFiltered('circuit-designs', { limit: 100 }),
        ]);
        setHardwareProfiles(hwRes.data?.data || []);
        setCircuits(circRes.data?.data || []);
      } catch (err) {
        addToast('Failed to load data', 'error');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTranspile = async (e) => {
    e.preventDefault();
    if (!selectedHardware || !selectedCircuit) {
      addToast('Please select both hardware and circuit', 'warning');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await transpileCircuit(selectedHardware, selectedCircuit);
      setResult(res.data);
      addToast('Transpiler analysis complete!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Transpiler analysis failed.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.transpiler_analysis;

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <div>
          <h1 className="page-title">Hardware Transpiler Advisor</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Hardware Transpiler</p>
        </div>
      </div>

      <main className="page-main">
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem' }}>
          {/* Configuration Panel */}
          <div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiServer style={{ color: '#9945ff' }} /> Configure Transpilation
              </h2>

              <form onSubmit={handleTranspile}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <FiServer style={{ marginRight: '0.25rem' }} /> Target Hardware
                  </label>
                  <select
                    className="form-input form-select"
                    value={selectedHardware}
                    onChange={(e) => setSelectedHardware(e.target.value)}
                    disabled={fetchLoading}
                  >
                    <option value="">Select hardware profile...</option>
                    {hardwareProfiles.map(hw => (
                      <option key={hw.id} value={hw.id}>
                        {hw.name} ({hw.manufacturer}, {hw.qubitCount} qubits)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">
                    <FiCpu style={{ marginRight: '0.25rem' }} /> Circuit to Transpile
                  </label>
                  <select
                    className="form-input form-select"
                    value={selectedCircuit}
                    onChange={(e) => setSelectedCircuit(e.target.value)}
                    disabled={fetchLoading}
                  >
                    <option value="">Select circuit design...</option>
                    {circuits.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.qubitCount} qubits)
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-ai" style={{ width: '100%' }} disabled={loading || !selectedHardware || !selectedCircuit}>
                  {loading ? (
                    <span className="btn-loading"><span className="spinner-small" /> Analyzing...</span>
                  ) : (
                    <><FiZap /> Run Transpiler Analysis</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {!result && !loading && !error && (
              <div className="empty-state">
                <div className="empty-icon"><FiServer /></div>
                <h3>No Analysis Yet</h3>
                <p>Select a hardware profile and circuit, then click "Run Transpiler Analysis" to get AI-powered optimization recommendations.</p>
              </div>
            )}

            {loading && (
              <div className="loading-state"><div className="spinner" /><p>Analyzing transpilation compatibility...</p></div>
            )}

            {error && (
              <div className="error-banner"><span className="error-icon">!</span> {error}</div>
            )}

            {result && analysis && (
              <div>
                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Compatibility Score</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#7b2ff7', margin: 0 }}>
                      {analysis.compatibility_score !== undefined ? `${Math.round(analysis.compatibility_score * 100)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Feasible</p>
                    <p style={{ fontSize: '1.5rem', margin: 0 }}>
                      {analysis.transpilation_feasible ? <FiCheckCircle color="#22c55e" /> : <FiAlertCircle color="#ef4444" />}
                    </p>
                  </div>
                  <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Est. Fidelity</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#00d4ff', margin: 0 }}>
                      {analysis.estimated_fidelity !== undefined ? `${Math.round(analysis.estimated_fidelity * 100)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {analysis.recommendations?.length > 0 && (
                  <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Optimization Recommendations</h3>
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', borderLeft: `3px solid ${rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#22c55e'}` }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 500, fontSize: '0.875rem', margin: '0 0 0.25rem' }}>{rec.action}</p>
                          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{rec.impact}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: rec.priority === 'high' ? '#fee2e2' : rec.priority === 'medium' ? '#fef3c7' : '#dcfce7', color: rec.priority === 'high' ? '#b91c1c' : rec.priority === 'medium' ? '#92400e' : '#166534', height: 'fit-content' }}>
                          {rec.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Details */}
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Analysis Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    {analysis.estimated_depth_after_transpile && <div><span style={{ color: '#888' }}>Transpiled Depth: </span><strong>{analysis.estimated_depth_after_transpile}</strong></div>}
                    {analysis.gate_overhead && <div><span style={{ color: '#888' }}>Gate Overhead: </span><strong>{analysis.gate_overhead}</strong></div>}
                    {analysis.required_swaps !== undefined && <div><span style={{ color: '#888' }}>Required SWAPs: </span><strong>{analysis.required_swaps}</strong></div>}
                    {analysis.unsupported_gates?.length > 0 && <div><span style={{ color: '#888' }}>Unsupported Gates: </span><strong style={{ color: '#ef4444' }}>{analysis.unsupported_gates.join(', ')}</strong></div>}
                  </div>
                  {analysis.warnings?.length > 0 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                      <strong style={{ fontSize: '0.875rem', color: '#92400e' }}>Warnings:</strong>
                      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1rem', fontSize: '0.8rem', color: '#78350f' }}>
                        {analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HardwareTranspilerPage;
