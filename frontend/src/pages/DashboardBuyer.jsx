import React from 'react';
import BuyerSidebar from '../components/BuyerSidebar';
import BuyerDashboardContent from '../components/BuyerDashboardContent';

const DashboardBuyer = ({ auctions }) => {
  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <BuyerSidebar />
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100%' }}>
          <h2>Buyer Dashboard</h2>
          <BuyerDashboardContent auctions={auctions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardBuyer;
