import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import SellerSidebar from '../../components/SellerSidebar';
import ApiConnector from '../../components/apiconnector';
import { useNavigate } from 'react-router-dom';

// Custom hook to fetch auctions
const useAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/getAuctionsForSeller'); 
        setAuctions(response.data);
      } catch (error) {
        if (error.response.data.error === "TokenExpiredError") {
          navigate('/signin');
        }
        setError(error.message);
        console.log(error.response.data.error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return { auctions, loading, error };
};

const CurrentAuctions = () => {
  const { auctions, loading, error } = useAuctions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const filteredAuctions = auctions.filter(
    (auction) =>
      (filterStatus === 'All' || auction.status === filterStatus) &&
      auction.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container-fluid">
      <div className="row">
        <SellerSidebar />
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <h2 className="mt-5">Current Auctions</h2>
          <div className="d-flex justify-content-between mt-4">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="form-control w-25" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
            </select>
          </div>
          <div className="row justify-content-center mt-4">
            {filteredAuctions.map((item, index) => (
              <div className="col-md-6 mb-4" key={index}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{item.itemName}</h5>
                    <p className="card-text">{item.description}</p>
                    <p className="card-text">
                      <strong>Current Bid: </strong>{item.currentBid}
                    </p>
                    <p className="card-text">
                      <strong>Bidders: </strong>{item.bidders.join(', ')}
                    </p>
                    <p className="card-text">
                      <strong>Opening Time: </strong>{new Date(item.openingTime).toLocaleString()}
                    </p>
                    <p className="card-text">
                      <strong>Closing Time: </strong>{new Date(item.closingTime).toLocaleString()}
                    </p>
                    <p className="card-text">
                      <strong>Status: </strong>{item.isClosed ? 'Closed' : 'Active'}
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate(`/seller/auction/${item._id}`)}>View Auction</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentAuctions;
