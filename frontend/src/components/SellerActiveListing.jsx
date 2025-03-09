import React from 'react';

const ActiveListings = ({ activeListings }) => {
  return (
    <section>
      <h3>Active Listings</h3>
      <div className="row">
        {activeListings.map((item, index) => (
          <div className="col-md-6 mb-4" key={index}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.description}</p>
                <p className="card-text"><strong>Starting Bid: </strong>{item.startingBid}</p>
                <button className="btn btn-primary">Edit Listing</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActiveListings;
