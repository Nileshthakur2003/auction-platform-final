import React from 'react';

const PastSales = ({ pastSales }) => {
  return (
    <section>
      <h3>Past Sales</h3>
      <div className="row">
        {pastSales.map((item, index) => (
          <div className="col-md-6 mb-4" key={index}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.description}</p>
                <p className="card-text"><strong>Sold For: </strong>{item.soldFor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PastSales;
