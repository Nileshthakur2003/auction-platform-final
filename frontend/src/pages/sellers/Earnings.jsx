import React, { useEffect, useState } from 'react';
import SellerSidebar from '../../components/SellerSidebar';
import ApiConnector from '../../components/apiconnector';
import CardSpotlight from '../../components/ui/CardSpotlight';
import moment from 'moment';
import { DollarSign, Package, Users } from 'lucide-react';

const Earnings = () => {
  const [earningsData, setEarningsData] = useState([]);
  const [stats, setStats] = useState({
    auctionedItems: 0,
    bidsReceived: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const [earningsResponse, statsResponse] = await Promise.all([
          ApiConnector.get('/getearnings'),
          ApiConnector.get('/getstats'),
        ]);
        setEarningsData(earningsResponse.data || []);
        setStats(statsResponse.data || { auctionedItems: 0, bidsReceived: 0, totalEarnings: 0 });
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  const formatDate = (date) => {
    return date ? moment(date).format('MMM Do YYYY, h:mm a') : 'N/A';
  };

  const safeTotal = Number(stats.totalEarnings || 0);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <SellerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Sales & Earnings Report
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Audited gross proceeds realized from verified winning bids
            </p>
          </div>

          {/* Metric Cards (1 col mobile, 3 col desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 mb-8">
            <CardSpotlight color="#10b981" className="bg-slate-900/60 border-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                  Gross Proceeds
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                ${safeTotal.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">From concluded winning sales</div>
            </CardSpotlight>

            <CardSpotlight color="#3b82f6" className="bg-slate-900/60 border-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400">
                  Auctioned Items
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.auctionedItems}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total listings created</div>
            </CardSpotlight>

            <CardSpotlight color="#8b5cf6" className="bg-slate-900/60 border-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">
                  Bids Received
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.bidsReceived}
              </div>
              <div className="text-xs text-slate-500 mt-1">Buyer offers attracted</div>
            </CardSpotlight>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-white mb-4">Completed Sales Ledger</h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="spinner-border text-emerald-500" role="status" />
              </div>
            ) : earningsData.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
                No finalized sales yet. When your closed auctions have winning bids, they will show here.
              </div>
            ) : (
              <>
                {/* Mobile Card List on < sm */}
                <div className="sm:hidden space-y-3">
                  {earningsData.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-bold text-white text-sm line-clamp-1">{item.itemName}</span>
                        <span className="text-emerald-400 font-extrabold text-base">
                          ${Number(item.finalBid || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-800/60">
                        <span>Settled: {formatDate(item.closingTime)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table on >= sm */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Item Name</th>
                        <th className="py-3 px-4">Final Sold Price</th>
                        <th className="py-3 px-4">Opening Date</th>
                        <th className="py-3 px-4">Settled Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {earningsData.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-900/80 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">{item.itemName}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400 text-base">
                            ${Number(item.finalBid || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">{formatDate(item.openingTime)}</td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">{formatDate(item.closingTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Earnings;
