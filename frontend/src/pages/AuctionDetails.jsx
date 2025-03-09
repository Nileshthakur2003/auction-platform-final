import React from 'react';

const AuctionDetail = ({ item }) => {
  return (
    <div className="container text-center">
      <h2>Auction Detail</h2>
      <div className="card mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h5 className="card-title">{item.title}</h5>
          <p className="card-text">{item.description}</p>
          <p className="card-text"><strong>Starting Bid: </strong>{item.startingBid}</p>
          <button className="btn btn-primary">Place Bid</button>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
