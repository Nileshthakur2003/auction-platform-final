import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-bootstrap';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';
import { useAuth } from '../../context/AuthContext';

const BuyerProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState({ username: '', email: '', userType: '0' });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiConnector.get('/profile');
        setProfile(response.data.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const openModal = () => {
    setNewUsername(profile.username);
    setNewEmail(profile.email);
    setModalIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await ApiConnector.post('/updateprofile', {
        username: newUsername,
        email: newEmail,
      });

      const updated = response.data.data;
      setProfile(updated);
      updateUser(updated);
      toast.success('Profile updated successfully!');
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid" style={{ height: '100%' }}>
      <div className="row" style={{ height: '100%' }}>
        <BuyerSidebar />
        <div
          className="col-md-10 offset-md-2"
          style={{ padding: '30px', overflowY: 'auto', height: '100vh', backgroundColor: '#f8fafc' }}
        >
          <div className="mx-auto" style={{ maxWidth: '600px', marginTop: '40px' }}>
            <h2 className="fw-bold text-dark text-center mb-4">My Buyer Profile</h2>

            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="text-center pb-3 border-bottom">
                <div
                  className="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center mb-3"
                  style={{ width: '80px', height: '80px', fontSize: '32px' }}
                >
                  {profile.username ? profile.username[0].toUpperCase() : 'U'}
                </div>
                <h4 className="fw-bold mb-1">{profile.username || 'Loading...'}</h4>
                <span className="badge bg-primary px-3 py-2 rounded-pill">Buyer Account</span>
              </div>

              <div className="pt-4">
                <div className="mb-3">
                  <label className="text-muted small fw-bold">EMAIL ADDRESS</label>
                  <p className="fs-5 text-dark mb-0">{profile.email || '—'}</p>
                </div>
                <div className="mb-4">
                  <label className="text-muted small fw-bold">ROLE</label>
                  <p className="fs-5 text-dark mb-0">Registered Bidder / Buyer</p>
                </div>

                <button className="btn btn-outline-primary w-100 fw-semibold" onClick={openModal}>
                  ✏️ Edit Profile Information
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} centered>
        <form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label fw-semibold">Username</label>
              <input
                type="text"
                className="form-control"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default BuyerProfile;
