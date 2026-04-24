import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import {
  FiCpu,
  FiShield,
  FiTrendingUp,
  FiCircle,
  FiGrid,
  FiPlay,
  FiActivity,
  FiEye,
  FiLink,
  FiBox,
  FiBook,
  FiLayers,
  FiServer,
  FiBarChart2,
  FiAward,
  FiDatabase,
  FiClock,
  FiZap,
} from 'react-icons/fi';

const FEATURES = [
  { name: 'Circuit Design', slug: 'circuit-design', endpoint: 'circuit-designs', description: 'Design and simulate quantum circuits with drag-and-drop gate placement and real-time visualization.', icon: FiCpu, color: '#7b2ff7', gradient: 'linear-gradient(135deg, #7b2ff7 0%, #9945ff 100%)' },
  { name: 'Error Correction', slug: 'error-correction', endpoint: 'error-corrections', description: 'Implement and analyze quantum error correction codes to maintain qubit coherence.', icon: FiShield, color: '#00d4ff', gradient: 'linear-gradient(135deg, #0088ff 0%, #00d4ff 100%)' },
  { name: 'Algorithm Optimization', slug: 'algorithm-optimization', endpoint: 'algorithm-optimizations', description: 'Optimize quantum algorithms for performance, depth reduction, and gate efficiency.', icon: FiTrendingUp, color: '#9945ff', gradient: 'linear-gradient(135deg, #7b2ff7 0%, #ff6b6b 100%)' },
  { name: 'Qubit Management', slug: 'qubit-management', endpoint: 'qubit-managements', description: 'Monitor and manage qubit states, coherence times, and physical qubit assignments.', icon: FiCircle, color: '#00d4ff', gradient: 'linear-gradient(135deg, #00d4ff 0%, #0088ff 100%)' },
  { name: 'Gate Operations', slug: 'gate-operations', endpoint: 'gate-operations', description: 'Library of quantum gate operations with fidelity metrics and decomposition tools.', icon: FiGrid, color: '#ff6b9d', gradient: 'linear-gradient(135deg, #9945ff 0%, #ff6b9d 100%)' },
  { name: 'Quantum Simulation', slug: 'quantum-simulation', endpoint: 'quantum-simulations', description: 'Simulate quantum systems and run experiments on virtual quantum hardware.', icon: FiPlay, color: '#7b2ff7', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #7b2ff7 100%)' },
  { name: 'Noise Analysis', slug: 'noise-analysis', endpoint: 'noise-analyses', description: 'Analyze and characterize noise sources affecting quantum computation accuracy.', icon: FiActivity, color: '#ff6b6b', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff9945 100%)' },
  { name: 'State Visualization', slug: 'state-visualization', endpoint: 'state-visualizations', description: 'Visualize quantum states using Bloch spheres, density matrices, and Wigner functions.', icon: FiEye, color: '#00d4ff', gradient: 'linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%)' },
  { name: 'Entanglement Analysis', slug: 'entanglement-analysis', endpoint: 'entanglement-analyses', description: 'Measure and analyze entanglement entropy, Bell inequalities, and correlations.', icon: FiLink, color: '#9945ff', gradient: 'linear-gradient(135deg, #9945ff 0%, #00d4ff 100%)' },
  { name: 'Quantum ML', slug: 'quantum-ml', endpoint: 'quantum-mls', description: 'Quantum machine learning models including VQE, QAOA, and quantum neural networks.', icon: FiBox, color: '#ff6b9d', gradient: 'linear-gradient(135deg, #ff6b9d 0%, #7b2ff7 100%)' },
  { name: 'Research Papers', slug: 'research-papers', endpoint: 'research-papers', description: 'Curated database of quantum computing research papers with AI-powered summaries.', icon: FiBook, color: '#7b2ff7', gradient: 'linear-gradient(135deg, #0088ff 0%, #7b2ff7 100%)' },
  { name: 'Quantum Protocols', slug: 'quantum-protocols', endpoint: 'quantum-protocols', description: 'Standard quantum communication and cryptography protocols implementation.', icon: FiLayers, color: '#00d4ff', gradient: 'linear-gradient(135deg, #7b2ff7 0%, #00d4ff 100%)' },
  { name: 'Hardware Profiles', slug: 'hardware-profiles', endpoint: 'hardware-profiles', description: 'Detailed profiles of quantum hardware systems from IBM, Google, IonQ, and more.', icon: FiServer, color: '#9945ff', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #9945ff 100%)' },
  { name: 'Benchmark Tests', slug: 'benchmark-tests', endpoint: 'benchmark-tests', description: 'Standardized benchmarking tests for quantum volume, randomized benchmarking, and fidelity.', icon: FiBarChart2, color: '#ff9945', gradient: 'linear-gradient(135deg, #ff9945 0%, #ff6b6b 100%)' },
  { name: 'Learning Resources', slug: 'learning-resources', endpoint: 'learning-resources', description: 'Structured learning paths, tutorials, and interactive exercises for quantum computing.', icon: FiAward, color: '#00d4ff', gradient: 'linear-gradient(135deg, #00d4ff 0%, #9945ff 100%)' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        // stats are optional
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getFeatureCount = (endpoint) => {
    if (!stats || !stats.featureCounts) return null;
    return stats.featureCounts[endpoint] ?? null;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-bar">
        <div>
          <h1 className="dashboard-heading">Mission Control</h1>
          <p className="dashboard-subheading">
            Welcome back, <strong>{user.name || 'Researcher'}</strong>. Select a module to explore, analyze, and manage your quantum computing resources.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="dashboard-stats-row">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon" style={{ background: 'linear-gradient(135deg, #7b2ff7, #9945ff)' }}>
            <FiDatabase />
          </div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">
              {statsLoading ? '...' : (stats?.totalRecords ?? 0)}
            </span>
            <span className="dashboard-stat-label">Total Records</span>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon" style={{ background: 'linear-gradient(135deg, #0088ff, #00d4ff)' }}>
            <FiGrid />
          </div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">15</span>
            <span className="dashboard-stat-label">Feature Modules</span>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon" style={{ background: 'linear-gradient(135deg, #ff6b9d, #ff9945)' }}>
            <FiClock />
          </div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">
              {statsLoading ? '...' : (stats?.recentActivity ?? 0)}
            </span>
            <span className="dashboard-stat-label">Recent (7 days)</span>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon" style={{ background: 'linear-gradient(135deg, #2ed573, #00d4ff)' }}>
            <FiZap />
          </div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">Active</span>
            <span className="dashboard-stat-label">System Status</span>
          </div>
        </div>
      </div>

      <div className="features-grid">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          const count = getFeatureCount(feature.endpoint);
          return (
            <div
              key={feature.slug}
              className="feature-card"
              onClick={() => navigate(`/feature/${feature.slug}`)}
              style={{ '--card-gradient': feature.gradient, '--card-color': feature.color }}
            >
              <div className="feature-card-glow" />
              <div className="feature-card-icon-wrapper" style={{ background: feature.gradient }}>
                <Icon className="feature-card-icon" />
              </div>
              <div className="feature-card-content">
                <h3 className="feature-card-title">{feature.name}</h3>
                <p className="feature-card-description">{feature.description}</p>
              </div>
              <div className="feature-card-footer">
                {count !== null && (
                  <span className="feature-card-count">{count} record{count !== 1 ? 's' : ''}</span>
                )}
                <span className="feature-card-arrow">&rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="dashboard-shortcuts">
        <h3 className="shortcuts-title">Keyboard Shortcuts</h3>
        <div className="shortcuts-grid">
          <div className="shortcut-item">
            <kbd>N</kbd>
            <span>New Record</span>
          </div>
          <div className="shortcut-item">
            <kbd>Esc</kbd>
            <span>Close Modal</span>
          </div>
          <div className="shortcut-item">
            <kbd>Click</kbd>
            <span>View Details</span>
          </div>
          <div className="shortcut-item">
            <kbd>Shift+Click</kbd>
            <span>Select Multiple</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
