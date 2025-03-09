import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PopupMessage from '../components/PopupMessage';

const handleRegister = async (event) => {
  event.preventDefault();
  const username = event.target.username.value;
  const email = event.target.email.value;
  const password = event.target.password.value;
  const userType = event.target.userType.value;

  try {
    const response = await axios.post('http://localhost:5001/signup', {
      username,
      email,
      password,
      userType: userType
    });

    if (response.status === 201) {
      alert('Registration successful!');
      // You can also redirect the user to the login page or other actions
    } else {
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('An error occurred during registration. Please try again.');
  }
};

const RegisterPage = () => {
  return (
    <div className="container text-left" style={{maxWidth:"450px", background:"#E5E4E2", color:"black"}}>
      <h1 className="text-center my-4" style={{ color: "black" }}>Auction Site</h1> {/* Added heading title */}
      <h2 className="text-center my-5">Sign Up</h2>
      {/* <PopupMessage message="This is a temporary message!" duration={5000} /> */}
      <form className="mx-auto" style={{ maxWidth: '400px' }} onSubmit={handleRegister}>
        <div className="form-group m-4">
          <label>Username</label>
          <input name="username" type="text" className="form-control" placeholder="Enter username" />
        </div>
        <div className="form-group m-4">
          <label>Email address</label>
          <input name="email" type="email" className="form-control" placeholder="Enter email" />
        </div>
        <div className="form-group m-4">
          <label>Password</label>
          <input name="password" type="password" className="form-control" placeholder="Enter password" />
        </div>
        <div className="form-group m-4">
          <label>Type of User</label>
          <select name="userType" className="form-control">
            <option value="0">Buyer</option>
            <option value="1">Seller</option>
          </select>
        </div>
        <div className="text-center mt-3 mb-3">
          <button type="submit" className="form-control btn btn-primary">Sign Up</button>
        </div>
      </form>
      <p className="text-center mt-3 mb-5">
        Already have an account? <Link to="/signin">Sign In here</Link> 
      </p>
    </div>
  );
};

export default RegisterPage;
