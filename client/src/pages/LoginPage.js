import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { FiZap, FiMail, FiLock, FiLogIn } from 'react-icons/fi';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    const quickEmail = process.env.REACT_APP_DEMO_EMAIL || '';
    const quickPassword = process.env.REACT_APP_DEMO_PASSWORD || '';
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
    setLoading(true);
    try {
      const response = await login(quickEmail, quickPassword);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Quick login failed. Please try manual login.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated background particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={`particle particle-${i % 5}`} />
        ))}
      </div>

      <div className="login-card">
        {/* Branding */}
        <div className="login-header">
          <div className="login-logo">
            <FiZap className="logo-icon" />
          </div>
          <h1 className="login-title">Quantum AI</h1>
          <p className="login-subtitle">AI Quantum Computing Assistant</p>
          <p className="login-tagline">
            Harness the power of quantum computing with intelligent AI analysis
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FiMail className="label-icon" /> Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@quantum.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FiLock className="label-icon" /> Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-small" /> Authenticating...
              </span>
            ) : (
              <span className="btn-content">
                <FiLogIn /> Sign In
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>or</span>
        </div>

        {/* Quick Login */}
        <button
          type="button"
          className="btn btn-quick-login"
          onClick={handleQuickLogin}
          disabled={loading}
        >
          <FiZap />
          Quick Login (Demo)
        </button>

        <p className="quick-login-hint">
          Uses admin@quantum.ai / quantum123
        </p>

        {/* Footer */}
        <div className="login-footer">
          <p>Powered by Claude AI &amp; Quantum Computing Technology</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
