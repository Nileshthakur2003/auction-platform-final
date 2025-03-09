import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target.email_address.value;
    const password = event.target.password.value;

    try {
      const response = await axios.post('http://localhost:5001/signin', {
        email,
        password
      });

      const { token, user } = response.data;
      Cookies.set('auth_token', token, { expires: 7 }); // Token will be stored in the cookie for 7 days
      alert('Login successful! Token stored in cookie.');

      alert(user);

      if (user === 0) {
        navigate('/buyer');
      } else {
        navigate('/seller');
      }

    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container text-left" style={{ maxWidth: "450px", background: "#E5E4E2", color: "black" }}>
      <h1 className="text-center my-4" style={{ color: "black" }}>Auction Site</h1> {/* Added heading title */}
      <h2 className="text-center my-3" style={{ color: "black" }}>Sign In</h2>
      <form className="mx-auto" style={{ maxWidth: '400px' }} onSubmit={handleLogin}>
        <div className="form-group m-4">
          <label style={{ color: "black" }}>Email address</label>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">@</span>
            <input name='email_address' type="text" className="form-control" placeholder="Email Address" aria-label="Username" aria-describedby="basic-addon1" />
          </div>
        </div>
        <div className="form-group m-4">
          <label style={{ color: "black" }}>Password</label>
          <input name="password" type="password" className="form-control" placeholder="Enter password" />
        </div>
        <div className="text-center mt-3 mb-3">
          <button type="submit" className="form-control btn btn-primary">Sign In</button>
        </div>
      </form>
      <p className="text-center mt-3 mb-5">
        Don't have an account? <Link to="/signup">Register here</Link> 
      </p>
    </div>
  );
};

export default LoginPage;
