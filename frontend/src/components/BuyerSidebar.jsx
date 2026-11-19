import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Clock,
  History,
  User,
  LogOut,
  Gavel,
  Menu,
  X,
} from 'lucide-react';

const BuyerSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/buyer', icon: LayoutDashboard },
    { label: 'Browse Auctions', path: '/buyer/all-auctions', icon: Compass },
    { label: 'My Active Bids', path: '/buyer/current-auctions', icon: Clock },
    { label: 'Bidding History', path: '/buyer/bidding-history', icon: History },
    { label: 'My Profile', path: '/buyer/profile', icon: User },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top App Bar (Visible only on < md screens) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Gavel className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">AuctionHub</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            Buyer
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Navigation Drawer / Sidebar */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-20 w-72 md:w-64 h-screen shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Desktop Logo Header */}
          <div className="hidden md:flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/80 shrink-0">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white tracking-tight mb-0">AuctionHub</h5>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Buyer Portal
              </span>
            </div>
          </div>

          {/* User Card */}
          {user && (
            <div className="p-3 mb-5 rounded-xl bg-slate-900/80 border border-slate-800 mt-14 md:mt-0 shrink-0">
              <div className="text-[11px] text-slate-400 mb-0.5">Signed in as</div>
              <div className="font-bold text-sm text-slate-200 truncate">{user.username}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer min-h-[44px] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 active:bg-slate-800'
                  }`}
                  onClick={() => handleNavClick(item.path)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4 border-t border-slate-800/80 shrink-0">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer min-h-[44px]"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default BuyerSidebar;
