import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';
import { Search, Trophy, Flame, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

const BiddingHistory = () => {
  const [biddingHistoryData, setBiddingHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBiddingHistory = async () => {
      try {
        const response = await ApiConnector.get('/getBidsForUser');
        setBiddingHistoryData(response.data || []);
      } catch (error) {
        console.error('Error fetching bidding history data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBiddingHistory();
  }, []);

  const filteredData = biddingHistoryData.filter((item) => {
    const matchesSearch = (item.auctionName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'All' ||
      item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'won':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>Won Auction</span>
          </span>
        );
      case 'winning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs">
            <Flame className="w-3.5 h-3.5" />
            <span>Leading</span>
          </span>
        );
      case 'outbid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Outbid</span>
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-medium text-xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>Concluded</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <BuyerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                Bidding History
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Track all offers placed by your account across platform auctions
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition min-h-[44px]"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              Browse Auctions
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Search by auction title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Won">Won</option>
              <option value="Winning">Leading</option>
              <option value="Outbid">Outbid</option>
              <option value="Lost">Concluded</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner-border text-blue-500" role="status" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <p className="text-slate-400 text-sm sm:text-base mb-4">No bidding records found matching your filters.</p>
              <button
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold min-h-[44px]"
                onClick={() => navigate('/buyer/all-auctions')}
              >
                Start Bidding Now
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card List (Visible only on < sm screens) */}
              <div className="sm:hidden space-y-3">
                {filteredData.map((item, index) => (
                  <div key={item.bidId || index} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{item.auctionName}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">My Bid</span>
                        <span className="text-lg font-black text-blue-400">
                          ${Number(item.bidAmount).toLocaleString()}
                        </span>
                      </div>
                      {item.auctionId && (
                        <button
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                          onClick={() => navigate(`/buyer/auction/${item.auctionId}`)}
                        >
                          <span>Item</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (Visible only on >= sm screens) */}
              <div className="hidden sm:block rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-4 px-5">Auction Title</th>
                        <th className="py-4 px-5">My Bid Amount</th>
                        <th className="py-4 px-5">Date Placed</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredData.map((item, index) => (
                        <tr key={item.bidId || index} className="hover:bg-slate-900/80 transition">
                          <td className="py-3.5 px-5 font-semibold text-white">{item.auctionName}</td>
                          <td className="py-3.5 px-5 font-bold text-blue-400">
                            ${Number(item.bidAmount).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-5 text-xs text-slate-400">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3.5 px-5">{getStatusBadge(item.status)}</td>
                          <td className="py-3.5 px-5 text-right">
                            {item.auctionId && (
                              <button
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition"
                                onClick={() => navigate(`/buyer/auction/${item.auctionId}`)}
                              >
                                View Item
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BiddingHistory;
