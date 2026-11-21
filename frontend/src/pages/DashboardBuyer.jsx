import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from '../components/apiconnector';
import BuyerSidebar from '../components/BuyerSidebar';
import CardSpotlight from '../components/ui/CardSpotlight';
import socket from '../socket';
import { useCurrency } from '../context/CurrencyContext';
import { Gavel, DollarSign, ArrowUpRight, Flame, Users, Calendar } from 'lucide-react';

const DashboardBuyer = () => {
  const { format } = useCurrency();
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [auctionsRes, bidsRes, spentRes] = await Promise.all([
        ApiConnector.get('/auctions'),
        ApiConnector.get('/getBidsForUser'),
        ApiConnector.get('/getTotalSpentByUser'),
      ]);

      const live = (auctionsRes.data || []).filter((a) => !a.isClosed);
      setActiveAuctions(live);
      setTotalBids(bidsRes.data?.length || 0);
      setTotalSpent(spentRes.data?.totalSpent || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    socket.on('auction_feed_update', () => {
      fetchDashboardData();
    });

    socket.on('auction_created', () => {
      fetchDashboardData();
    });

    return () => {
      socket.off('auction_feed_update');
      socket.off('auction_created');
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <BuyerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                Buyer Dashboard
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Live auctions and your personal bidding overview
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              <span>Explore All Auctions</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Metric Cards Grid (1 col on mobile, 3 cols on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 mb-8">
            <CardSpotlight color="#3b82f6" className="bg-slate-900/60 border-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400">
                  Live Auctions
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {loading ? '...' : activeAuctions.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Available for live bidding</div>
            </CardSpotlight>

            <CardSpotlight color="#10b981" className="bg-slate-900/60 border-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                  Total Offers
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Gavel className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {loading ? '...' : totalBids}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total bids placed by you</div>
            </CardSpotlight>

            <CardSpotlight color="#8b5cf6" className="bg-slate-900/60 border-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">
                  Total Won & Settled
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {loading ? '...' : format(totalSpent)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Spent on verified winning bids</div>
            </CardSpotlight>
          </div>

          {/* Live Listings Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-0">Active Live Listings</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>WebSocket Synchronized</span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="spinner-border text-blue-500" role="status" />
              </div>
            ) : activeAuctions.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
                <p className="text-slate-400 text-sm sm:text-base mb-4">No active auctions right now.</p>
                <button
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm"
                  onClick={() => navigate('/buyer/all-auctions')}
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {activeAuctions.map((auction) => (
                  <CardSpotlight
                    key={auction._id}
                    className="flex flex-col justify-between hover:border-blue-500/40 cursor-pointer bg-slate-900/60 p-4 sm:p-5"
                    onClick={() => navigate(`/buyer/auction/${auction._id}`)}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-white text-base sm:text-lg truncate mb-0">
                          {auction.itemName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold shrink-0">
                          Live
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {auction.description}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                        <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">
                          Current Top Bid
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-blue-400">
                          {format(auction.currentBid || 0)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-3 pt-2 border-t border-slate-800/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <strong className="text-slate-200">{auction.bidders?.length || 0}</strong> bidders
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <strong className="text-slate-200">
                            {auction.closingTime ? new Date(auction.closingTime).toLocaleDateString() : 'N/A'}
                          </strong>
                        </span>
                      </div>

                      <button
                        className="w-full py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/buyer/auction/${auction._id}`);
                        }}
                      >
                        Place Bid Now
                      </button>
                    </div>
                  </CardSpotlight>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardBuyer;
