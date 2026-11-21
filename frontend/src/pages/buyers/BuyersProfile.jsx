import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-bootstrap';
import BuyerSidebar from '../../components/BuyerSidebar';
import ApiConnector from '../../components/apiconnector';
import AuthorizedIdCardModal from '../../components/AuthorizedIdCardModal';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Edit3, Award } from 'lucide-react';

const BuyerProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState({ username: '', email: '', userType: '0' });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
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
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row">
      <BuyerSidebar />

      <main className="flex-1 min-w-0 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-8 flex flex-col justify-between">
        <div className="max-w-xl mx-auto w-full pt-4 sm:pt-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              My Profile
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">Manage your account information and credentials</p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex flex-col items-center pb-6 border-b border-slate-800 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500/40 text-blue-400 text-2xl font-black flex items-center justify-center mb-3">
                {profile.username ? profile.username[0].toUpperCase() : 'B'}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{profile.username || 'Loading...'}</h2>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                Verified Buyer Account
              </span>
            </div>

            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <Mail className="w-5 h-5 text-slate-500 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Email Address</span>
                  <div className="text-sm font-medium text-slate-200 truncate">{profile.email || '—'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <Shield className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Account Role</span>
                  <div className="text-sm font-medium text-slate-200">Registered Bidder / Buyer</div>
                </div>
              </div>

              <button
                className="w-full mt-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                onClick={openModal}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>

              <button
                className="w-full mt-2.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                onClick={() => setShowIdCard(true)}
              >
                <Award className="w-4 h-4 text-blue-400" />
                <span>View Official Bidder ID Pass</span>
              </button>
            </div>
          </div>
        </div>

        <AuthorizedIdCardModal
          isOpen={showIdCard}
          onClose={() => setShowIdCard(false)}
          user={profile.username ? profile : authUser}
          role="buyer"
        />
      </main>

      {/* Edit Modal */}
      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} centered>
        <form onSubmit={handleSave}>
          <Modal.Header closeButton className="bg-slate-900 border-slate-800 text-white">
            <Modal.Title className="text-base sm:text-lg font-bold">Edit Profile Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-slate-950 text-slate-200 p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-slate-900 border-slate-800">
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
