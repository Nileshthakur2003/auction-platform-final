import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import moment from 'moment-timezone';
import SellerSidebar from '../../components/SellerSidebar';
import ApiConnector from '../../components/apiconnector';
import TermsModal from '../../components/TermsModal';
import { useCurrency } from '../../context/CurrencyContext';
import { ArrowLeft, PlusCircle, Scale } from 'lucide-react';

const PostAuction = () => {
  const { currentCurrency } = useCurrency();
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const navigate = useNavigate();

  const auctionSchema = z
    .object({
      itemName: z.string().trim().min(3, 'Title must be at least 3 characters'),
      description: z.string().trim().min(10, 'Description must be at least 10 characters'),
      startingBid: z.number().positive('Starting bid must be a positive number'),
      openingTime: z.string().nonempty('Start date and time is required'),
      closingTime: z.string().nonempty('End date and time is required'),
    })
    .refine((data) => new Date(data.closingTime) > new Date(data.openingTime), {
      message: 'End date and time must be after the start date and time',
      path: ['closingTime'],
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rawStartingBid = parseFloat(startingBid);
    // Convert starting bid from seller's active currency to USD base
    const startingBidUSD = Number((rawStartingBid / currentCurrency.rateFromUSD).toFixed(2));

    const newItem = {
      itemName,
      description,
      startingBid: startingBidUSD,
      openingTime: moment.tz(openingTime, 'Asia/Kolkata').toDate().toISOString(),
      closingTime: moment.tz(closingTime, 'Asia/Kolkata').toDate().toISOString(),
    };

    const validationResult = auctionSchema.safeParse(newItem);
    if (!validationResult.success) {
      const formErrors = validationResult.error.formErrors.fieldErrors;
      setErrors(formErrors);
      toast.error('Please resolve the form validation errors');
      return;
    }

    if (!agreedTerms) {
      toast.error('You must agree to the legal auction terms to publish a listing');
      return;
    }

    setSubmitting(true);
    try {
      const response = await ApiConnector.post('/auction', newItem);
      if (response.status === 201) {
        toast.success('Auction posted successfully!');
        navigate('/seller/current-auctions');
      }
    } catch (error) {
      console.error('Error posting auction:', error);
      const msg = error.response?.data?.message || 'Failed to create auction. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <SellerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition py-2 cursor-pointer"
              onClick={() => navigate('/seller')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Post New Auction
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              List a new item for live competitive bidding
            </p>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Auction Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm sm:text-base placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition min-h-[44px]"
                  placeholder="e.g. Vintage 1970s Chronograph Watch"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
                {errors.itemName && <p className="text-xs text-rose-400 mt-1">{errors.itemName}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Starting Bid ({currentCurrency.code})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    {currentCurrency.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm sm:text-base font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition min-h-[44px]"
                    placeholder={currentCurrency.code === 'INR' ? '1000.00' : '50.00'}
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    required
                  />
                </div>
                {currentCurrency.code !== 'USD' && startingBid && !isNaN(parseFloat(startingBid)) && (
                  <span className="text-[11px] text-emerald-400/90 mt-1 block font-mono">
                    ≈ ${(parseFloat(startingBid) / currentCurrency.rateFromUSD).toFixed(2)} USD base rate (1 USD = {currentCurrency.rateFromUSD} {currentCurrency.code})
                  </span>
                )}
                {errors.startingBid && <p className="text-xs text-rose-400 mt-1">{errors.startingBid}</p>}
              </div>

              {/* Mobile stacked, desktop side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 min-h-[44px]"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    required
                  />
                  {errors.openingTime && <p className="text-xs text-rose-400 mt-1">{errors.openingTime}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 min-h-[44px]"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    required
                  />
                  {errors.closingTime && <p className="text-xs text-rose-400 mt-1">{errors.closingTime}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Item Description
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm sm:text-base placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  rows="4"
                  placeholder="Provide condition, provenance, authenticity, and shipping details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
              </div>

              {/* Minimalist Legal Terms & Title Warranty Confirmation */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="termsAgree"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 cursor-pointer shrink-0"
                  required
                />
                <label htmlFor="termsAgree" className="text-xs text-slate-400 cursor-pointer select-none leading-relaxed">
                  I warrant lawful ownership and good title to this lot and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 inline cursor-pointer"
                  >
                    Auction Legal Terms & Conditions
                  </button>{' '}
                  (irrevocable deed conveyance upon fall of the hammer).
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer min-h-[48px] flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{submitting ? 'Publishing Listing...' : 'Publish Auction Listing'}</span>
              </button>
            </form>
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

export default PostAuction;
