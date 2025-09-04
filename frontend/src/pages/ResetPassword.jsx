import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ otp: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate('/forgot-password');
    toast.error('Please request a password reset first.');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/users/reset-password', { email, ...formData });
      toast.success(data.message);
      navigate('/'); // Navigate to home to show login modal
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed.';
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reset Your Password</h2>
                <p className="mt-2 text-sm text-slate-600">Enter the OTP and your new password.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                    <label className="block text-sm text-slate-600 mb-1">OTP</label>
                    <input type="text" name="otp" onChange={handleChange} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Enter OTP" required />
                </div>
                <div>
                    <label className="block text-sm text-slate-600 mb-1">New Password</label>
                    <input type="password" name="password" onChange={handleChange} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="••••••••" required />
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-rose-700 transition disabled:bg-rose-400">
                        {loading ? 'Resetting...' : 'Reset Password'}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ResetPassword;