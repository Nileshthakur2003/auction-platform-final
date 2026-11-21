import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from '../components/apiconnector';
import Sidebar from '../components/SellerSidebar';
import CardSpotlight from '../components/ui/CardSpotlight';
import socket from '../socket';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Package, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';

const DashboardSeller = () => {
  const { format } = useCurrency();
  const [activeListings, setActiveListings] = useState([]);
  const [globalAuctions, setGlobalAuctions] = useState([]);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [bidsReceived, setBidsReceived] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSellerData = async () => {
    try {
      const [sellerRes, globalRes, statsRes] = await Promise.all([
        ApiConnector.get('/getAuctionsForSeller'),
        ApiConnector.get('/auctions'),
        ApiConnector.get('/getstats'),
      ]);

      const myAuctions = sellerRes.data || [];
      const liveOnly = myAuctions.filter((a) => !a.isClosed);

      setActiveListings(liveOnly);
      setTotalAuctions(myAuctions.length);
      setGlobalAuctions(globalRes.data || []);
      setEarnings(statsRes.data?.totalEarnings || 0);
      setBidsReceived(statsRes.data?.bidsReceived || 0);
    } catch (error) {
      console.error('Error fetching seller dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();

    socket.on('auction_feed_update', () => {
      fetchSellerData();
    });

    socket.on('auction_created', () => {
      fetchSellerData();
    });

    return () => {
      socket.off('auction_feed_update');
      socket.off('auction_created');
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                Seller Dashboard
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Manage your listings, live incoming bids, and realized revenue
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              onClick={() => navigate('/seller/post-auction')}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Listing</span>
            </button>
          </div>

          {/* Metric Cards (1 col mobile, 2 col tablet, 4 col desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
            <CardSpotlight color="#10b981" className="bg-slate-900/60 border-slate-800 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                  Live Listings
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {loading ? '...' : activeListings.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Accepting active bids</div>
            </CardSpotlight>

            <CardSpotlight color="#6366f1" className="bg-slate-900/60 border-slate-800 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-400">
                  Total Items
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {loading ? '...' : totalAuctions}
              </div>
              <div className="text-xs text-slate-500 mt-1">Lifetime posted items</div>
            </CardSpotlight>

            <CardSpotlight color="#3b82f6" className="bg-slate-900/60 border-slate-800 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400">
                  Bids Received
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {loading ? '...' : bidsReceived}
              </div>
              <div className="text-xs text-slate-500 mt-1">Offers from all buyers</div>
            </CardSpotlight>

            <CardSpotlight color="#10b981" className="bg-slate-900/60 border-slate-800 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                  Realized Gross
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {loading ? '...' : format(earnings)}
              </div>
              <div className="text-xs text-slate-500 mt-1">From settled winning bids</div>
            </CardSpotlight>
          </div>

          {/* Active Inventory Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-0">My Active Inventory</h2>
              <button
                className="text-xs sm:text-sm font-medium text-emerald-400 hover:underline min-h-[36px] flex items-center"
                onClick={() => navigate('/seller/current-auctions')}
              >
                View all &rarr;
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="spinner-border text-emerald-500" role="status" />
              </div>
            ) : activeListings.length === 0 ? (
              <div className="p-8 sm:p-10 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
                <p className="text-slate-400 text-sm mb-3">You do not have any active auctions right now.</p>
                <button
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm min-h-[44px]"
                  onClick={() => navigate('/seller/post-auction')}
                >
                  Create Listing Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {activeListings.slice(0, 3).map((auction) => (
                  <CardSpotlight
                    key={auction._id}
                    color="#10b981"
                    className="flex flex-col justify-between cursor-pointer bg-slate-900/60 p-4 sm:p-5"
                    onClick={() => navigate(`/seller/auction/${auction._id}`)}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-white text-base sm:text-lg truncate mb-0">
                          {auction.itemName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0">
                          Active
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {auction.description}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                        <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">
                          Top Bid Offer
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400">
                          {format(auction.currentBid || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800/60">
                      <span>Bids: <strong className="text-slate-200">{auction.bidders?.length || 0}</strong></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <strong className="text-slate-200">
                          {auction.closingTime ? new Date(auction.closingTime).toLocaleDateString() : 'N/A'}
                        </strong>
                      </span>
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

export default DashboardSeller;
