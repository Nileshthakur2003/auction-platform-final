import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import ApiConnector from '../../components/apiconnector';
import BuyerSidebar from '../../components/BuyerSidebar';

const BuyerAuctionResult = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await ApiConnector.get(`/getauctionresult/${id}`);
        setAuction(response.data);
      } catch (error) {
        console.error('Error fetching auction result data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  const formatDate = (date) => {
    return date ? moment(date).format('MMMM Do YYYY, h:mm a') : 'N/A';
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
            <div className="alert alert-danger">Auction result not found.</div>
            <button className="btn btn-primary" onClick={() => navigate('/buyer/all-auctions')}>
              Back to Auctions
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
          <div className="mb-4">
            <button
              className="btn btn-outline-secondary btn-sm mb-2"
              onClick={() => navigate('/buyer/all-auctions')}
            >
              &larr; Back to All Auctions
            </button>
            <h2 className="fw-bold text-dark mb-0">Official Auction Result</h2>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <div>
                <h3 className="fw-bold text-primary mb-1">{auction.itemName}</h3>
                <p className="text-muted mb-0 small">Item ID: {auction.auctionId}</p>
              </div>
              <span className="badge bg-secondary px-3 py-2 fs-6">Concluded Auction</span>
            </div>

            <p className="text-muted fs-6 mb-4">{auction.description}</p>

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="p-4 rounded-3 bg-light border">
                  <span className="text-muted small text-uppercase fw-bold d-block mb-1">
                    Winning Bid Price
                  </span>
                  <div className="display-6 fw-bold text-success mb-2">
                    ${Number(auction.currentBid || 0).toLocaleString()}
                  </div>
                  <div className="small">
                    <strong>Winning Bidder: </strong>
                    <span className="badge bg-success-subtle text-success fs-6 ms-1">
                      {auction.highestBidder || 'No Bids Placed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-4 rounded-3 bg-light border h-100 d-flex flex-column justify-content-center">
                  <div className="mb-2">
                    <strong className="text-muted">Start Date:</strong> {formatDate(auction.openingTime)}
                  </div>
                  <div className="mb-2">
                    <strong className="text-muted">Ended Date:</strong> {formatDate(auction.closingTime)}
                  </div>
                  <div>
                    <strong className="text-muted">Total Bids Placed:</strong>{' '}
                    <span className="badge bg-primary ms-1">{auction.bids?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {auction.isClosed && (
              <div className="alert alert-info d-flex align-items-center mb-0" role="alert">
                <span className="fs-4 me-3">ℹ️</span>
                <div>
                  This auction has officially closed. The highest verified bidder will be contacted to
                  complete settlement.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerAuctionResult;
