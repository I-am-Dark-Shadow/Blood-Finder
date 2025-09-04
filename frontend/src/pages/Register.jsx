import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight, User, Building2, FlaskConical, UserCheck,
  Mail, Phone, Calendar, Eye, EyeOff, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'User',
    bloodGroup: '', phone: '', address: '', city: '', zipcode: '',
    gender: '', dateOfBirth: '', hospitalName: '', ownerName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.role) {
      setFormData(prev => ({ ...prev, role: location.state.role }));
    }
  }, [location.state]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleSelect = (role) => setFormData({ ...formData, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/users/register", formData);
      toast.success(data.message);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    "User": <User className="h-6 w-6 text-rose-600" />,
    "Blood Bank": <Building2 className="h-6 w-6 text-rose-600" />,
    "Test Lab": <FlaskConical className="h-6 w-6 text-rose-600" />
  };

  const roleDescriptions = {
    "User": "Donate or request blood easily",
    "Blood Bank": "Manage stock & donations",
    "Test Lab": "Handle reports & test results"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex flex-col items-center justify-center py-10 px-4">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center gap-2 group mb-6">
        <div className="h-9 w-9 rounded-lg bg-rose-600 text-white grid place-items-center shadow-sm">
          <span className="text-sm font-semibold">BF</span>
        </div>
        <span className="text-slate-800 text-base font-semibold group-hover:text-rose-700 transition">Blood Finder</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm text-slate-600">Sign up as a User, Blood Bank, or Test Lab</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Role Selector */}
          <div>
            {/* Desktop/Tab -> Card layout */}
            <div className="hidden sm:block">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center justify-center gap-2">
                  <UserCheck className="h-5 w-5 text-rose-600" />
                  Choose your role
                </h3>
                <p className="text-slate-600 text-sm">Select how you'll be using our platform</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["User", "Blood Bank", "Test Lab"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      formData.role === role
                        ? "border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg shadow-rose-500/20 scale-105"
                        : "border-slate-200 bg-white hover:border-rose-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-4 rounded-xl ${
                        formData.role === role ? "bg-rose-100 shadow-md" : "bg-slate-100 group-hover:bg-rose-50"
                      }`}>
                        {roleIcons[role]}
                      </div>
                      <h4 className="font-semibold text-slate-900">{role}</h4>
                      <p className="text-xs text-slate-600">{roleDescriptions[role]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile -> Dropdown */}
            <div className="sm:hidden">
              <label className="block text-sm font-medium text-slate-700 mb-1">I am a...</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white focus:ring-2 focus:ring-rose-500"
              >
                <option>User</option>
                <option>Blood Bank</option>
                <option>Test Lab</option>
              </select>
            </div>
          </div>

          {/* Form Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <UserCheck className="h-5 w-5 text-rose-600" />
                <h4 className="text-lg font-semibold text-slate-900">Basic Information</h4>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">{
                  formData.role === "User" ? "Full Name" :
                  formData.role === "Blood Bank" ? "Blood Bank Name" : "Lab Name"
                }</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your name" />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4 text-rose-600" /> Email
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                  placeholder="you@example.com" />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="h-4 w-4 text-rose-600" /> Phone Number
                </label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter phone number" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                    onChange={handleInputChange} required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">Minimum 6 characters</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {formData.role === "User" && (
                <>
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <User className="h-5 w-5 text-rose-600" />
                    <h4 className="text-lg font-semibold text-slate-900">Personal Details</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500">
                      <option value="">Blood Group</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500">
                      <option value="">Gender</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500" />
                </>
              )}

              {(formData.role === "Blood Bank" || formData.role === "Test Lab") && (
                <>
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Building2 className="h-5 w-5 text-rose-600" />
                    <h4 className="text-lg font-semibold text-slate-900">Organization Details</h4>
                  </div>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} required
                    placeholder="Owner Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500" />
                  {formData.role === "Blood Bank" && (
                    <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} required
                      placeholder="Hospital Name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500" />
                  )}
                </>
              )}

              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <MapPin className="h-5 w-5 text-rose-600" />
                <h4 className="text-lg font-semibold text-slate-900">Location</h4>
              </div>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} required
                placeholder="Full Address"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500" />
                <input type="text" name="zipcode" value={formData.zipcode} onChange={handleInputChange} required
                  placeholder="Zipcode"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <button type="submit" disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white font-medium shadow hover:bg-rose-700 transition disabled:bg-rose-400">
              {loading ? "Creating..." : "Create Account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-rose-600 hover:text-rose-700">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
