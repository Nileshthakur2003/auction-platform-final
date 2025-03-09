import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import ApiConnector from '../../components/apiconnector';
import BuyerSidebar from '../../components/BuyerSidebar';
import Modal from 'react-modal';




const BuyerAuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await ApiConnector.get(`/getauction/${id}`);
        setAuction(response.data);
      } catch (error) {
        if (error.response.status === 401) {
          navigate('/signin');
        }
        console.error('Error fetching auction data:', error);
      }
    };
    fetchAuction();
  }, [id, navigate]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const closingTime = moment(auction.closingTime);
      const now = moment();
      const duration = moment.duration(closingTime.diff(now));
      if (duration.asSeconds() > 0) {
        const weeks = Math.floor(duration.asWeeks());
        const days = Math.floor(duration.asDays() % 7);
        const hours = Math.floor(duration.asHours() % 24);
        const minutes = Math.floor(duration.asMinutes() % 60);
        const seconds = Math.floor(duration.asSeconds() % 60);
        setTimeLeft(`${weeks}weeks ${days}days ${hours}hours ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Auction Closed');
      }
    };
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.closingTime]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleBidSubmit = async () => {
    if (parseFloat(bidAmount) > parseFloat(auction.currentBid)) {
      try {
        const response = await ApiConnector.post(`/bid/${id}`, { bid:bidAmount });
        
        closeModal();


        
      } catch (error) {
        console.error('Error submitting bid:', error);
      }
    } else {
      alert('Bid amount must be greater than the current bid.');
    }
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      boxShadow: '0 5px 15px rgba(0,0,0,.5)',
    },
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <BuyerSidebar />
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <div className='mt-5'>
            <h2 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Auction Details (Buyer)</h2>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title mb-3" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{auction.itemName}</h3>
                <p className="card-text mb-4" style={{ fontSize: '1.25rem' }}>{auction.description}</p>
                <p className="card-text mb-3" style={{ fontSize: '1.25rem' }}><strong>Current Bid:</strong> {auction.currentBid}</p>
                <p className="card-text mb-3" style={{ fontSize: '1.25rem' }}><strong>Highest Bidder:</strong> {auction.highestBidder}</p>
                <p className="card-text mb-3" style={{ fontSize: '1.25rem' }}><strong>Opening Time:</strong> {moment(auction.openingTime).format('MMMM Do YYYY, h:mm:ss A')}</p>
                <p className="card-text mb-3" style={{ fontSize: '1.25rem' }}><strong>Closing Time:</strong> {moment(auction.closingTime).format('MMMM Do YYYY, h:mm:ss A')}</p>
                <p className="card-text mb-3" style={{ fontSize: '1.25rem' }}><strong>Time Left:</strong> {timeLeft}</p>
                
                <button className="btn btn-primary mt-4" style={{ fontSize: '1.25rem' }} onClick={openModal}>Bid in Auction</button>
              
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles}>
        <h2>Enter your bid amount</h2>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
        />
        <button onClick={handleBidSubmit}>Submit Bid</button>
        <button onClick={closeModal}>Cancel</button>
      </Modal>
    </div>
  );
};

export default BuyerAuctionDetail;
