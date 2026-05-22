import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiZap,
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
  FiHome,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiMessageCircle,
  FiRepeat,
  FiTarget,
} from 'react-icons/fi';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', slug: '/dashboard', icon: FiHome, color: '#7b2ff7' },
    ],
  },
  {
    title: 'Core Tools',
    items: [
      { name: 'Circuit Design', slug: '/feature/circuit-design', icon: FiCpu, color: '#7b2ff7' },
      { name: 'Error Correction', slug: '/feature/error-correction', icon: FiShield, color: '#00d4ff' },
      { name: 'Algorithm Optimization', slug: '/feature/algorithm-optimization', icon: FiTrendingUp, color: '#9945ff' },
      { name: 'Gate Operations', slug: '/feature/gate-operations', icon: FiGrid, color: '#ff6b9d' },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { name: 'Qubit Management', slug: '/feature/qubit-management', icon: FiCircle, color: '#00d4ff' },
      { name: 'Quantum Simulation', slug: '/feature/quantum-simulation', icon: FiPlay, color: '#7b2ff7' },
      { name: 'Noise Analysis', slug: '/feature/noise-analysis', icon: FiActivity, color: '#ff6b6b' },
      { name: 'State Visualization', slug: '/feature/state-visualization', icon: FiEye, color: '#00d4ff' },
      { name: 'Entanglement Analysis', slug: '/feature/entanglement-analysis', icon: FiLink, color: '#9945ff' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'Quantum ML', slug: '/feature/quantum-ml', icon: FiBox, color: '#ff6b9d' },
      { name: 'Research Papers', slug: '/feature/research-papers', icon: FiBook, color: '#7b2ff7' },
      { name: 'Quantum Protocols', slug: '/feature/quantum-protocols', icon: FiLayers, color: '#00d4ff' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { name: 'Hardware Profiles', slug: '/feature/hardware-profiles', icon: FiServer, color: '#9945ff' },
      { name: 'Benchmark Tests', slug: '/feature/benchmark-tests', icon: FiBarChart2, color: '#ff9945' },
      { name: 'Learning Resources', slug: '/feature/learning-resources', icon: FiAward, color: '#00d4ff' },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { name: 'Quantum Query', slug: '/quantum-query', icon: FiMessageCircle, color: '#7b2ff7' },
      { name: 'HW Transpiler', slug: '/hardware-transpiler', icon: FiRepeat, color: '#00d4ff' },
      { name: 'Benchmark Runner', slug: '/benchmark-runner', icon: FiTarget, color: '#ff6b9d' },
      { name: 'Algorithm Explainer', slug: '/algorithm-explainer', icon: FiBook, color: '#7b2ff7' },
      { name: 'Optimization Mapper', slug: '/optimization-problem-mapper', icon: FiTrendingUp, color: '#9945ff' },
      { name: 'HW Recommendation', slug: '/hardware-recommendation', icon: FiServer, color: '#9945ff' },
      { name: 'Circuit Generator', slug: '/circuit-generator', icon: FiCpu, color: '#7b2ff7' },
      { name: 'Benchmark Analysis', slug: '/benchmark-analysis', icon: FiBarChart2, color: '#ff9945' },
      { name: 'Error Mitigation', slug: '/error-mitigation-advisor', icon: FiShield, color: '#00d4ff' },
    ],
  },
  {
    title: 'Gap Features',
    items: [
      { name: 'Algo Explainer Gap', slug: '/gap-no-algorithmexplainer-plainenglish-explanati', icon: FiBook, color: '#ff6b6b' },
      { name: 'Circuit Generator Gap', slug: '/gap-no-circuitgenerator-from-problem-description', icon: FiCpu, color: '#ff6b6b' },
      { name: 'Optimization Mapper Gap', slug: '/gap-no-optimizationproblemmapper-classical-quant', icon: FiTrendingUp, color: '#ff6b6b' },
      { name: 'HW Recommendation Gap', slug: '/gap-no-hardwarerecommendation-ibm-ionq-rigetti-r', icon: FiServer, color: '#ff9945' },
      { name: 'Benchmark Analysis Gap', slug: '/gap-no-benchmarkanalysis-across-providers', icon: FiBarChart2, color: '#ff9945' },
      { name: 'Error Mitigation Gap', slug: '/gap-no-errormitigation-advisor', icon: FiShield, color: '#ff9945' },
      { name: 'Circuit Diagram Gap', slug: '/gap-no-circuit-diagram-visualizationeditor', icon: FiEye, color: '#9945ff' },
      { name: 'Quantum Simulator Gap', slug: '/gap-no-quantum-simulator-integration-qiskitcirqb', icon: FiPlay, color: '#9945ff' },
      { name: 'Course Structure Gap', slug: '/gap-no-educational-courselesson-structure', icon: FiAward, color: '#9945ff' },
      { name: 'Benchmarking Store Gap', slug: '/gap-no-benchmarking-framework-or-result-store', icon: FiActivity, color: '#00d4ff' },
      { name: 'HW Credentials Gap', slug: '/gap-no-hardware-provider-accountcredential-mgmt', icon: FiLayers, color: '#00d4ff' },
      { name: 'Circuit Library Gap', slug: '/gap-no-saved-circuits-sharing-or-library', icon: FiGrid, color: '#00d4ff' },
      { name: 'Notifications/RBAC Gap', slug: '/gap-no-notifications-or-rbac', icon: FiZap, color: '#7b2ff7' },
    ],
  },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (slug) => location.pathname === slug;

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-wrapper">
          <FiZap className="sidebar-logo-icon" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Quantum AI</span>
            <span className="sidebar-brand-sub">Computing Assistant</span>
          </div>
        )}
      </div>

      {/* ── Toggle ── */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="sidebar-section">
            {!collapsed && (
              <div className="sidebar-section-title">{section.title}</div>
            )}
            {collapsed && <div className="sidebar-section-divider" />}
            <ul className="sidebar-menu">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.slug);
                return (
                  <li key={item.slug}>
                    <button
                      className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
                      onClick={() => navigate(item.slug)}
                      title={collapsed ? item.name : undefined}
                      style={{ '--item-color': item.color }}
                    >
                      <span className={`sidebar-item-icon ${active ? 'sidebar-item-icon-active' : ''}`}>
                        <Icon />
                      </span>
                      {!collapsed && (
                        <span className="sidebar-item-label">{item.name}</span>
                      )}
                      {active && <span className="sidebar-active-indicator" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        {/* Settings */}
        <button
          className={`sidebar-item sidebar-footer-item ${isActive('/settings') ? 'sidebar-item-active' : ''}`}
          title={collapsed ? 'Settings' : undefined}
          onClick={() => navigate('/settings')}
        >
          <span className="sidebar-item-icon">
            <FiSettings />
          </span>
          {!collapsed && <span className="sidebar-item-label">Settings</span>}
        </button>

        {/* User profile */}
        <div className={`sidebar-user ${collapsed ? 'sidebar-user-collapsed' : ''}`}>
          <div className="sidebar-user-avatar">
            {(user.name || 'U')[0]}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name || 'User'}</span>
              <span className="sidebar-user-role">{user.role || 'Researcher'}</span>
            </div>
          )}
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
