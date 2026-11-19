import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import ApiConnector from '../../components/apiconnector';
import BuyerSidebar from '../../components/BuyerSidebar';
import CardSpotlight from '../../components/ui/CardSpotlight';
import { ArrowLeft, Trophy, Calendar, CheckCircle2 } from 'lucide-react';

const BuyerAuctionResult = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await ApiConnector.get(`/getauctionresult/${id}`);
        setAuction(response.data);
      } catch (error) {
        console.error('Error fetching auction result data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  const formatDate = (date) => {
    return date ? moment(date).format('MMM Do YYYY, h:mm a') : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
        <BuyerSidebar />
        <main className="flex-1 min-w-0 w-full pt-20 md:pt-8 min-h-screen flex items-center justify-center px-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
        <BuyerSidebar />
        <main className="flex-1 min-w-0 w-full pt-20 md:pt-8 min-h-screen px-4 flex items-center justify-center">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Result Not Found</h3>
            <button
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              Back to Auctions
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <BuyerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <button
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition py-2 cursor-pointer mb-2"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all auctions</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Official Auction Outcome
            </h1>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-5 border-b border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{auction.itemName}</h2>
                <span className="text-xs text-slate-500">ID: {auction.auctionId}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                Concluded
              </span>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSpotlight color="#10b981" className="bg-slate-950/70 border-slate-800 p-5">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Winning Bid Price
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-2">
                  ${Number(auction.currentBid || 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span>Winner: <strong className="text-white">{auction.highestBidder || 'No Bids'}</strong></span>
                </div>
              </CardSpotlight>

              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-center space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="text-slate-200">{formatDate(auction.openingTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ended Date:</span>
                  <span className="text-slate-200">{formatDate(auction.closingTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Bids Received:</span>
                  <span className="text-white font-bold">{auction.bids?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>
                This auction is officially settled. The winning bidder has been confirmed by the system.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerAuctionResult;
