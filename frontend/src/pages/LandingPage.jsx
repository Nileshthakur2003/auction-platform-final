import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="container text-center" style={{  background: '#C0C0C0', backgroundSize: 'cover' }}>
      <h2>Online Auction Portal</h2>
      <p>A real-time bidding platform</p>
      <div className="mt-4">
        <Link to="/signin" className="btn btn-primary mr-2" style={{ marginRight: "5px" }}>Login</Link>
        <Link to="/signup" className="btn btn-secondary">Register</Link>
      </div>
      <div className="mt-5">
        <p>Welcome to the Online Auction Portal, where you can bid on a wide range of items from the comfort of your home. Whether you're looking for rare collectibles, the latest gadgets, or unique treasures, our platform offers a secure and exciting bidding experience.</p>
        <p>Sign up now to join our community of bidders and start exploring the incredible deals available. With real-time bidding and a user-friendly interface, our platform ensures a seamless experience for both buyers and sellers. Don't miss out on the chance to find exactly what you're looking for!</p>
      </div>
    </div>
  );
};

export default LandingPage;
