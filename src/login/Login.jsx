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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Login failed');
        return;
      }

      // save token
      if (data?.data?.token) {
        localStorage.setItem('token', data.data.token);
      }

      // user login
      if (data?.data?.user) {
        onLogin(data.data.user);

        if (data.data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.data.user.role === 'delivery') {
          navigate('/delivery-orders');
        } else {
          navigate('/');
        }
      } else {
        setError('No user data returned');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Server not reachable. Check backend or internet.');
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

        <h1>Welcome back</h1>
        <p>Login to continue</p>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <button onClick={handleGuestCheckout}>
          Continue as Guest
        </button>

        <p>
          Don’t have account? <Link to="/signup">Sign up</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;