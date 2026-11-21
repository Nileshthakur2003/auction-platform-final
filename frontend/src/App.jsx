import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardBuyer from './pages/DashboardBuyer';
import DashboardSeller from './pages/DashboardSeller';
import NewAuction from './pages/sellers/PostAuction';
import CurrentAuctions from './pages/sellers/CurrentAuctions';
import Earnings from './pages/sellers/Earnings'; // Case-sensitivity fix!
import MyProfile from './pages/sellers/SellerProfile';
import AllAuctionsForSeller from './pages/sellers/AllAuctions';
import CurrentBuyerAuctions from './pages/buyers/CurrentAuctions';
import AllAuctionsForBuyer from './pages/buyers/AllAuctions';
import BiddingHistory from './pages/buyers/BiddingHistory';
import BuyerProfile from './pages/buyers/BuyersProfile';
import SellerAuctionDetail from './pages/sellers/AuctionDetailForSellers';
import BuyerAuctionDetail from './pages/buyers/AuctionDetailsForBuyers';
import BuyerAuctionResult from './pages/buyers/AuctionResultForBuyer';
import SellerAuctionResult from './pages/sellers/AuctionResultForSeller';
import TermsPage from './pages/TermsPage';

const App = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Buyer Protected Routes */}
            <Route
              path="/buyer"
              element={
                <ProtectedRoute allowedRole="0">
                  <DashboardBuyer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/all-auctions"
              element={
                <ProtectedRoute allowedRole="0">
                  <AllAuctionsForBuyer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/current-auctions"
              element={
                <ProtectedRoute allowedRole="0">
                  <CurrentBuyerAuctions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/bidding-history"
              element={
                <ProtectedRoute allowedRole="0">
                  <BiddingHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/profile"
              element={
                <ProtectedRoute allowedRole="0">
                  <BuyerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/auction/:id"
              element={
                <ProtectedRoute allowedRole="0">
                  <BuyerAuctionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/auction/result/:id"
              element={
                <ProtectedRoute allowedRole="0">
                  <BuyerAuctionResult />
                </ProtectedRoute>
              }
            />

            {/* Seller Protected Routes */}
            <Route
              path="/seller"
              element={
                <ProtectedRoute allowedRole="1">
                  <DashboardSeller />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/post-auction"
              element={
                <ProtectedRoute allowedRole="1">
                  <NewAuction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/current-auctions"
              element={
                <ProtectedRoute allowedRole="1">
                  <CurrentAuctions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/all-auctions"
              element={
                <ProtectedRoute allowedRole="1">
                  <AllAuctionsForSeller />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/earnings"
              element={
                <ProtectedRoute allowedRole="1">
                  <Earnings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/profile"
              element={
                <ProtectedRoute allowedRole="1">
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/auction/:id"
              element={
                <ProtectedRoute allowedRole="1">
                  <SellerAuctionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/auction/result/:id"
              element={
                <ProtectedRoute allowedRole="1">
                  <SellerAuctionResult />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
