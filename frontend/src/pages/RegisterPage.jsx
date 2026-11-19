import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spotlight from '../components/ui/Spotlight';
import BackgroundBeams from '../components/ui/BackgroundBeams';
import CardSpotlight from '../components/ui/CardSpotlight';
import { User, Mail, Lock, Briefcase, ArrowRight, Gavel } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('0'); // 0: Buyer, 1: Seller
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!username || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        userType,
      });

      if (result.success) {
        toast.success('Registration successful! Please sign in.');
        navigate('/signin');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 overflow-hidden">
      {/* Aceternity Spotlight & Beams */}
      <Spotlight className="-top-40 right-10 md:right-1/3 md:-top-20" fill="#a855f7" />
      <BackgroundBeams />

      <div className="relative z-10 w-full max-w-md my-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-white mb-2 group">
            <span className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition">
              <Gavel className="w-6 h-6" />
            </span>
            <span className="tracking-tight">AuctionHub</span>
          </Link>
          <p className="text-slate-400 text-sm">Create an account to join live bidding</p>
        </div>

        {/* Aceternity CardSpotlight */}
        <CardSpotlight color="#a855f7" className="p-8 shadow-2xl border-slate-800/90 bg-slate-900/80 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-slate-400 text-sm mb-6">Choose your role and register in seconds</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Account Type
              </label>
              <div className="relative">
                <Briefcase className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="0">Buyer (Place bids & win auctions)</option>
                  <option value="1">Seller (Publish & manage auction listings)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer mt-2"
            >
              {submitting ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-purple-400 font-medium hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </CardSpotlight>
      </div>
    </div>
  );
};

export default RegisterPage;
