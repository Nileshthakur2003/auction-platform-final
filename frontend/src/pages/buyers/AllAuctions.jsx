import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';
import CardSpotlight from '../../components/ui/CardSpotlight';
import { Search, Users, Calendar, ArrowRight } from 'lucide-react';

const AllAuctionsForBuyer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await ApiConnector.get('/auctions');
        setAuctions(response.data || []);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = (auction.itemName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'All'
        ? true
        : filterType === 'Active'
        ? !auction.isClosed
        : auction.isClosed;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <BuyerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Explore Auctions
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Discover active listings and live bidding opportunities
            </p>
          </div>

          {/* Search & Filter Bar (Mobile friendly stack) */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Search by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Listings</option>
              <option value="Active">Live / Active Only</option>
              <option value="Closed">Concluded / Closed</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner-border text-blue-500" role="status" />
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <p className="text-slate-400 text-sm sm:text-base mb-0">No auctions matched your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredAuctions.map((item) => (
                <CardSpotlight
                  key={item._id}
                  className="flex flex-col justify-between hover:border-blue-500/40 cursor-pointer bg-slate-900/60 p-4 sm:p-5"
                  onClick={() => navigate(`/buyer/auction/${item._id}`)}
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
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Current Bid</div>
                      <div className="text-xl sm:text-2xl font-black text-blue-400">
                        ${Number(item.currentBid || 0).toLocaleString()}
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
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/buyer/auction/${item._id}`);
                        }}
                      >
                        {item.isClosed ? 'View Details' : 'Place Bid'}
                      </button>
                      {item.isClosed && (
                        <button
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition min-h-[44px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/buyer/auction/result/${item._id}`);
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

export default AllAuctionsForBuyer;
