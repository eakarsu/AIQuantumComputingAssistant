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
