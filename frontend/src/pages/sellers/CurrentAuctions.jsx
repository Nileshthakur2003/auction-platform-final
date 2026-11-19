import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerSidebar from '../../components/SellerSidebar';
import ApiConnector from '../../components/apiconnector';

const CurrentAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/getAuctionsForSeller');
        setAuctions(response.data || []);
      } catch (error) {
        console.error('Error fetching seller auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = (auction.itemName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'All'
        ? true
        : filterStatus === 'Active'
        ? !auction.isClosed
        : auction.isClosed;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <SellerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-1">My Active Listings</h2>
              <p className="text-muted mb-0">Track and manage your posted auction inventory</p>
            </div>
            <button
              className="btn btn-success px-4 py-2 fw-semibold"
              onClick={() => navigate('/seller/post-auction')}
            >
              + Post New Auction
            </button>
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search my auctions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="Active">Active Listings Only</option>
                  <option value="Closed">Closed Listings Only</option>
                  <option value="All">All Listings</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white">
              <p className="text-muted fs-5 mb-3">No auction listings found matching your filter.</p>
              <div>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/seller/post-auction')}
                >
                  Create Your First Listing &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {filteredAuctions.map((item) => (
                <div className="col-md-6" key={item._id}>
                  <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                    <div className="card-header bg-dark text-white fw-bold py-3 d-flex justify-content-between align-items-center">
                      <span className="text-truncate">{item.itemName}</span>
                      <span className={`badge ${item.isClosed ? 'bg-secondary' : 'bg-success'}`}>
                        {item.isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <p className="text-muted small mb-3">{item.description}</p>
                        <div className="bg-light p-3 rounded mb-3">
                          <span className="small text-muted d-block">Current Top Bid</span>
                          <span className="fs-4 fw-bold text-success">
                            ${Number(item.currentBid || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="small text-muted mb-1">
                          <strong>Total Bidders:</strong> {item.bidders?.length || 0}
                        </div>
                        <div className="small text-muted mb-1">
                          <strong>Closing Time:</strong>{' '}
                          {item.closingTime ? new Date(item.closingTime).toLocaleString() : 'N/A'}
                        </div>
                      </div>

                      <div className="mt-3 d-flex gap-2">
                        <button
                          className="btn btn-primary flex-fill"
                          onClick={() => navigate(`/seller/auction/${item._id}`)}
                        >
                          View Details & Bids
                        </button>
                        {item.isClosed && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate(`/seller/auction/result/${item._id}`)}
                          >
                            Result
                          </button>
                        )}
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
  );
};

export default CurrentAuctions;
