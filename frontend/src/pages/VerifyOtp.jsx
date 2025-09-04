import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';
import { ArrowRight } from 'lucide-react';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const { login: loginUser } = useAuthStore();

  if (!email) {
    navigate('/register');
    toast.error('Please register first.');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/users/verify-otp', { email, otp });
      loginUser(data.user, data.token);
      toast.success(data.message);
      
      // Redirect based on role
      switch (data.user.role) {
        case 'User': navigate('/user/dashboard'); break;
        case 'Blood Bank': navigate('/blood-bank/dashboard'); break;
        case 'Test Lab': navigate('/test-lab/dashboard'); break;
        default: navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-inter py-14">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="h-8 w-8 rounded-md bg-rose-600 text-white grid place-items-center shadow-sm">
              <span className="text-sm font-semibold tracking-tight">BF</span>
          </div>
          <span className="text-slate-800 text-base font-medium tracking-tight group-hover:text-rose-700 transition">Blood Finder</span>
        </Link>
      <div className="mx-auto max-w-md w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-slate-600">
            An OTP has been sent to <strong>{email}</strong>. Please enter it below.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Enter 6-Digit OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center tracking-[1em] rounded-md border border-slate-200 bg-white px-3 py-2 text-lg font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition"
              maxLength="6"
              required
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-rose-700 transition disabled:bg-rose-400"
            >
              {loading ? 'Verifying...' : 'Verify & Proceed'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;