import React, { useEffect, useState } from 'react';
import BuyerSidebar from '../../components/BuyerSidebar';
import { Chip } from '@mui/material'; // Import Chip component from Material-UI
import ApiConnector from '../../components/apiconnector';
import Modal from 'react-modal';

const BuyerProfile = () => {
  const [profile, setProfile] = useState({ username: '', email: '', userType: 0 });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiConnector.get('/profile');
        setProfile(response.data.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfile();
  }, []);

  const openModal = () => {
    setNewUsername(profile.username);
    setNewEmail(profile.email);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSave = async () => {
    try {
      const response = await ApiConnector.post('/updateprofile', {
        username: newUsername,
        email: newEmail
      });

      setProfile(response.data.data);
      closeModal();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Modal styles
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '400px', // Adjust the width as needed
      padding: '20px'
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <BuyerSidebar /> {/* Include the BuyerSidebar component */}
        <div className="col-md-10 offset-md-2" style={{ paddingRight: '0', padding: '20px', overflowY: 'scroll', height: '100vh' }}>
          <h2 className="mt-5 text-center">My Profile</h2>
          <div className="d-flex justify-content-center">
            <div className="card mt-4" style={{ width: '50%' }}>
              <div className="card-body">
                <h5 className="card-title">{profile.username}</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  <Chip 
                    label={profile.userType === '1' ? 'Seller' : 'Buyer'} 
                    color={profile.userType === '1' ? 'primary' : 'default'} 
                    style={{ marginTop: '10px' }}
                  />
                </h6>
                <p className="card-text">
                  <strong>Email:</strong> {profile.email}<br />
                </p>
                
                <a href="#" className="card-link" onClick={openModal}>Edit Profile</a>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for editing profile */}
      <Modal 
        isOpen={modalIsOpen} 
        onRequestClose={closeModal} 
        contentLabel="Edit Profile"
        style={customStyles}
      >
        <h2>Edit Profile</h2>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              className="form-control" 
              id="username" 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)} 
            />
          </div>
        </form>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary mr-2" onClick={handleSave}>Save</button>
          <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default BuyerProfile;
