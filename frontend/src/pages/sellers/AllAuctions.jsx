import React, { useState, useEffect } from 'react';
import ApiConnector from '../../components/apiconnector'; // Import the ApiConnector
import SellerSidebar from '../../components/SellerSidebar';
import { useNavigate } from 'react-router-dom';

const AllAuctionsForSeller = () => {
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
        console.log(response.data);
      } catch (error) {
        setError(error.message);
        if(error.response.data.error === "TokenExpiredError"){
          navigate('/signin');
        }
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
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <SellerSidebar className="mt-0" />
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100%' }}>
          <h2 className='mt-2'>All Auctions</h2>

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
                    <p className="card-text">{item.sellerName}</p>
                    <p className="card-text"><strong>Current Bid: </strong>{item.currentBid}</p>
                    <p className="card-text"><strong>Bidders: </strong>{item.bidders.join(', ')}</p>
                    <p className="card-text"><strong>Opening Time: </strong>{new Date(item.openingTime).toLocaleString()}</p>
                    <p className="card-text"><strong>Closing Time: </strong>{new Date(item.closingTime).toLocaleString()}</p>
                    <p className="card-text"><strong>Status: </strong>{item.isClosed ? 'Closed' : 'Active'}</p>
                    <button className="btn btn-primary ml-2" onClick={() => navigate(`/seller/auction/${item._id}`)}>View Auction</button>
                    {item.isClosed ? (
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => navigate(`/seller/auction/result/${item._id}`)}
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

export default AllAuctionsForSeller;
