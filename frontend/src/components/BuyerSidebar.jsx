import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BuyerSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '📊 Dashboard', path: '/buyer' },
    { label: '🔍 Browse All Auctions', path: '/buyer/all-auctions' },
    { label: '⏳ My Active Bids', path: '/buyer/current-auctions' },
    { label: '📜 Bidding History', path: '/buyer/bidding-history' },
    { label: '👤 My Profile', path: '/buyer/profile' },
  ];

  return (
    <div
      className="col-md-2 fixed-left d-flex flex-column justify-content-between p-3 text-white"
      style={{
        backgroundColor: '#1e293b',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      <div>
        <div className="mb-4 text-center border-bottom pb-3">
          <h4 className="fw-bold text-white mb-0">AuctionHub</h4>
          <span className="badge bg-primary text-uppercase mt-1">Buyer Portal</span>
        </div>

        {user && (
          <div className="card mb-3 border-0" style={{ backgroundColor: '#334155', color: '#f1f5f9' }}>
            <div className="card-body p-3">
              <div className="small text-muted mb-1">Signed in as</div>
              <h6 className="card-title fw-bold mb-1 text-truncate">{user.username}</h6>
              <p className="card-text small text-muted text-truncate mb-0">{user.email}</p>
            </div>
          </div>
        )}

        <ul className="nav nav-pills flex-column mb-auto gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li className="nav-item" key={item.path}>
                <button
                  type="button"
                  className={`nav-link w-100 text-start d-flex align-items-center py-2 px-3 rounded ${
                    isActive ? 'active bg-primary text-white fw-bold' : 'text-light'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    border: 'none',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-3 border-top border-secondary">
        <button
          className="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2"
          onClick={logout}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

export default BuyerSidebar;
