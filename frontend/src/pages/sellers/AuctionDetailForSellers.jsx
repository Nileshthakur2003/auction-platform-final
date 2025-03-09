import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import ApiConnector from '../../components/apiconnector';
import SellerSidebar from '../../components/SellerSidebar';

const SellerAuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState({});
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await ApiConnector.get(`/getauction/${id}`);
        setAuction(response.data);



        console.log(auction)


      } catch (error) {
       
        if (error.response.error === "TokenExpiredError") {
          navigate('/signin');
        }
        console.error('Error fetching auction data:', error);
      }
    };

    fetchAuction();
  }, [id, navigate]);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar Section */}
        <SellerSidebar />

        {/* Main Content Section */}
        <div className="col-md-10 offset-md-2" style={{ padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <div className="mt-5">
            <h2>Auction Details (Seller)</h2>
            <div className="table-responsive mt-4">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Item Name</strong></td>
                    <td>{auction.itemName}</td>
                  </tr>
                  <tr>
                    <td><strong>Description</strong></td>
                    <td>{auction.description}</td>
                  </tr>
                  <tr>
                    <td><strong>Current Bid</strong></td>
                    <td>{auction.currentBid}</td>
                  </tr>
                  <tr>
                    <td><strong>Opening Time</strong></td>
                    <td>{new Date(auction.openingTime).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Closing Time</strong></td>
                    <td>{new Date(auction.closingTime).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Number of Bids</strong></td>
                    <td>
                      {auction.editable ? (
                        <>
                          {auction.bids?.length} <button onClick={handleModalShow} className="btn btn-link">View Bids</button>
                        </>
                      ) : (
                        <i>Locked for Owner</i>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{auction.isClosed ? 'Closed' : 'Active'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {auction.editable && (
              <div className="mt-4">
                <button className="btn btn-primary mr-2">Close Auction</button>
                <button className="btn btn-secondary">Edit Auction</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal Section */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Bids</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Bidder</th>
                <th>Bid Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {auction.bids?.map((bid, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{bid.bidderUsername}</td>
                  <td>{bid.bidAmount}</td>
                  <td>{new Date(bid.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SellerAuctionDetail;
