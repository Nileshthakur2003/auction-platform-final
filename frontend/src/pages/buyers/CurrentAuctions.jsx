import React, { useState, useEffect } from 'react';
import BuyerSidebar from '../../components/BuyerSidebar'; // Make sure to import the BuyerSidebar component
import ApiConnector from '../../components/apiconnector';

const CurrentBuyerAuctions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    // Fetch auction data from the backend
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/getauctionbidded');
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auction data:', error);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter(
    (auction) =>
      (filterStatus === 'All' || auction.status === filterStatus) &&
      auction.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="row">
        <BuyerSidebar /> {/* Include the BuyerSidebar component */}
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <h2 className='mt-5'>Ongoing Auctions</h2>

          <div className="d-flex justify-content-between mt-4">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-control w-25"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Winning">Winning</option>
              <option value="Outbid">Outbid</option>
            </select>
          </div>

          <div className="row justify-content-center mt-4">
            {filteredAuctions.length > 0 ? (
              filteredAuctions.map((item, index) => (
                <div className="col-md-6 mb-4" key={index}>
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{item.itemName}</h5>
                      <p className="card-text">{item.description}</p>
                      <p className="card-text"><strong>Current Bid: </strong>{item.currentBid}</p>
                      <p className="card-text"><strong>Status: </strong>{item.status}</p>
                      <button className="btn btn-primary">View Auction</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-md-12">
                <p className="text-center mt-4">No currently bidded auctions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentBuyerAuctions;
