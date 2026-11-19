import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';

const CurrentBuyerAuctions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/getauctionbidded');
        setAuctions(response.data || []);
      } catch (error) {
        console.error('Error fetching auction data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter((auction) =>
    (auction.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h2 className="fw-bold text-dark mb-1">My Active Auctions</h2>
              <p className="text-muted mb-0">Auctions where you have placed bids that are currently ongoing</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              Browse All Listings
            </button>
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search in your active auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white">
              <p className="text-muted fs-5 mb-3">You haven't placed bids on any currently active auctions.</p>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/buyer/all-auctions')}
                >
                  Explore Live Auctions &rarr;
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
                      <span className="badge bg-success">Live Bidding</span>
                    </div>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <p className="text-muted small mb-3">{item.description}</p>
                        <div className="bg-light p-3 rounded mb-3">
                          <span className="small text-muted d-block">Current Top Bid</span>
                          <span className="fs-4 fw-bold text-primary">
                            ${Number(item.currentBid || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="small text-muted mb-1">
                          <strong>Closes:</strong>{' '}
                          {item.closingTime ? new Date(item.closingTime).toLocaleString() : 'N/A'}
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          className="btn btn-primary w-100 fw-semibold"
                          onClick={() => navigate(`/buyer/auction/${item._id}`)}
                        >
                          View & Increase Bid &rarr;
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
  );
};

export default CurrentBuyerAuctions;
