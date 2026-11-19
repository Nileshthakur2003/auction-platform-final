import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';

const BiddingHistory = () => {
  const [biddingHistoryData, setBiddingHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBiddingHistory = async () => {
      try {
        const response = await ApiConnector.get('/getBidsForUser');
        setBiddingHistoryData(response.data || []);
      } catch (error) {
        console.error('Error fetching bidding history data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBiddingHistory();
  }, []);

  const filteredData = biddingHistoryData.filter((item) => {
    const matchesSearch = (item.auctionName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'All' ||
      item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'won':
        return <span className="badge bg-success px-3 py-2">🏆 Won Auction</span>;
      case 'winning':
        return <span className="badge bg-primary px-3 py-2">⚡ Currently Leading</span>;
      case 'outbid':
        return <span className="badge bg-warning text-dark px-3 py-2">⚠️ Outbid</span>;
      case 'lost':
        return <span className="badge bg-secondary px-3 py-2">Lost</span>;
      default:
        return <span className="badge bg-info px-3 py-2">{status}</span>;
    }
  };

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
              <h2 className="fw-bold text-dark mb-1">My Bidding History</h2>
              <p className="text-muted mb-0">Track all bids you have placed across all auctions</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              Browse Auctions
            </button>
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search by auction title..."
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
                  <option value="All">All Bid Statuses</option>
                  <option value="Won">Won</option>
                  <option value="Winning">Currently Leading</option>
                  <option value="Outbid">Outbid</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fs-5 mb-3">No bidding records found matching your filters.</p>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/buyer/all-auctions')}
                >
                  Start Bidding
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Auction Title</th>
                      <th>My Bid Amount</th>
                      <th>Date Placed</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={item.bidId || index}>
                        <td className="fw-bold">{item.auctionName}</td>
                        <td className="fw-semibold text-primary">
                          ${Number(item.bidAmount).toLocaleString()}
                        </td>
                        <td className="text-muted small">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          {item.auctionId && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/buyer/auction/${item.auctionId}`)}
                            >
                              View Item &rarr;
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingHistory;
