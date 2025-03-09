import React, { useState, useEffect } from 'react';
import BuyerSidebar from '../../components/BuyerSidebar'; // Make sure to import the BuyerSidebar component
import ApiConnector from '../../components/apiconnector'; // Import the ApiConnector
import { useNavigate } from 'react-router-dom';

const AllAuctionsForBuyer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/auctions'); // Replace with your actual API endpoint
        setAuctions(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter(
    (auction) =>
      auction.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container-fluid">
      <div class="row">
        <BuyerSidebar />
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <h2 className='mt-5'>All Auctions</h2>

          <div className="d-flex justify-content-between mt-4">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="row justify-content-center mt-4">
            {filteredAuctions.map((item, index) => (
              <div className="col-md-6 mb-4" key={index}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{item.itemName}</h5>
                    <p className="card-text">{item.description}</p>
                    <p className="card-text"><strong>Current Bid: </strong>{item.currentBid}</p>
                    <button className="btn btn-primary" onClick={() => navigate(`/buyer/auction/${item._id}`)}>View Auction</button>
                    {item.isClosed ? (
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => navigate(`/buyer/auction/result/${item._id}`)}
                    >
                      View Auction Result
                    </button>
                    ) : null}
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

export default AllAuctionsForBuyer;
