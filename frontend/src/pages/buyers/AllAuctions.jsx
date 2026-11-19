import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';

const AllAuctionsForBuyer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/auctions');
        setAuctions(response.data || []);
      } catch (error) {
        console.error('Error fetching auctions:', error);
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
    const matchesFilter =
      filterType === 'All'
        ? true
        : filterType === 'Active'
        ? !auction.isClosed
        : auction.isClosed;
    return matchesSearch && matchesFilter;
  });

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
              <h2 className="fw-bold text-dark mb-1">Explore All Auctions</h2>
              <p className="text-muted mb-0">Browse through active live auctions and past listings</p>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search auctions by name or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Auctions</option>
                  <option value="Active">Live / Active Only</option>
                  <option value="Closed">Ended / Closed Only</option>
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
              <p className="text-muted fs-5 mb-0">No auctions matched your search criteria.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredAuctions.map((item) => (
                <div className="col-md-4" key={item._id}>
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
                          <span className="small text-muted d-block">Current Bid</span>
                          <span className="fs-4 fw-bold text-primary">
                            ${Number(item.currentBid || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="small text-muted mb-1">
                          <strong>Bidders:</strong> {item.bidders?.length || 0}
                        </div>
                        <div className="small text-muted mb-1">
                          <strong>Closes:</strong>{' '}
                          {item.closingTime ? new Date(item.closingTime).toLocaleString() : 'N/A'}
                        </div>
                      </div>

                      <div className="mt-3 d-flex gap-2">
                        <button
                          className="btn btn-primary flex-fill"
                          onClick={() => navigate(`/buyer/auction/${item._id}`)}
                        >
                          {item.isClosed ? 'View Details' : 'Place Bid Now'}
                        </button>
                        {item.isClosed && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate(`/buyer/auction/result/${item._id}`)}
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

export default AllAuctionsForBuyer;
