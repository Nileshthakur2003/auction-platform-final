import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from '../components/apiconnector';
import Sidebar from '../components/SellerSidebar';
import CardSpotlight from '../components/ui/CardSpotlight';
import socket from '../socket';
import { Plus, Package, DollarSign, Users, TrendingUp } from 'lucide-react';

const DashboardSeller = () => {
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
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <Sidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '36px', overflowY: 'auto', height: '100vh', backgroundColor: '#030712' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">Seller Dashboard</h2>
              <p className="text-slate-400 text-sm">Monitor your active inventory, live offers, and sales proceeds</p>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/seller/post-auction')}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Listing</span>
            </button>
          </div>

          {/* Aceternity Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CardSpotlight color="#10b981" className="bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Live Listings</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loading ? '...' : activeListings.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Accepting active bids</div>
            </CardSpotlight>

            <CardSpotlight color="#6366f1" className="bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">Total Items</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loading ? '...' : totalAuctions}
              </div>
              <div className="text-xs text-slate-500 mt-1">Lifetime posted inventory</div>
            </CardSpotlight>

            <CardSpotlight color="#3b82f6" className="bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">Bids Received</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loading ? '...' : bidsReceived}
              </div>
              <div className="text-xs text-slate-500 mt-1">Across all your listings</div>
            </CardSpotlight>

            <CardSpotlight color="#10b981" className="bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Gross Proceeds</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {loading ? '...' : `$${Number(earnings).toLocaleString()}`}
              </div>
              <div className="text-xs text-slate-500 mt-1">Realized from completed sales</div>
            </CardSpotlight>
          </div>

          {/* Active Listings Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-white mb-0">My Active Inventory</h4>
              <button
                className="text-sm font-medium text-emerald-400 hover:underline"
                onClick={() => navigate('/seller/current-auctions')}
              >
                View all inventory &rarr;
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="spinner-border text-emerald-500" role="status" />
              </div>
            ) : activeListings.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
                <p className="text-slate-400 text-sm mb-3">You do not have any active auctions right now.</p>
                <button
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm"
                  onClick={() => navigate('/seller/post-auction')}
                >
                  Create Listing Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {activeListings.slice(0, 3).map((auction) => (
                  <CardSpotlight
                    key={auction._id}
                    color="#10b981"
                    className="flex flex-col justify-between cursor-pointer bg-slate-900/60"
                    onClick={() => navigate(`/seller/auction/${auction._id}`)}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h5 className="font-bold text-white text-lg truncate mb-0">{auction.itemName}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                          Active
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-4">{auction.description}</p>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">Top Bid Offer</div>
                        <div className="text-2xl font-black text-emerald-400">
                          ${Number(auction.currentBid || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex justify-between items-center">
                      <span>Bids: <strong className="text-slate-200">{auction.bidders?.length || 0}</strong></span>
                      <span>Closes: <strong className="text-slate-200">{auction.closingTime ? new Date(auction.closingTime).toLocaleDateString() : 'N/A'}</strong></span>
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

export default DashboardSeller;
