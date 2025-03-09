import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardBuyer from './pages/DashboardBuyer';
import DashboardSeller from './pages/DashboardSeller';
import NewAuction from './pages/sellers/PostAuction';
import AuctionDetail from './pages/AuctionDetails';
import Navbar from './components/NavBar';
import { useState } from 'react';
import CurrentAuctions from './pages/sellers/CurrentAuctions';
import Earnings from './pages/sellers/earnings';
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

const App = () => {
  const [auctions, setAuctions] = useState([
    { title: 'Vintage Car', description: 'A classic vintage car.', startingBid: '5000' },
    { title: 'Antique Vase', description: 'A beautiful antique vase.', startingBid: '2000' }
  ]);


  return (
    <Router>
      {/* <Navbar /> */}
      <div className="d-flex justify-content-center align-items-center vh-100 vw-100 no-scroll-x">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/buyer" element={<DashboardBuyer auctions={auctions} />} />
          <Route path="/seller" element={<DashboardSeller auctions={auctions} />} />
          <Route path="/auction-detail" element={<AuctionDetail item={auctions[0]} />} />
          <Route path="/seller/post-auction" element={<NewAuction />} />
          <Route path="/seller/current-auctions" element={<CurrentAuctions />} />
          <Route path="/seller/all-auctions" element={<AllAuctionsForSeller />} />
          <Route path="/seller/earnings" element={<Earnings/>} />
          <Route path="/seller/profile" element={<MyProfile />} />

          <Route path="/buyer/current-auctions" element={<CurrentBuyerAuctions />} />
          <Route path="/buyer/all-auctions" element={<AllAuctionsForBuyer/>} />
          <Route path="/buyer/bidding-history" element={<BiddingHistory/>} />
          <Route path="/buyer/profile" element={<BuyerProfile />} />

          <Route path="/buyer/auction/:id" element={<BuyerAuctionDetail/>} />
          <Route path="/seller/auction/:id" element={<SellerAuctionDetail />} />

          <Route path="/buyer/auction/result/:id" element={<BuyerAuctionResult/>} />
          <Route path="/seller/auction/result/:id" element={<SellerAuctionResult />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
