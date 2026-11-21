import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from '../../components/apiconnector';
import SellerSidebar from '../../components/SellerSidebar';
import CardSpotlight from '../../components/ui/CardSpotlight';
import { useCurrency } from '../../context/CurrencyContext';
import { Search, Plus, Calendar, Users } from 'lucide-react';

const AllAuctionsForSeller = () => {
  const { format } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/getAuctionsForSeller');
        setAuctions(response.data || []);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter((auction) =>
    (auction.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <SellerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                All My Listings
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Full catalog of your active and past auction listings
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 min-h-[44px]"
              onClick={() => navigate('/seller/post-auction')}
            >
              <Plus className="w-4 h-4" />
              <span>Create Auction</span>
            </button>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Search all my listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner-border text-emerald-500" role="status" />
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <p className="text-slate-400 text-sm sm:text-base mb-4">No auction listings found.</p>
              <button
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm min-h-[44px]"
                onClick={() => navigate('/seller/post-auction')}
              >
                Create Listing Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredAuctions.map((item) => (
                <CardSpotlight
                  key={item._id}
                  color="#10b981"
                  className="flex flex-col justify-between hover:border-emerald-500/40 cursor-pointer bg-slate-900/60 p-4 sm:p-5"
                  onClick={() => navigate(`/seller/auction/${item._id}`)}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-white text-base sm:text-lg truncate mb-0">{item.itemName}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                          item.isClosed
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {item.isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{item.description}</p>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Top Bid</div>
                      <div className="text-xl sm:text-2xl font-black text-emerald-400">
                        {format(item.currentBid || 0)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-3 pt-2 border-t border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <strong className="text-slate-200">{item.bidders?.length || 0}</strong> bidders
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <strong className="text-slate-200">
                          {item.closingTime ? new Date(item.closingTime).toLocaleDateString() : 'N/A'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seller/auction/${item._id}`);
                        }}
                      >
                        Details & Bids
                      </button>
                      {item.isClosed && (
                        <button
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition min-h-[44px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/seller/auction/result/${item._id}`);
                          }}
                        >
                          Result
                        </button>
                      )}
                    </div>
                  </div>
                </CardSpotlight>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllAuctionsForSeller;
