import React, { useEffect, useState } from 'react';
import SellerSidebar from '../../components/SellerSidebar';
import ApiConnector from '../../components/apiconnector';
import moment from 'moment';

const Earnings = () => {
  const [earningsData, setEarningsData] = useState([]);
  const [stats, setStats] = useState({
    auctionedItems: 0,
    bidsReceived: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const [earningsResponse, statsResponse] = await Promise.all([
          ApiConnector.get('/getearnings'),
          ApiConnector.get('/getstats'),
        ]);
        setEarningsData(earningsResponse.data || []);
        setStats(statsResponse.data || { auctionedItems: 0, bidsReceived: 0, totalEarnings: 0 });
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  const formatDate = (date) => {
    return date ? moment(date).format('MMMM Do YYYY, h:mm a') : 'N/A';
  };

  const safeTotal = Number(stats.totalEarnings || 0);

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <SellerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-1">Financial & Earnings Report</h2>
            <p className="text-muted mb-0">Overview of sold inventory and realized gross proceeds</p>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-primary text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Total Listed Items</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">{stats.auctionedItems}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-info text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Bids Received</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">{stats.bidsReceived}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-success text-white">
                <div className="card-body">
                  <div className="text-uppercase small fw-bold opacity-75">Gross Revenue</div>
                  <h3 className="display-6 fw-bold mt-2 mb-0">${safeTotal.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            <h4 className="fw-bold text-dark mb-3">Completed Sales & Finalized Bids</h4>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : earningsData.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No finalized sales yet. When your closed auctions have winning bids, they will show here.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Final Sold Price</th>
                      <th>Opening Time</th>
                      <th>Settled Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsData.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{item.itemName}</td>
                        <td className="fw-bold text-success fs-6">
                          ${Number(item.finalBid || 0).toLocaleString()}
                        </td>
                        <td className="small text-muted">{formatDate(item.openingTime)}</td>
                        <td className="small text-muted">{formatDate(item.closingTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
