import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiPlay, FiZap, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { getFiltered, runBenchmark } from '../services/api';
import { useToast } from '../components/Toast';

function BenchmarkRunnerPage() {
  const { addToast } = useToast();
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [runResults, setRunResults] = useState({});
  const [runningId, setRunningId] = useState(null);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        const res = await getFiltered('benchmark-tests', { limit: 100 });
        setBenchmarks(res.data?.data || []);
      } catch (err) {
        addToast('Failed to load benchmarks', 'error');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchBenchmarks();
  }, []);

  const handleRun = async (benchmark) => {
    setRunningId(benchmark.id);
    try {
      const res = await runBenchmark(benchmark.id);
      setRunResults(prev => ({ ...prev, [benchmark.id]: res.data }));
      addToast(`Benchmark "${benchmark.name}" analysis complete!`, 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Benchmark run failed.';
      setRunResults(prev => ({ ...prev, [benchmark.id]: { error: msg } }));
      addToast(msg, 'error');
    } finally {
      setRunningId(null);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return '#888';
    if (grade.startsWith('A')) return '#22c55e';
    if (grade.startsWith('B')) return '#3b82f6';
    if (grade.startsWith('C')) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <div>
          <h1 className="page-title">Benchmark Runner</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Benchmark Runner</p>
        </div>
      </div>

      <main className="page-main">
        {fetchLoading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading benchmarks...</p></div>
        ) : benchmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiBarChart2 /></div>
            <h3>No Benchmark Tests</h3>
            <p>Create benchmark tests first, then run them here.</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Select a benchmark test to run AI-powered performance evaluation. Results are automatically saved to the benchmark record.
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {benchmarks.map(bm => {
                const result = runResults[bm.id];
                const analysis = result?.run_analysis;
                const isRunning = runningId === bm.id;

                return (
                  <div key={bm.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: result ? '1rem' : 0 }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{bm.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                          Type: {bm.benchmarkType} | Qubits: {bm.qubitCount || 'N/A'} | QV: {bm.quantumVolume || 'N/A'}
                        </p>
                        {bm.hardwareTarget && (
                          <p style={{ fontSize: '0.75rem', color: '#888', margin: '0.25rem 0 0' }}>Target: {bm.hardwareTarget}</p>
                        )}
                      </div>
                      <button
                        className="btn btn-ai btn-sm"
                        onClick={() => handleRun(bm)}
                        disabled={isRunning || !!runningId}
                      >
                        {isRunning ? (
                          <span className="btn-loading"><span className="spinner-small" /> Running...</span>
                        ) : (
                          <><FiPlay /> Run Analysis</>
                        )}
                      </button>
                    </div>

                    {result?.error && (
                      <div className="error-banner" style={{ marginTop: '0.75rem' }}>
                        <span className="error-icon">!</span> {result.error}
                      </div>
                    )}

                    {analysis && !result.error && (
                      <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 0.15rem' }}>Grade</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: getGradeColor(analysis.performance_grade), margin: 0 }}>
                              {analysis.performance_grade || 'N/A'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 0.15rem' }}>Score</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7b2ff7', margin: 0 }}>
                              {analysis.overall_score || 'N/A'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 0.15rem' }}>Readiness</p>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', margin: 0 }}>
                              {analysis.readiness_level || 'N/A'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 0.15rem' }}>Saved</p>
                            <p style={{ fontSize: '1.25rem', margin: 0 }}>
                              {result.persisted ? <FiCheckCircle color="#22c55e" /> : '—'}
                            </p>
                          </div>
                        </div>

                        {analysis.summary && (
                          <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0 0 0.75rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px' }}>
                            {analysis.summary}
                          </p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {analysis.strengths?.length > 0 && (
                            <div>
                              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>Strengths</p>
                              <ul style={{ fontSize: '0.8rem', color: '#374151', margin: 0, paddingLeft: '1rem' }}>
                                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                          )}
                          {analysis.weaknesses?.length > 0 && (
                            <div>
                              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b91c1c', marginBottom: '0.25rem' }}>Weaknesses</p>
                              <ul style={{ fontSize: '0.8rem', color: '#374151', margin: 0, paddingLeft: '1rem' }}>
                                {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>

                        {analysis.comparison_to_baseline && (
                          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            <FiTrendingUp style={{ marginRight: '0.25rem' }} />
                            {analysis.comparison_to_baseline}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BenchmarkRunnerPage;
