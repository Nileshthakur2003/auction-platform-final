import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from '../components/apiconnector';
import Sidebar from '../components/SellerSidebar';
import socket from '../socket';

const DashboardSeller = () => {
  const [activeListings, setActiveListings] = useState([]);
  const [globalAuctions, setGlobalAuctions] = useState([]);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [bidsReceived, setBidsReceived] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSellerData = async () => {
    try {
      const [sellerRes, globalRes, statsRes] = await Promise.all([
        ApiConnector.get('/getAuctionsForSeller'),
        ApiConnector.get('/auctions'),
        ApiConnector.get('/getstats'),
      ]);

      const myAuctions = sellerRes.data || [];
      const liveOnly = myAuctions.filter((a) => !a.isClosed);

      setActiveListings(liveOnly);
      setTotalAuctions(myAuctions.length);
      setGlobalAuctions(globalRes.data || []);
      setEarnings(statsRes.data?.totalEarnings || 0);
      setBidsReceived(statsRes.data?.bidsReceived || 0);
    } catch (error) {
      console.error('Error fetching seller dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();

    socket.on('auction_feed_update', () => {
      fetchSellerData();
    });

    socket.on('auction_created', () => {
      fetchSellerData();
    });

    return () => {
      socket.off('auction_feed_update');
      socket.off('auction_created');
    };
  }, []);

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <Sidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-1">Seller Dashboard</h2>
              <p className="text-muted mb-0">Manage your listings, bids, and revenue</p>
            </div>
            <button
              className="btn btn-success px-4 py-2 fw-semibold shadow-sm"
              onClick={() => navigate('/seller/post-auction')}
            >
              + Create New Auction
            </button>
          </div>

          {/* Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-primary text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">My Live Listings</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">
                    {loading ? '...' : activeListings.length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-secondary text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Total Listed Items</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">
                    {loading ? '...' : totalAuctions}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-info text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Total Bids Received</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">
                    {loading ? '...' : bidsReceived}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-success text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Total Realized Revenue</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">
                    {loading ? '...' : `$${Number(earnings).toLocaleString()}`}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* My Active Listings Section */}
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-dark mb-0">My Active Listings</h4>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate('/seller/current-auctions')}
              >
                View All Listings &rarr;
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : activeListings.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-4 rounded-3">
                <div className="card-body">
                  <p className="text-muted mb-3">You do not have any active auctions right now.</p>
                  <button
                    className="btn btn-success"
                    onClick={() => navigate('/seller/post-auction')}
                  >
                    Post an Auction Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {activeListings.slice(0, 3).map((auction) => (
                  <div className="col-md-4" key={auction._id}>
                    <div
                      className="card h-100 border-0 shadow-sm rounded-3 hover-shadow"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/seller/auction/${auction._id}`)}
                    >
                      <div className="card-header bg-dark text-white fw-bold py-2 d-flex justify-content-between">
                        <span className="text-truncate" style={{ maxWidth: '75%' }}>
                          {auction.itemName}
                        </span>
                        <span className="badge bg-success">Active</span>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <span className="small text-muted d-block">Current Top Bid</span>
                          <span className="fs-5 fw-bold text-success">
                            ${Number(auction.currentBid || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="small text-muted">
                          <strong>Bids:</strong> {auction.bidders?.length || 0}
                        </div>
                        <div className="small text-muted">
                          <strong>Closes:</strong>{' '}
                          {auction.closingTime ? new Date(auction.closingTime).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Global Auctions */}
          <div>
            <h4 className="fw-bold text-dark mb-3">Platform Activity (All Sellers)</h4>
            <div className="row g-3">
              {globalAuctions.slice(0, 6).map((auction) => (
                <div className="col-md-4" key={auction._id}>
                  <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-truncate mb-0" style={{ maxWidth: '70%' }}>
                        {auction.itemName}
                      </h6>
                      <span className={`badge ${auction.isClosed ? 'bg-secondary' : 'bg-primary'}`}>
                        {auction.isClosed ? 'Closed' : 'Live'}
                      </span>
                    </div>
                    <p className="text-muted small text-truncate mb-2">{auction.description}</p>
                    <div className="d-flex justify-content-between align-items-center small text-muted">
                      <span>
                        Bid: <strong>${auction.currentBid}</strong>
                      </span>
                      <span>Bidders: {auction.bidders?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSeller;
