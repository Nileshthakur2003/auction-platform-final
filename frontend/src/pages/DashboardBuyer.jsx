import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from '../components/apiconnector';
import BuyerSidebar from '../components/BuyerSidebar';
import CardSpotlight from '../components/ui/CardSpotlight';
import socket from '../socket';
import { Radio, Gavel, DollarSign, ArrowUpRight, Flame } from 'lucide-react';

const DashboardBuyer = () => {
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
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <BuyerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '36px', overflowY: 'auto', height: '100vh', backgroundColor: '#030712' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">Buyer Dashboard</h2>
              <p className="text-slate-400 text-sm">Real-time pulse of available auctions and your bidding activity</p>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              <span>Explore All Auctions</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Aceternity CardSpotlight Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <CardSpotlight color="#3b82f6" className="bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">Live Auctions</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loading ? '...' : activeAuctions.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Available for immediate bidding</div>
            </CardSpotlight>

            <CardSpotlight color="#10b981" className="bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Total Bids</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Gavel className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loading ? '...' : totalBids}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total offers placed by you</div>
            </CardSpotlight>

            <CardSpotlight color="#8b5cf6" className="bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">Won & Settled</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loading ? '...' : `$${Number(totalSpent).toLocaleString()}`}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total invested on winning bids</div>
            </CardSpotlight>
          </div>

          {/* Active Auctions Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-white mb-0">Active Live Listings</h4>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Socket.io Synchronized</span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="spinner-border text-blue-500" role="status" />
              </div>
            ) : activeAuctions.length === 0 ? (
              <div className="p-10 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
                <p className="text-slate-400 text-base mb-4">No active auctions at the moment.</p>
                <button
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                  onClick={() => navigate('/buyer/all-auctions')}
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {activeAuctions.map((auction) => (
                  <CardSpotlight
                    key={auction._id}
                    className="flex flex-col justify-between hover:border-blue-500/40 cursor-pointer bg-slate-900/60"
                    onClick={() => navigate(`/buyer/auction/${auction._id}`)}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h5 className="font-bold text-white text-lg truncate mb-0">{auction.itemName}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                          Live
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-4">{auction.description}</p>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">Current Top Bid</div>
                        <div className="text-2xl font-black text-blue-400">
                          ${Number(auction.currentBid || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                        <span>Bidders: <strong className="text-slate-200">{auction.bidders?.length || 0}</strong></span>
                        <span>Closes: <strong className="text-slate-200">{auction.closingTime ? new Date(auction.closingTime).toLocaleDateString() : 'N/A'}</strong></span>
                      </div>

                      <button
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
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
      </div>
    </div>
  );
};

export default DashboardBuyer;
