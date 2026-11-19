import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuctionDetail = ({ item }) => {
  const navigate = useNavigate();

  if (!item) {
    return (
      <div className="container text-center py-5">
        <h2>Auction Detail</h2>
        <p className="text-muted">No auction selected.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Browse Auctions
        </button>
      </div>
    );
  }

  return (
    <div className="container text-center py-5">
      <h2 className="fw-bold mb-4">Auction Detail</h2>
      <div className="card mx-auto border-0 shadow-sm rounded-3 p-3" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h5 className="card-title fw-bold">{item.title || item.itemName}</h5>
          <p className="card-text text-muted">{item.description}</p>
          <p className="card-text">
            <strong>Starting Bid: </strong>${item.startingBid}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/signin')}>
            Sign In to Bid
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
