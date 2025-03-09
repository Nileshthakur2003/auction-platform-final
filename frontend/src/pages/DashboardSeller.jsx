import React, { useEffect, useState } from 'react';
import ApiConnector from '../components/apiconnector';
import Sidebar from '../components/SellerSidebar';

const DashboardSeller = () => {
    const [activeListings, setActiveListings] = useState([]);
    const [globalAuctions, setGlobalAuctions] = useState([]);
    const [totalAuctions, setTotalAuctions] = useState(0);
    const [earnings, setEarnings] = useState(0);

    useEffect(() => {
        // Fetch data for active listings
        ApiConnector.get('/getAuctionsForSeller')
            .then(response => {
                let tempdata = response.data;
                let filteredData = [];
                for (let i = 0; i < tempdata.length; i++) {
                    if (tempdata[i].isClosed === false) {
                        filteredData.push(tempdata[i]);
                    }
                }
                setActiveListings(filteredData);
                setTotalAuctions(response.data.length);
            })
            .catch(error => console.error('Error fetching active listings:', error));

        // Fetch data for global auctions
        ApiConnector.get('/auctions')
            .then(response => setGlobalAuctions(response.data))
            .catch(error => console.error('Error fetching global auctions:', error));

        // Fetch data for earnings
        ApiConnector.get('/getstats')
            .then(response => {
                setEarnings(response.data.totalEarnings);
            })
            .catch(error => console.error('Error fetching earnings:', error));
    }, []);

    return (
        <div className="container-fluid" style={{ height: '100%' }}>
            <div className="row" style={{ height: '100%' }}>
                <Sidebar />
                <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100%' }}>
                    <h2>Seller Dashboard</h2>
                    
                    {/* Dashboard Cards */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <div className="card text-white bg-primary">
                                <div className="card-body">
                                    <h5 className="card-title">My Live Auctions</h5>
                                    <p className="card-text">{activeListings.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card text-white bg-success">
                                <div className="card-body">
                                    <h5 className="card-title">My Total Auctions</h5>
                                    <p className="card-text">{totalAuctions}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card text-white bg-info">
                                <div className="card-body">
                                    <h5 className="card-title">My Earnings</h5>
                                    <p className="card-text">${earnings}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col text-center">
                            <button className="btn btn-primary btn-lg">Create Auction</button>
                        </div>
                    </div>

                    {/* Recent Auctions Globally */}
                    <div className="row">
                        <div className="col-md-12">
                            <h4>Recent Auctions Globally</h4>
                            <div className="row">
                                {globalAuctions.map((auction, index) => (
                                    <div className="col-md-4 mb-3" key={index}>
                                        <div className="card">
                                            <div className="card-header bg-dark text-white">
                                                <h5 className="card-title">{auction.itemName}</h5>
                                            </div>
                                            <div className="card-body">
                                                <p className="card-text">{auction.description}</p>
                                                <p className="card-text"><strong>Current Bid: </strong>${auction.currentBid}</p>
                                                <p className="card-text"><strong>Opening Time: </strong>{new Date(auction.openingTime).toLocaleString()}</p>
                                                <p className="card-text"><strong>Closing Time: </strong>{new Date(auction.closingTime).toLocaleString()}</p>
                                                <p className="card-text"><strong>Bidders: </strong>{auction.bidders.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSeller;
