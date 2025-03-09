import React from 'react';

const Navbar = () => {
  const navbarStyle = {
    backgroundColor: '#2C3E50',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60px',
    position: 'fixed',
    top: '0',
    width: '100%',
    zIndex: '1000',
  };

  const titleStyle = {
    fontSize: '24px',
    color: '#ECF0F1',
    fontFamily: 'Cursive, Arial, sans-serif', // You can replace 'Cursive' with any exotic font you have
  };

  return (
    <nav className="navbar" style={navbarStyle}>
      <span style={titleStyle}>AuctionSite</span>
    </nav>
  );
};

export default Navbar;
