import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from '../components/apiconnector';
import BuyerSidebar from '../components/BuyerSidebar';
import socket from '../socket';

const DashboardBuyer = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [auctionsRes, bidsRes, spentRes] = await Promise.all([
        ApiConnector.get('/auctions'),
        ApiConnector.get('/getBidsForUser'),
        ApiConnector.get('/getTotalSpentByUser'),
      ]);

      const live = (auctionsRes.data || []).filter((a) => !a.isClosed);
      setActiveAuctions(live);
      setTotalBids(bidsRes.data?.length || 0);
      setTotalSpent(spentRes.data?.totalSpent || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for live auction updates via WebSockets
    socket.on('auction_feed_update', () => {
      fetchDashboardData();
    });

    socket.on('auction_created', () => {
      fetchDashboardData();
    });

    return () => {
      socket.off('auction_feed_update');
      socket.off('auction_created');
    };
  }, []);

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <BuyerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-1">Buyer Dashboard</h2>
              <p className="text-muted mb-0">Overview of live auctions and your bidding activity</p>
            </div>
            <button
              className="btn btn-primary px-4 py-2 fw-semibold shadow-sm"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              Explore All Auctions &rarr;
            </button>
          </div>

          {/* Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-primary text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Live Auctions Available</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">
                    {loading ? '...' : activeAuctions.length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-success text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Total Bids Placed</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">
                    {loading ? '...' : totalBids}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-info text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Total Won & Spent</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">
                    {loading ? '...' : `$${Number(totalSpent).toLocaleString()}`}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Active Auctions Grid */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-dark mb-0">Live Auctions</h4>
              <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                ● Live Updates Active
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : activeAuctions.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5 rounded-3">
                <div className="card-body">
                  <p className="text-muted fs-5 mb-3">No active auctions at the moment.</p>
                  <button className="btn btn-outline-primary" onClick={() => navigate('/buyer/all-auctions')}>
                    Browse All Listings
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {activeAuctions.map((auction) => (
                  <div className="col-md-4" key={auction._id}>
                    <div
                      className="card h-100 border-0 shadow-sm rounded-3 hover-shadow"
                      style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onClick={() => navigate(`/buyer/auction/${auction._id}`)}
                    >
                      <div className="card-header bg-dark text-white fw-bold py-3 d-flex justify-content-between align-items-center">
                        <span className="text-truncate" style={{ maxWidth: '70%' }}>
                          {auction.itemName}
                        </span>
                        <span className="badge bg-primary fs-7">Live</span>
                      </div>
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <p className="text-muted small text-truncate-2 mb-3">
                            {auction.description}
                          </p>
                          <div className="bg-light p-2 rounded mb-3">
                            <span className="small text-muted d-block">Current Bid</span>
                            <span className="fs-4 fw-bold text-primary">
                              ${Number(auction.currentBid || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="small text-muted mb-1">
                            <strong>Bidders:</strong> {auction.bidders?.length || 0}
                          </div>
                          <div className="small text-muted mb-3">
                            <strong>Closes:</strong>{' '}
                            {auction.closingTime ? new Date(auction.closingTime).toLocaleString() : 'N/A'}
                          </div>
                          <button
                            className="btn btn-outline-primary w-100 fw-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/buyer/auction/${auction._id}`);
                            }}
                          >
                            Place Bid Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBuyer;
