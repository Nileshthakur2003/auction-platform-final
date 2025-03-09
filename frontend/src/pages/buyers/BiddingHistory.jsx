import React, { useState, useEffect } from 'react';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';

const BiddingHistory = () => {
  const [biddingHistoryData, setBiddingHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const fetchBiddingHistory = async () => {
      try {
        const response = await ApiConnector.get('/getBidsForUser');
        setBiddingHistoryData(response.data);
      } catch (error) {
        console.error('Error fetching bidding history data:', error);
      }
    };

    fetchBiddingHistory();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredData = biddingHistoryData.filter((item) => {
    return (
      (filterStatus === 'All' || item.status === filterStatus) &&
      item.auctionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container-fluid">
      <div className="row">
        <BuyerSidebar /> {/* Include the BuyerSidebar component */}
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <h2 className='mt-5'>Bidding History</h2>
          <div className="form-group mt-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search Auction Title"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="form-group mt-2">
            <select className="form-control" value={filterStatus} onChange={handleFilterChange}>
              <option value="All">All</option>
              <option value="Winning">Won</option>
              <option value="Outbid">Lost</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div className="table-responsive mt-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Auction Title</th>
                  <th>Bid Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.auctionName}</td>
                    <td>{item.bidAmount}</td>
                    <td>{item.successfulBid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingHistory;
