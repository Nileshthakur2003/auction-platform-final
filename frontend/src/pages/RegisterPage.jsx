import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('0'); // 0: Buyer, 1: Seller
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!username || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        userType,
      });

      if (result.success) {
        toast.success('Registration successful! Please sign in.');
        navigate('/signin');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="container p-4 shadow-lg rounded"
      style={{
        maxWidth: '480px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
      }}
    >
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary mb-1">AuctionHub</h2>
        <p className="text-muted small">Create your account to get started</p>
      </div>

      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-dark">Account Type</label>
          <select
            className="form-select"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="0">Buyer (Bid on live auctions)</option>
            <option value="1">Seller (List items for auction)</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-semibold"
          disabled={submitting}
        >
          {submitting ? (
            <span>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="text-center mt-4 pt-2 border-top">
        <p className="text-muted mb-0 small">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary fw-semibold text-decoration-none">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
