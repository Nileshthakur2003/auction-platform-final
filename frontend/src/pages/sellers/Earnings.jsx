import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SellerSidebar from '../../components/SellerSidebar'; // Make sure to import the SellerSidebar component
import ApiConnector from '../../components/apiconnector';
import moment from 'moment';

const Earnings = () => {
  const [earningsData, setEarningsData] = useState([]);
  const [stats, setStats] = useState({
    auctionedItems: 0,
    bidsReceived: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const earningsResponse = await ApiConnector.get('/getearnings'); // Fetch earnings data
        setEarningsData(earningsResponse.data);

        const statsResponse = await ApiConnector.get('/getstats'); // Fetch stats data
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      }
    };

    fetchEarningsData();
  }, []);

  const formatDate = (date) => {
    return moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <SellerSidebar /> {/* Include the SellerSidebar component */}
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <h2 className='mt-5'>$ Earnings</h2>
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card text-white bg-primary mb-3">
                <div className="card-body">
                  <h5 className="card-title" style={{ fontSize: '1.5rem' }}>Auctioned Items</h5>
                  <p className="card-text" style={{ fontSize: '1.25rem' }}>{stats.auctionedItems}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-success mb-3">
                <div className="card-body">
                  <h5 className="card-title" style={{ fontSize: '1.5rem' }}>Number of Bids Received</h5>
                  <p className="card-text" style={{ fontSize: '1.25rem' }}>{stats.bidsReceived}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-info mb-3">
                <div className="card-body">
                  <h5 className="card-title" style={{ fontSize: '1.5rem' }}>Total Earnings</h5>
                  <p className="card-text" style={{ fontSize: '1.25rem' }}>${stats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="table-responsive mt-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ fontSize: '1.25rem' }}>Item Name</th>
                  <th style={{ fontSize: '1.25rem' }}>Final Bid</th>
                  <th style={{ fontSize: '1.25rem' }}>Closing Time</th>
                  <th style={{ fontSize: '1.25rem' }}>Opening Time</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '1.15rem' }}>{item.itemName}</td>
                    <td style={{ fontSize: '1.15rem' }}>{item.finalBid}</td>
                    <td style={{ fontSize: '1.15rem' }}>{formatDate(item.closingTime)}</td>
                    <td style={{ fontSize: '1.15rem' }}>{formatDate(item.openingTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='mt-4' style={{ fontSize: '1.25rem' }}>
            Total Earnings: ${stats.totalEarnings.toFixed(2)}
          </p> {/* Add a total earnings summary */}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
