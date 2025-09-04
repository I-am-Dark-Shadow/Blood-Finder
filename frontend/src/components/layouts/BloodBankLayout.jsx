import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useBloodBankStore from '../../store/useBloodBankStore';
import toast from 'react-hot-toast';
import { LayoutDashboard, Package, Users, AlertCircle, BarChart3, Bell, Settings, Menu, X, ChevronDown, Building2, RefreshCw } from 'lucide-react';

const SidebarLink = ({ to, icon, text, badge }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(`/blood-bank/${to}`);
  return (
    <Link
      to={to}
      className={`sidebar-item group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${isActive ? 'bg-red-50 text-red-600 font-semibold border-r-4 border-red-600' : 'text-gray-700'
        }`}
    >
      {icon}
      {text}
      {badge > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">{badge}</span>}
    </Link>
  );
};

const BloodBankLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // 1. NEW STATE FOR THE CLOCK
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const { activeRequestCount, unreadNotificationCount, fetchSidebarCounts } = useBloodBankStore();

  // UseEffect for real-time polling of sidebar counts
  useEffect(() => {
    fetchSidebarCounts(); // Fetch immediately on load
    const intervalId = setInterval(fetchSidebarCounts, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId); // Cleanup
  }, [fetchSidebarCounts]);


  // 2. NEW useEffect FOR REAL-TIME CLOCK
  useEffect(() => {
    const timerId = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timerId); // Cleanup on component unmount
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const getPageTitle = (path) => {
    const page = path.split('/').pop();
    const titles = { dashboard: 'Dashboard', stock: 'Manage Blood Stock', donors: 'Donor Records', requests: 'Blood Requests', reports: 'Reports & Analytics', notifications: 'Notifications', settings: 'Settings' };
    return titles[page] || 'Dashboard';
  };

  // 3. NEW HELPER FUNCTION TO FORMAT DATE AND TIME
  const formatDateTime = (date) => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    return { formattedDate, formattedTime };
  };

  const { formattedDate, formattedTime } = formatDateTime(currentDateTime);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/" className="flex items-center gap-2"><div className="text-2xl font-bold text-red-600">BF</div><span className="text-lg font-semibold">Blood Finder</span></Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>
        <nav className="mt-8 px-3 space-y-1">
          <SidebarLink to="dashboard" icon={<LayoutDashboard size={20} className="mr-3" />} text="Dashboard" />
          <SidebarLink to="stock" icon={<Package size={20} className="mr-3" />} text="Manage Blood Stock" />
          <SidebarLink to="donors" icon={<Users size={20} className="mr-3" />} text="Donor Records" />
          {/* UPDATED: Using dynamic activeRequestCount */}
          <SidebarLink to="requests" icon={<AlertCircle size={20} className="mr-3" />} text="Requests" badge={activeRequestCount} />
          <SidebarLink to="reports" icon={<BarChart3 size={20} className="mr-3" />} text="Reports" />
          {/* UPDATED: Using dynamic unreadNotificationCount */}
          <SidebarLink to="notifications" icon={<Bell size={20} className="mr-3" />} text="Notifications" badge={unreadNotificationCount} />
          <SidebarLink to="settings" icon={<Settings size={20} className="mr-3" />} text="Settings" />
        </nav>
        <div className="absolute bottom-0 w-full p-6 border-t">
          <div className="flex items-center">
            <img className="w-10 h-10 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name}&background=fee2e2&color=dc2626`} alt="User" />
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">Blood Bank Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}><Menu /></button>
              <h1 className="text-xl font-semibold">{getPageTitle(location.pathname)}</h1>
              {/* 4. JSX TO DISPLAY THE CLOCK */}
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 border-l pl-4">
                <span>{formattedDate}</span>
                <span>{formattedTime}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 hover:text-green-600 transition-colors duration-200"
                title="Refresh Page"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                <img className="w-8 h-8 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name}&background=fee2e2&color=dc2626`} alt="User" />
                <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
                  <Link to="/blood-bank/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BloodBankLayout;