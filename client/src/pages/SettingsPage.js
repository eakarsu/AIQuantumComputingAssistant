import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiSun, FiMoon, FiMonitor, FiInfo, FiDatabase, FiClock } from 'react-icons/fi';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Profile form
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Theme
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Preferences
  const [pageSize, setPageSize] = useState(Number(localStorage.getItem('pageSize')) || 20);
  const [compactMode, setCompactMode] = useState(localStorage.getItem('compactMode') === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pageSize', pageSize);
  }, [pageSize]);

  useEffect(() => {
    localStorage.setItem('compactMode', compactMode);
    if (compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [compactMode]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      localStorage.setItem('user', JSON.stringify(data.user));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/auth/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'preferences', label: 'Preferences', icon: FiMonitor },
    { id: 'about', label: 'About', icon: FiInfo },
  ];

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; Settings</p>
        </div>
      </div>

      <main className="page-main">
        <div className="settings-layout">
          <div className="settings-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'settings-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="settings-content">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Profile Information</h2>
                <p className="settings-section-desc">Update your personal information.</p>
                {profileMsg.text && (
                  <div className={`settings-msg settings-msg-${profileMsg.type}`}>{profileMsg.text}</div>
                )}
                <form onSubmit={handleProfileSave} className="settings-form">
                  <div className="form-group">
                    <label className="form-label"><FiUser className="label-icon" /> Full Name</label>
                    <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiMail className="label-icon" /> Email Address</label>
                    <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input type="text" className="form-input" value={user.role || 'researcher'} disabled />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : <><FiSave /> Save Changes</>}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Change Password</h2>
                <p className="settings-section-desc">Ensure your account stays secure.</p>
                {passwordMsg.text && (
                  <div className={`settings-msg settings-msg-${passwordMsg.type}`}>{passwordMsg.text}</div>
                )}
                <form onSubmit={handlePasswordChange} className="settings-form">
                  <div className="form-group">
                    <label className="form-label"><FiLock className="label-icon" /> Current Password</label>
                    <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiLock className="label-icon" /> New Password</label>
                    <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiLock className="label-icon" /> Confirm New Password</label>
                    <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                    {passwordLoading ? 'Changing...' : <><FiLock /> Change Password</>}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Appearance</h2>
                <p className="settings-section-desc">Customize the look and feel.</p>
                <div className="theme-options">
                  {[
                    { id: 'dark', label: 'Dark', icon: FiMoon, desc: 'Default dark theme' },
                    { id: 'light', label: 'Light', icon: FiSun, desc: 'Light theme for bright environments' },
                    { id: 'midnight', label: 'Midnight', icon: FiMonitor, desc: 'Deep dark for OLED displays' },
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        className={`theme-option ${theme === t.id ? 'theme-option-active' : ''}`}
                        onClick={() => setTheme(t.id)}
                      >
                        <Icon className="theme-option-icon" />
                        <span className="theme-option-label">{t.label}</span>
                        <span className="theme-option-desc">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Preferences</h2>
                <p className="settings-section-desc">Configure app behavior.</p>
                <div className="preference-items">
                  <div className="preference-item">
                    <div className="preference-info">
                      <FiDatabase className="preference-icon" />
                      <div>
                        <span className="preference-label">Default Page Size</span>
                        <span className="preference-desc">Number of records per page in tables</span>
                      </div>
                    </div>
                    <select className="preference-select" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <FiMonitor className="preference-icon" />
                      <div>
                        <span className="preference-label">Compact Mode</span>
                        <span className="preference-desc">Reduce spacing and padding throughout the UI</span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={compactMode} onChange={e => setCompactMode(e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="settings-section">
                <h2 className="settings-section-title">About</h2>
                <div className="about-info">
                  <div className="about-logo-big">
                    <FiMonitor />
                  </div>
                  <h3>AI Quantum Computing Assistant</h3>
                  <p className="about-version">Version 1.0.0</p>
                  <p className="about-desc">
                    A comprehensive platform for quantum computing research, analysis, and management.
                    Features 15 specialized modules covering circuit design, error correction, algorithm optimization,
                    and more — all enhanced with AI-powered analysis.
                  </p>
                  <div className="about-stats">
                    <div className="about-stat">
                      <span className="about-stat-num">15</span>
                      <span className="about-stat-label">Feature Modules</span>
                    </div>
                    <div className="about-stat">
                      <span className="about-stat-num">Full</span>
                      <span className="about-stat-label">CRUD Support</span>
                    </div>
                    <div className="about-stat">
                      <span className="about-stat-num">AI</span>
                      <span className="about-stat-label">Powered Analysis</span>
                    </div>
                  </div>
                  <div className="about-tech">
                    <span className="tech-badge">React 18</span>
                    <span className="tech-badge">Express.js</span>
                    <span className="tech-badge">PostgreSQL</span>
                    <span className="tech-badge">Sequelize ORM</span>
                    <span className="tech-badge">JWT Auth</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
