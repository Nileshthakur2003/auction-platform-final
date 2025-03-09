import React from 'react';

const BuyerDashboardContent = ({ auctions }) => {
  return (
    <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
      <h2 className='mt-5'>Dashboard</h2>
      <div className="row justify-content-center">
        {auctions.map((item, index) => (
          <div className="col-md-6 mb-4" key={index}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.description}</p>
                <p className="card-text"><strong>Starting Bid: </strong>{item.startingBid}</p>
                <button className="btn btn-primary">View Auction</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerDashboardContent;
