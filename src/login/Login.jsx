import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/home/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.token) localStorage.setItem('token', data.data.token);
        onLogin(data.data.user);
        navigate('/');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Server not reachable. Please check your connection.');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    onLogin({ name: 'Guest', role: 'guest' });
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome!!</h1>
          <p>Sign in to your account or continue as guest</p>
        </div>

        {error && <div className="error-message" style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-form-group">
            <label htmlFor="email">Email Address</label> <br /><br />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label><br /><br />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-divider">Or login with</div>

        <div className="social-login-buttons">
          <button className="social-btn" type="button">📘 Facebook</button>
          <button className="social-btn" type="button">📧 Google</button>
        </div>

        <button className="guest-checkout-btn" onClick={handleGuestCheckout} type="button">
          Continue as Guest
        </button>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
