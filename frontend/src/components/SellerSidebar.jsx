import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConnector from './apiconnector';
import Cookies from 'js-cookie'; // Ensure js-cookie is installed: npm install js-cookie


const SellerSidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await ApiConnector.get('/validate-token');
        setUser(response.data); // Assuming the user data is returned in response.data.user
      } catch (error) {
        console.error('Error validating token:', error);
        navigate('/signin'); // Navigate to sign-in page if there's an error
      }
    };

    validateToken();
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {

      // Clear the authentication token from cookies
      Cookies.remove('auth_token');

      // Redirect to the sign-in page
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const sidebarStyle = {
    paddingLeft: '0',
    backgroundColor: '#2C3E50',
    height: '100%',  // Set height to 100%
    position: 'fixed',
    left: '0',
    zIndex: '1000'
  };

  const listGroupStyle = {
    marginLeft: '20px',
    borderRadius: '0px',
    marginTop: '20px' /* Reduced marginTop to account for user card */
  };

  const listGroupItemStyle = {
    color: '#0da4ca',
    backgroundColor: '#00264d',
    border: 'none',
    padding: '15px 20px',
    marginBottom: '10px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
    borderRadius: '8px', // Added border-radius for rounded borders
  };

  const listGroupItemHoverStyle = {
    backgroundColor: '#005780',
    color: '#FFFFFF'
  };

  const handleMouseOver = (e) => {
    Object.assign(e.currentTarget.style, listGroupItemHoverStyle);
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = '#00264d';
    e.currentTarget.style.color = '#0da4ca';
  };

  return (
    <div className="col-md-2 fixed-left" style={sidebarStyle}>
      {user && (
        <div className="card" style={{ margin: '20px', marginTop: '10px', backgroundColor: '#34495E', color: '#ECF0F1' }}>
          <div className="card-body">
            <h5 className="card-title">Welcome, {user.username}</h5>
            <p className="card-text">{user.email}</p>
            <button className="btn btn-danger mt-3" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
      <ul className="list-group" style={listGroupStyle}>
        <li
          className="list-group-item"
          style={listGroupItemStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={() => handleNavigation('/seller/')}
        >
          Dashboard
        </li>
        <li
          className="list-group-item"
          style={listGroupItemStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={() => handleNavigation('/seller/post-auction')}
        >
          + New Auction
        </li>
        <li
          className="list-group-item"
          style={listGroupItemStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={() => handleNavigation('/seller/earnings')}
        >
          $ Earnings
        </li>
        <li
          className="list-group-item"
          style={listGroupItemStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={() => handleNavigation('/seller/current-auctions')}
        >
          My Auctions
        </li>
        <li
          className="list-group-item"
          style={listGroupItemStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={() => handleNavigation('/seller/all-auctions')}
        >
          All Auctions
        </li>
        <li
          className="list-group-item"
          style={listGroupItemStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={() => handleNavigation('/seller/profile')}
        >
          My Profile
        </li>
      </ul>
    </div>
  );
};

export default SellerSidebar;
