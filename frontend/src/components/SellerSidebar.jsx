import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SellerSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '📊 Dashboard', path: '/seller' },
    { label: '➕ Post New Auction', path: '/seller/post-auction' },
    { label: '⏳ My Active Listings', path: '/seller/current-auctions' },
    { label: '📦 All My Auctions', path: '/seller/all-auctions' },
    { label: '💰 Earnings & Sales', path: '/seller/earnings' },
    { label: '👤 Seller Profile', path: '/seller/profile' },
  ];

  return (
    <div
      className="col-md-2 fixed-left d-flex flex-column justify-content-between p-3 text-white"
      style={{
        backgroundColor: '#0f172a',
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
          <span className="badge bg-success text-uppercase mt-1">Seller Portal</span>
        </div>

        {user && (
          <div className="card mb-3 border-0" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
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
                    isActive ? 'active bg-success text-white fw-bold' : 'text-light'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#16a34a' : 'transparent',
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

export default SellerSidebar;
