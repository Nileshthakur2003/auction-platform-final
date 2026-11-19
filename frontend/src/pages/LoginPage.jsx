import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful!');
        if (String(result.userType) === '0') {
          navigate('/buyer');
        } else {
          navigate('/seller');
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="container p-4 shadow-lg rounded"
      style={{
        maxWidth: '450px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
      }}
    >
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary mb-1">AuctionHub</h2>
        <p className="text-muted small">Sign in to participate in live auctions</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Email Address</label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">@</span>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-dark">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-semibold"
          disabled={submitting}
        >
          {submitting ? (
            <span>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center mt-4 pt-2 border-top">
        <p className="text-muted mb-0 small">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
