import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './PortalPages.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/my-bookings');
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div className="portal-container">
          <Link to="/" className="portal-logo-link">✨ Salon Studio</Link>
        </div>
      </header>

      <main className="portal-main">
        <form onSubmit={handleSubmit} className="portal-card portal-form-card">
          <h2>Welcome back</h2>
          <p className="portal-subtitle">Sign in to manage your bookings.</p>

          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">Sign in</button>
          <p className="portal-inline-text">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}