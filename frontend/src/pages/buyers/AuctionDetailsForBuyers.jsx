import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import toast from 'react-hot-toast';
import ApiConnector from '../../components/apiconnector';
import BuyerSidebar from '../../components/BuyerSidebar';
import socket from '../../socket';

const BuyerAuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

    // Join real-time room for live bids
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
      toast.success(`⚡ New highest bid: $${data.currentBid} by ${data.highestBidder}!`);
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

    if (isNaN(numericBid) || numericBid <= parseFloat(auction.currentBid)) {
      toast.error(`Your bid must be greater than $${auction.currentBid}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await ApiConnector.post(`/bid/${id}`, { bid: numericBid });
      toast.success('Bid placed successfully!');
      // Update local state immediately
      setAuction((prev) => ({
        ...prev,
        currentBid: numericBid,
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
      <div className="container-fluid" style={{ height: '100%' }}>
        <div className="row" style={{ height: '100%' }}>
          <BuyerSidebar />
          <div className="col-md-10 offset-md-2 d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" role="status" />
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container-fluid" style={{ height: '100%' }}>
        <div className="row" style={{ height: '100%' }}>
          <BuyerSidebar />
          <div className="col-md-10 offset-md-2 p-5">
            <div className="alert alert-danger">Auction not found.</div>
            <button className="btn btn-primary" onClick={() => navigate('/buyer/all-auctions')}>
              Back to All Auctions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <BuyerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <button
                className="btn btn-outline-secondary btn-sm mb-2"
                onClick={() => navigate('/buyer/all-auctions')}
              >
                &larr; Back to Listings
              </button>
              <h2 className="fw-bold text-dark mb-0">{auction.itemName}</h2>
              <span className="text-muted small">Seller: {auction.seller || 'Verified Seller'}</span>
            </div>
            {auction.isClosed || isAuctionEnded ? (
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate(`/buyer/auction/result/${id}`)}
              >
                View Final Results &rarr;
              </button>
            ) : (
              <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-6">
                ● Live Auction
              </span>
            )}
          </div>

          <div className="row g-4">
            {/* Left Column: Details & Bid History */}
            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3">Item Description</h5>
                <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                  {auction.description}
                </p>

                <hr className="my-4" />

                <div className="row g-3 text-center">
                  <div className="col-4">
                    <div className="p-2 rounded bg-light">
                      <span className="small text-muted d-block">Starting Bid</span>
                      <span className="fw-bold fs-5">${auction.startingBid || auction.currentBid}</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded bg-light">
                      <span className="small text-muted d-block">Total Bids</span>
                      <span className="fw-bold fs-5">{auction.bids?.length || 0}</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded bg-light">
                      <span className="small text-muted d-block">Status</span>
                      <span className={`fw-bold fs-5 ${auction.isClosed ? 'text-danger' : 'text-success'}`}>
                        {auction.isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Bid History */}
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Live Bid Activity</h5>
                  <span className="badge bg-primary-subtle text-primary">Real-time Stream</span>
                </div>

                {auction.bids && auction.bids.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Bidder</th>
                          <th>Amount</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auction.bids.map((b, idx) => (
                          <tr key={b._id || idx} className={idx === 0 ? 'table-success fw-bold' : ''}>
                            <td>
                              {b.bidderUsername} {idx === 0 && <span className="badge bg-success ms-1">Highest</span>}
                            </td>
                            <td>${Number(b.bidAmount).toLocaleString()}</td>
                            <td className="small text-muted">
                              {b.createdAt ? moment(b.createdAt).fromNow() : 'Just now'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted text-center py-4 mb-0">
                    No bids have been placed yet. Be the first to bid!
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Place Bid Card */}
            <div className="col-md-5">
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white sticky-top" style={{ top: '30px' }}>
                <div className="text-center mb-4">
                  <span className="text-muted small text-uppercase fw-semibold">Current Highest Bid</span>
                  <div className="display-4 fw-bold text-primary my-2">
                    ${Number(auction.currentBid || 0).toLocaleString()}
                  </div>
                  <div className="d-inline-flex align-items-center px-3 py-1 rounded-pill bg-warning-subtle text-warning-emphasis fw-bold">
                    ⏱ {timeLeft}
                  </div>
                </div>

                {auction.isClosed || isAuctionEnded ? (
                  <div className="alert alert-secondary text-center">
                    <h6 className="fw-bold mb-1">Auction Concluded</h6>
                    <p className="small mb-2">No further bids can be accepted.</p>
                    <button
                      className="btn btn-primary w-100 btn-sm"
                      onClick={() => navigate(`/buyer/auction/result/${id}`)}
                    >
                      See Auction Result
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Your Bid Amount ($ USD)</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min={parseFloat(auction.currentBid) + 1}
                          className="form-control fw-bold"
                          placeholder={`${parseFloat(auction.currentBid) + 10}`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-text text-muted">
                        Must be strictly higher than ${Number(auction.currentBid).toLocaleString()}
                      </div>
                    </div>

                    <div className="d-flex gap-2 mb-3">
                      {[10, 50, 100].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          className="btn btn-outline-secondary btn-sm flex-fill"
                          onClick={() => setBidAmount((parseFloat(auction.currentBid) + inc).toFixed(2))}
                        >
                          +${inc}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Placing Bid...
                        </span>
                      ) : (
                        'Place Bid Now'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerAuctionDetail;
