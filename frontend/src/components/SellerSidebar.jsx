import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Clock, Package, DollarSign, User, LogOut, Gavel } from 'lucide-react';

const SellerSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/seller', icon: LayoutDashboard },
    { label: 'Post New Auction', path: '/seller/post-auction', icon: PlusCircle },
    { label: 'My Active Listings', path: '/seller/current-auctions', icon: Clock },
    { label: 'All My Auctions', path: '/seller/all-auctions', icon: Package },
    { label: 'Earnings & Sales', path: '/seller/earnings', icon: DollarSign },
    { label: 'Seller Profile', path: '/seller/profile', icon: User },
  ];

  return (
    <div
      className="col-md-2 fixed-left flex flex-col justify-between p-4 text-slate-100 border-r border-slate-800/80"
      style={{
        backgroundColor: '#090d16',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      <div>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-white tracking-tight mb-0">AuctionHub</h5>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Seller Portal</span>
          </div>
        </div>

        {user && (
          <div className="p-3 mb-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-0.5">Signed in as</div>
            <div className="font-bold text-sm text-slate-200 truncate">{user.username}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>
        )}

        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <button
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default SellerSidebar;
