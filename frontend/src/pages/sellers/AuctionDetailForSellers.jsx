import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ApiConnector from '../../components/apiconnector';
import SellerSidebar from '../../components/SellerSidebar';
import CardSpotlight from '../../components/ui/CardSpotlight';
import socket from '../../socket';
import { useCurrency } from '../../context/CurrencyContext';
import { ArrowLeft, Edit3, Award, Users, Calendar, DollarSign } from 'lucide-react';

const SellerAuctionDetail = () => {
  const { format } = useCurrency();
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchAuction = async () => {
    try {
      const response = await ApiConnector.get(`/getauction/${id}`);
      setAuction(response.data);
      setEditTitle(response.data.itemName);
      setEditDesc(response.data.description);
    } catch (error) {
      console.error('Error fetching auction data:', error);
      toast.error('Failed to load auction data');
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
      toast.success(`⚡ New bid received: ${format(data.currentBid)} by ${data.highestBidder}`);
    });

    socket.on('auction_closed', () => {
      setAuction((prev) => (prev ? { ...prev, isClosed: true } : prev));
      toast('Auction is now closed.', { icon: '🏁' });
    });

    return () => {
      socket.emit('leave_auction', id);
      socket.off('bid_updated');
      socket.off('auction_closed');
    };
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiConnector.put(`/auction/${id}`, {
        itemName: editTitle,
        description: editDesc,
      });
      toast.success('Auction details updated successfully!');
      setAuction((prev) => ({
        ...prev,
        itemName: editTitle,
        description: editDesc,
      }));
      setShowEditModal(false);
    } catch (error) {
      console.error('Update error:', error);
      const msg = error.response?.data?.message || 'Failed to update auction';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
        <SellerSidebar />
        <main className="flex-1 min-w-0 w-full pt-20 md:pt-8 min-h-screen flex items-center justify-center px-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
        <SellerSidebar />
        <main className="flex-1 min-w-0 w-full pt-20 md:pt-8 min-h-screen px-4 flex items-center justify-center">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Item Not Found</h3>
            <button
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              onClick={() => navigate('/seller/all-auctions')}
            >
              Back to Listings
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <SellerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <button
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition py-2 cursor-pointer"
              onClick={() => navigate('/seller/current-auctions')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to my auctions</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {auction.editable && !auction.isClosed && (
                <button
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold transition min-h-[44px]"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Listing</span>
                </button>
              )}
              {auction.isClosed && (
                <button
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition min-h-[44px]"
                  onClick={() => navigate(`/seller/auction/result/${id}`)}
                >
                  <Award className="w-4 h-4" />
                  <span>Outcome</span>
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              {auction.itemName}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Status: <span className={auction.isClosed ? 'text-slate-400' : 'text-emerald-400 font-semibold'}>{auction.isClosed ? 'Closed' : 'Active'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h2 className="text-base sm:text-lg font-bold text-white mb-3">Item Description</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-6">
                  {auction.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-4 border-t border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Starting Bid</span>
                    <span className="font-bold text-white text-sm sm:text-base">{format(auction.startingBid || auction.currentBid)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Top Bid</span>
                    <span className="font-bold text-emerald-400 text-sm sm:text-base">{format(auction.currentBid)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Bids</span>
                    <span className="font-bold text-white text-sm sm:text-base">{auction.bids?.length || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                    <span className={`font-bold text-sm sm:text-base ${auction.isClosed ? 'text-slate-400' : 'text-emerald-400'}`}>
                      {auction.isClosed ? 'Closed' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="lg:col-span-4">
              <CardSpotlight color="#10b981" className="bg-slate-900/80 border-slate-800 p-5 sm:p-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Leading Offer
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-4">
                  {format(auction.currentBid || 0)}
                </div>

                <div className="space-y-2 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-800">
                  <div className="flex justify-between">
                    <span>Opening:</span>
                    <span className="text-slate-200">{new Date(auction.openingTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closing:</span>
                    <span className="text-slate-200">{new Date(auction.closingTime).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition min-h-[44px]"
                  onClick={() => setShowModal(true)}
                >
                  View Bid Ledger ({auction.bids?.length || 0})
                </button>
              </CardSpotlight>
            </div>
          </div>
        </div>
      </main>

      {/* Responsive Bids Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-slate-900 border-slate-800 text-white">
          <Modal.Title className="text-base sm:text-lg font-bold">Bids History</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-slate-950 text-slate-200 p-4 sm:p-6">
          {auction.bids && auction.bids.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {auction.bids.map((b, idx) => (
                <div key={b._id || idx} className="py-3 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-white">{b.bidderUsername}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {new Date(b.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-extrabold text-emerald-400 text-sm sm:text-base">
                    {format(b.bidAmount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-6">No bids received yet.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-slate-900 border-slate-800">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton className="bg-slate-900 border-slate-800 text-white">
            <Modal.Title className="text-base sm:text-lg font-bold">Edit Listing</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-slate-950 text-slate-200 p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                rows="4"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                required
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-slate-900 border-slate-800">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default SellerAuctionDetail;
