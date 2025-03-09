import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import ApiConnector from '../../components/apiconnector';
import SellerSidebar from '../../components/SellerSidebar';

const SellerAuctionResult = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState({});

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await ApiConnector.get(`/getauctionresult/${id}`);
        setAuction(response.data);
      } catch (error) {
        if(error.response.data.error == "TokenExpiredError"){
            navigate('/signin');
          }
        console.error('Error fetching auction result data:', error);
      }
    };

    fetchAuction();
  }, [id]);

  const formatDate = (date) => {
    return moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar Section */}
        <SellerSidebar />

        {/* Main Content Section */}
        <div className="col-md-10 offset-md-2" style={{ padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <div className="card mt-5 shadow-sm">
            <div className="card-body" style={{ fontSize: '1.25rem' }}>
              <h2 className="card-title">Auction Result</h2>
              <div className="row">
                <div className="col-md-12">
                  <h3>Auction Item: {auction.itemName}</h3>
                  <p>Description: {auction.description}</p>
                  <p><strong>Auction ID:</strong> {auction.auctionId}</p>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-6">
                  <p><strong>Final Bid:</strong> {auction.currentBid}</p>
                  <p><strong>Winning Bidder:</strong> {auction.highestBidder}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Opening Time:</strong> {formatDate(auction.openingTime)}</p>
                  <p><strong>Closing Time:</strong> {formatDate(auction.closingTime)}</p>
                  <p><strong>Total Bids:</strong> {auction.bids?.length}</p>
                </div>
              </div>
              {auction.isClosed && (
                <div className="alert alert-info mt-4" role="alert">
                  This Auction is closed now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAuctionResult;
