import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import toast from 'react-hot-toast';
import ApiConnector from '../../components/apiconnector';
import BuyerSidebar from '../../components/BuyerSidebar';
import CardSpotlight from '../../components/ui/CardSpotlight';
import TermsModal from '../../components/TermsModal';
import socket from '../../socket';
import { useCurrency } from '../../context/CurrencyContext';
import { Clock, ArrowLeft, ShieldCheck, Flame, Users, CheckCircle2, Scale } from 'lucide-react';

const BuyerAuctionDetail = () => {
  const { id } = useParams();
  const { currentCurrency, format } = useCurrency();
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const fetchAuction = async () => {
    try {
      const response = await ApiConnector.get(`/getauction/${id}`);
      setAuction(response.data);
      if (response.data.isClosed) {
        setIsAuctionEnded(true);
      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
      toast.error('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();

    socket.emit('join_auction', id);

    socket.on('bid_updated', (data) => {
      setAuction((prev) => {
        if (!prev) return prev;
        const exists = prev.bids?.some((b) => b._id === data.newBid?._id);
        const updatedBids = exists ? prev.bids : [data.newBid, ...(prev.bids || [])];
        return {
          ...prev,
          currentBid: data.currentBid,
          bids: updatedBids,
        };
      });
      toast.success(`⚡ New highest bid: ${format(data.currentBid)} by ${data.highestBidder}!`);
    });

    socket.on('auction_closed', (data) => {
      setIsAuctionEnded(true);
      setAuction((prev) => (prev ? { ...prev, isClosed: true } : prev));
      toast('🔔 This auction has just concluded.', { icon: '🏁' });
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.off('bid_updated');
      socket.off('auction_closed');
    };
  }, [id]);

  useEffect(() => {
    if (!auction?.closingTime) return;

    const calculateTimeLeft = () => {
      const closingTime = moment(auction.closingTime);
      const now = moment();
      const duration = moment.duration(closingTime.diff(now));

      if (duration.asSeconds() > 0) {
        const days = Math.floor(duration.asDays());
        const hours = Math.floor(duration.asHours() % 24);
        const minutes = Math.floor(duration.asMinutes() % 60);
        const seconds = Math.floor(duration.asSeconds() % 60);
        setTimeLeft(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
        setIsAuctionEnded(false);
      } else {
        setTimeLeft('Auction Closed');
        setIsAuctionEnded(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction?.closingTime]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const numericBid = parseFloat(bidAmount);
    const minBidInCurrent = Number((Number(auction?.currentBid || 0) * currentCurrency.rateFromUSD).toFixed(2));

    if (isNaN(numericBid) || numericBid <= minBidInCurrent) {
      toast.error(
        `Your bid must be strictly greater than ${currentCurrency.symbol}${minBidInCurrent.toLocaleString()} (${currentCurrency.code})`
      );
      return;
    }

    // Convert bid from user's currentCurrency to normalized USD base for database consistency
    const bidInUSD = Number((numericBid / currentCurrency.rateFromUSD).toFixed(2));

    setSubmitting(true);
    try {
      await ApiConnector.post(`/bid/${id}`, { bid: bidInUSD });
      toast.success('Bid placed successfully!');
      setAuction((prev) => ({
        ...prev,
        currentBid: bidInUSD,
      }));
      setBidAmount('');
    } catch (error) {
      console.error('Error submitting bid:', error);
      const msg = error.response?.data?.message || 'Error submitting bid';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
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
        <main className="flex-1 min-w-0 w-full pt-20 md:pt-8 min-h-screen px-4 flex flex-col items-center justify-center">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Auction Not Found</h3>
            <p className="text-slate-400 text-sm mb-6">This item may have been removed or does not exist.</p>
            <button
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              Browse Auctions
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
        <div className="max-w-6xl mx-auto w-full">
          {/* Top navigation back button */}
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <button
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition py-2 cursor-pointer"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all auctions</span>
            </button>

            {auction.isClosed || isAuctionEnded ? (
              <button
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                onClick={() => navigate(`/buyer/auction/result/${id}`)}
              >
                View Outcome &rarr;
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Bidding Active</span>
              </span>
            )}
          </div>

          {/* Title Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">
              {auction.itemName}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Listed by: <span className="text-blue-400 font-semibold">{auction.seller || 'Verified Seller'}</span>
            </p>
          </div>

          {/* Main Grid: Responsive Stacking (Mobile: Bid box on top, details below) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Mobile / Desktop Action Box (Order 1 on mobile, 12 on desktop) */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <CardSpotlight className="bg-slate-900/80 border-slate-800 p-5 sm:p-6 lg:sticky lg:top-8">
                <div className="text-center pb-5 mb-5 border-b border-slate-800">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Current Highest Bid
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-blue-400 my-2">
                    {format(auction.currentBid)}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft}</span>
                  </div>
                </div>

                {auction.isClosed || isAuctionEnded ? (
                  <div className="text-center py-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h3 className="font-bold text-white text-base mb-1">Auction Concluded</h3>
                    <p className="text-xs text-slate-400 mb-4 px-4">This listing is closed and no longer accepting offers.</p>
                    <button
                      className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                      onClick={() => navigate(`/buyer/auction/result/${id}`)}
                    >
                      View Final Settlement
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                        Your Bid Amount ({currentCurrency.code})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currentCurrency.symbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          min={((Number(auction.currentBid || 0) * currentCurrency.rateFromUSD) + 0.01).toFixed(2)}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder={`${Math.ceil(Number(auction.currentBid || 0) * currentCurrency.rateFromUSD + (currentCurrency.code === 'INR' ? 100 : 5))}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>
                          Must exceed {format(auction.currentBid)}
                        </span>
                        {currentCurrency.code !== 'USD' && bidAmount && !isNaN(parseFloat(bidAmount)) && (
                          <span className="text-emerald-400 font-mono font-medium">
                            ≈ ${(parseFloat(bidAmount) / currentCurrency.rateFromUSD).toFixed(2)} USD
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick increment buttons (scaled by currency) */}
                    <div className="grid grid-cols-3 gap-2">
                      {(currentCurrency.code === 'INR' ? [100, 500, 1000] : [10, 50, 100]).map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          className="py-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer min-h-[44px]"
                          onClick={() => {
                            const baseVal = Number((Number(auction.currentBid || 0) * currentCurrency.rateFromUSD).toFixed(2));
                            setBidAmount((baseVal + inc).toFixed(0));
                          }}
                        >
                          +{currentCurrency.symbol}{inc}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-base transition shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer min-h-[48px]"
                    >
                      {submitting ? 'Submitting Bid...' : 'Place Bid Now'}
                    </button>

                    <div className="pt-2 text-center">
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Every placed bid is legally binding under applicable auction law.{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Scale className="w-3 h-3 inline" />
                          <span>View Legal Terms & Conditions</span>
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </CardSpotlight>
            </div>

            {/* Description & Bids History (Order 2 on mobile, 1 on desktop) */}
            <div className="lg:col-span-7 order-2 lg:order-1 space-y-6">
              {/* Description Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h2 className="text-base sm:text-lg font-bold text-white mb-3">Item Description</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-6">
                  {auction.description}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-800">
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] sm:text-xs text-slate-500 block uppercase">Starting Price</span>
                    <span className="font-bold text-slate-200 text-sm sm:text-base">
                      {format(auction.startingBid || auction.currentBid)}
                    </span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] sm:text-xs text-slate-500 block uppercase">Total Offers</span>
                    <span className="font-bold text-slate-200 text-sm sm:text-base">
                      {auction.bids?.length || 0}
                    </span>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] sm:text-xs text-slate-500 block uppercase">Status</span>
                    <span className={`font-bold text-sm sm:text-base ${auction.isClosed ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {auction.isClosed ? 'Closed' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Bid History Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-white mb-0">Live Bid Activity</h2>
                  <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                    Real-time
                  </span>
                </div>

                {auction.bids && auction.bids.length > 0 ? (
                  <div className="divide-y divide-slate-800/80">
                    {auction.bids.map((b, idx) => (
                      <div
                        key={b._id || idx}
                        className={`py-3 flex items-center justify-between ${
                          idx === 0 ? 'bg-blue-500/5 -mx-2 px-2 rounded-lg' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-200">
                              {b.bidderUsername}
                              {idx === 0 && (
                                <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                  Leading
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {b.createdAt ? moment(b.createdAt).fromNow() : 'Just now'}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm sm:text-base font-extrabold text-blue-400">
                          {format(b.bidAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs sm:text-sm text-center py-6 mb-0">
                    No bids placed yet. Place the opening bid!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
        />
      </main>
    </div>
  );
};

export default BuyerAuctionDetail;
