import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ApiConnector from '../../components/apiconnector';
import SellerSidebar from '../../components/SellerSidebar';
import socket from '../../socket';

const SellerAuctionDetail = () => {
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

    // Socket.io room join for live seller monitoring
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
      toast.success(`⚡ New bid received: $${data.currentBid} by ${data.highestBidder}`);
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
      <div className="container-fluid" style={{ height: '100%' }}>
        <div className="row" style={{ height: '100%' }}>
          <SellerSidebar />
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
          <SellerSidebar />
          <div className="col-md-10 offset-md-2 p-5">
            <div className="alert alert-danger">Auction item not found.</div>
            <button className="btn btn-primary" onClick={() => navigate('/seller/all-auctions')}>
              Back to Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <SellerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <button
                className="btn btn-outline-secondary btn-sm mb-2"
                onClick={() => navigate('/seller/current-auctions')}
              >
                &larr; Back to Listings
              </button>
              <h2 className="fw-bold text-dark mb-0">{auction.itemName}</h2>
              <span className="text-muted small">Seller ID: {auction.sellerId}</span>
            </div>

            <div className="d-flex gap-2">
              {auction.editable && !auction.isClosed && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowEditModal(true)}
                >
                  ✏️ Edit Details
                </button>
              )}
              {auction.isClosed && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/seller/auction/result/${id}`)}
                >
                  View Final Outcome &rarr;
                </button>
              )}
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3">Item Details</h5>
                <p className="text-muted mb-4" style={{ whiteSpace: 'pre-line' }}>
                  {auction.description}
                </p>

                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <tbody>
                      <tr>
                        <td className="bg-light fw-bold" style={{ width: '30%' }}>Opening Time</td>
                        <td>{new Date(auction.openingTime).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="bg-light fw-bold">Closing Time</td>
                        <td>{new Date(auction.closingTime).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="bg-light fw-bold">Starting Bid</td>
                        <td>${auction.startingBid || auction.currentBid}</td>
                      </tr>
                      <tr>
                        <td className="bg-light fw-bold">Current Top Bid</td>
                        <td className="fw-bold text-success fs-5">${auction.currentBid}</td>
                      </tr>
                      <tr>
                        <td className="bg-light fw-bold">Auction Status</td>
                        <td>
                          <span className={`badge ${auction.isClosed ? 'bg-secondary' : 'bg-success'}`}>
                            {auction.isClosed ? 'Closed' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-3">Bidding Overview</h5>
                <div className="text-center p-3 rounded bg-light mb-3">
                  <span className="small text-muted d-block">Total Bids Received</span>
                  <span className="display-6 fw-bold text-primary">{auction.bids?.length || 0}</span>
                </div>

                <button
                  className="btn btn-primary w-100 fw-semibold mb-2"
                  onClick={() => setShowModal(true)}
                >
                  View Full Bid History ({auction.bids?.length || 0})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bids Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Bids History for "{auction.itemName}"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {auction.bids && auction.bids.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Bidder</th>
                    <th>Bid Amount</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auction.bids.map((bid, index) => (
                    <tr key={bid._id || index} className={index === 0 ? 'table-success fw-bold' : ''}>
                      <td>{index + 1}</td>
                      <td>
                        {bid.bidderUsername} {index === 0 && <span className="badge bg-success ms-1">Leading</span>}
                      </td>
                      <td>${Number(bid.bidAmount).toLocaleString()}</td>
                      <td className="small text-muted">{new Date(bid.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-4 mb-0">No bids have been submitted yet.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Details Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Edit Auction Listing</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label fw-semibold">Item Title</label>
              <input
                type="text"
                className="form-control"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                required
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default SellerAuctionDetail;
