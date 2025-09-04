import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/users/forgot-password', { email });
      toast.success(data.message);
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred.';
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot Password</h2>
                <p className="mt-2 text-sm text-slate-600">Enter your email to receive a password reset OTP.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                    <label className="block text-sm text-slate-600 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" 
                      placeholder="you@example.com"
                      required 
                    />
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-rose-700 transition disabled:bg-rose-400">
                        {loading ? 'Sending...' : 'Send OTP'}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </div>
                 <div className="text-center">
                    <Link to="/" className="text-sm text-rose-700 hover:text-rose-800">Back to Home</Link>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ForgotPassword;