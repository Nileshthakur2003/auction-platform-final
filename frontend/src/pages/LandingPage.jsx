import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, userType } = useAuth();

  const dashboardPath = userType === '1' ? '/seller' : '/buyer';

  return (
    <div className="container py-5 text-center" style={{ maxWidth: '850px' }}>
      <div className="card shadow-lg p-5 border-0 rounded-4 bg-white">
        <div className="mb-3">
          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fs-6 fw-semibold">
            ⚡ Real-Time Bidding Engine
          </span>
        </div>
        <h1 className="display-4 fw-bold text-dark mb-3">Online Auction Platform</h1>
        <p className="lead text-muted mb-4">
          Discover rare collectibles, electronics, and valuable items. Place live bids in
          real time and win exciting auctions from anywhere.
        </p>

        <div className="d-flex justify-content-center gap-3 mb-5">
          {isAuthenticated ? (
            <Link to={dashboardPath} className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm">
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link to="/signin" className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-outline-primary btn-lg px-4 fw-semibold">
                Create Free Account
              </Link>
            </>
          )}
        </div>

        <div className="row g-4 text-start border-top pt-4">
          <div className="col-md-4">
            <h5 className="fw-bold text-primary mb-2">⏱ Real-Time Updates</h5>
            <p className="text-muted small">
              Live WebSocket synchronization ensures you see outbids and price increases instantly.
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold text-primary mb-2">🛡 Secure Transactions</h5>
            <p className="text-muted small">
              Role-based authentication and atomic concurrency control guarantee fair bidding.
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold text-primary mb-2">📊 Seller Analytics</h5>
            <p className="text-muted small">
              Sellers can track live listings, monitor earnings, and manage auction lifecycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
