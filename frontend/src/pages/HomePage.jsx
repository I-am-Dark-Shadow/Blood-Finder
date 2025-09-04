import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Droplet, UserPlus, Building2, Search, ArrowRight, ShieldCheck, LifeBuoy, Ambulance, Stethoscope, FlaskConical } from 'lucide-react';
import useAuthStore from '../store/authStore';
import BloodAnimation from '../components/BloodAnimation'; // Animation component import korun

const HomePage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState({ bloodGroup: '', location: '' });

  const handleSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/search-donors', { state: search });
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "User": return "/user/dashboard";
      case "Blood Bank": return "/blood-bank/dashboard";
      case "Test Lab": return "/test-lab/dashboard";
      default: return "/login";
    }
  };

  return (
    <div className="font-inter text-slate-900 antialiased selection:bg-rose-100 selection:text-rose-700">
      <BloodAnimation />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-md bg-rose-600 text-white grid place-items-center shadow-sm">
                  <span className="text-sm font-semibold tracking-tight">BF</span>
                </div>
                <span className="text-slate-800 text-base font-medium tracking-tight group-hover:text-rose-700 transition">Blood Finder</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <a href="#services" className="hidden md:block nav-link text-slate-600 hover:text-rose-700 transition font-medium">Services</a>
                <a href="#about" className="hidden md:block nav-link text-slate-600 hover:text-rose-700 transition font-medium">About</a>
                {isAuthenticated ? (
                  <Link to={getDashboardPath()} className="inline-flex items-center gap-2 rounded-md bg-rose-600 text-white px-3.5 py-2 font-medium hover:bg-rose-700 transition shadow-sm">
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/login" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-slate-700 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 transition shadow-sm">
                    <span className="font-medium">Login</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section id="home" className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-24">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 text-xs font-medium">
                    <Heart className="h-3.5 w-3.5" />
                    Donate blood, save lives
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500">
                    A trusted hub for blood donors, recipients, and banks
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">Connect instantly with nearby donors and blood banks. Manage requests, availability, and donations with a clean, unified experience.</p>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-3 gap-3">
                      <select
                        name="bloodGroup"
                        value={search.bloodGroup}
                        onChange={handleSearchChange}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                      >
                        <option value="">Select Blood Group</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                      <input
                        type="text"
                        name="location"
                        value={search.location}
                        onChange={handleSearchChange}
                        placeholder="City or Zipcode"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                      <button type="submit" className="group w-full inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-rose-700 transition">
                        <Search className="h-4 w-4" />Search
                      </button>
                    </form>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative rounded-xl border border-slate-200 bg-white/70 backdrop-blur p-5 shadow-sm">
                    <img alt="A doctor holding a blood bag" src="https://images.unsplash.com/photo-1615461066159-fea0960485d5?q=80&w=2070" className="rounded-lg object-cover w-full h-[360px]" />
                    <div className="absolute top-4 right-4 rounded-md bg-white/90 shadow-sm ring-1 ring-slate-200 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-rose-600" />Secure & Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-16 bg-slate-50 border-y border-slate-200 ">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-semibold tracking-tight">Our Core Services</h2>
                <p className="text-slate-600 mt-2">Everything you need in one platform</p>
              </div>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-xl bg-white p-6 text-center shadow-sm border border-slate-200">
                  <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center"><Droplet className="h-6 w-6 text-rose-600" /></div>
                  <h3 className="mt-4 text-lg font-medium">Blood Finder</h3>
                  <p className="mt-1 text-sm text-slate-500">Quickly search for blood donors and banks near you.</p>
                </div>
                <div className="rounded-xl bg-white p-6 text-center shadow-sm border border-slate-200">
                  <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center"><Ambulance className="h-6 w-6 text-rose-600" /></div>
                  <h3 className="mt-4 text-lg font-medium">Emergency Requests</h3>
                  <p className="mt-1 text-sm text-slate-500">Post urgent requests and notify all nearby members.</p>
                </div>
                <div className="rounded-xl bg-white p-6 text-center shadow-sm border border-slate-200">
                  <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center"><Stethoscope className="h-6 w-6 text-rose-600" /></div>
                  <h3 className="mt-4 text-lg font-medium">Lab Services</h3>
                  <p className="mt-1 text-sm text-slate-500">Connect with test labs for essential check-ups.</p>
                </div>
                <div className="rounded-xl bg-white p-6 text-center shadow-sm border border-slate-200">
                  <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center"><LifeBuoy className="h-6 w-6 text-rose-600" /></div>
                  <h3 className="mt-4 text-lg font-medium">Become a Hero</h3>
                  <p className="mt-1 text-sm text-slate-500">Register as a donor and save precious lives.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Join Us Section */}
          <section id="about" className="py-20 bg-transparent relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-semibold tracking-tight">Join Our Community</h2>
                <p className="text-slate-600 mt-2">Register with the role that fits you best.</p>
              </div>
              <div className="mt-10 grid lg:grid-cols-3 gap-6 text-center">
                <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                  <UserPlus className="h-8 w-8 mx-auto text-rose-600" />
                  <h3 className="mt-4 text-lg font-medium">Register as a User/Donor</h3>
                  <p className="mt-1 text-sm text-slate-500">Become a part of our network to find blood or save lives by donating.</p>
                  <Link to="/register" state={{ role: 'User' }} className="mt-4 inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-800">Get Started <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </div>
                <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                  <Building2 className="h-8 w-8 mx-auto text-rose-600" />
                  <h3 className="mt-4 text-lg font-medium">Register as a Blood Bank</h3>
                  <p className="mt-1 text-sm text-slate-500">Manage your stock, find donors, and fulfill emergency requests efficiently.</p>
                  <Link to="/register" state={{ role: 'Blood Bank' }} className="mt-4 inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-800">Register Now <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </div>
                <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                  <FlaskConical className="h-8 w-8 mx-auto text-rose-600" />
                  <h3 className="mt-4 text-lg font-medium">Register as a Test Lab</h3>
                  <p className="mt-1 text-sm text-slate-500">Offer your lab services to our community of users and blood banks.</p>
                  <Link to="/register" state={{ role: 'Test Lab' }} className="mt-4 inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-800">Join the Network <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center">
              <Link to="/" className="inline-flex items-center gap-2 group mb-2">
                <div className="h-8 w-8 rounded-md bg-rose-600 text-white grid place-items-center shadow-sm">
                  <span className="text-sm font-semibold tracking-tight">BF</span>
                </div>
                <span className="text-slate-800 text-base font-medium tracking-tight group-hover:text-rose-700 transition">Blood Finder</span>
              </Link>
              <p className="text-sm text-slate-600">A platform to connect lifesavers.</p>
            </div>
            <div className="mt-8 border-t border-slate-200 pt-6 flex items-center justify-center text-xs text-slate-500">
              <span>© {new Date().getFullYear()} Blood Finder. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;

