import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuctionDetail = ({ item }) => {
  const navigate = useNavigate();

  if (!item) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Auction Detail</h2>
        <p className="text-slate-400 text-sm mb-6">No auction selected.</p>
        <button
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer"
          onClick={() => navigate('/')}
        >
          Browse Auctions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">Auction Detail</h2>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl text-left">
        <h3 className="text-xl font-bold text-white mb-2">{item.title || item.itemName}</h3>
        <p className="text-slate-400 text-sm mb-4">{item.description}</p>
        <p className="text-slate-200 text-sm mb-6">
          <strong className="text-white">Starting Bid: </strong>${item.startingBid}
        </p>
        <button
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
          onClick={() => navigate('/signin')}
        >
          Sign In to Bid
        </button>
      </div>
    </div>
  );
};

export default AuctionDetail;
