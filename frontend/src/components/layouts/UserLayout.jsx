import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import toast from 'react-hot-toast';
import { LayoutDashboard, User as UserIcon, Search, Heart, AlertCircle, Bell, Settings, Menu, X, ChevronDown, Microscope, ListChecks, RefreshCw } from 'lucide-react';

const SidebarLink = ({ to, icon, text, badge }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(`/user/${to}`);
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

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // --- THIS IS THE KEY FIX ---
  // We now select the user state specifically. This tells the component
  // to re-render ONLY when the 'user' object itself changes.
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => { fetchNotifications(); }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles = {
      dashboard: 'Dashboard', profile: 'My Profile', search: 'Search Blood',
      donate: 'Donate Blood', emergency: 'Emergency Requests', notifications: 'Notifications',
      settings: 'Settings', 'test-labs': 'Nearby Test Labs', 'my-test-requests': 'My Test Requests'
    };
    return titles[path] || 'Dashboard';
  };

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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold tracking-tight text-red-600">BF</div>
            <span className="ml-2 text-lg font-semibold text-gray-900">Blood Finder</span>
          </Link>
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
        </div>
        <nav className="mt-8">
          <div className="space-y-1 px-3">
            <SidebarLink to="dashboard" icon={<LayoutDashboard className="mr-3 w-5 h-5" />} text="Dashboard" />
            <SidebarLink to="search" icon={<Search className="mr-3 w-5 h-5" />} text="Search Blood" />
            <SidebarLink to="donate" icon={<Heart className="mr-3 w-5 h-5" />} text="Donate Blood" />
            <SidebarLink to="emergency" icon={<AlertCircle className="mr-3 w-5 h-5" />} text="Emergency Requests" badge={unreadCount} />

            <div className="pt-4 mt-4 border-t">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lab Services</p>
              <SidebarLink to="test-labs" icon={<Microscope className="mr-3 w-5 h-5" />} text="Nearby Test Labs" />
              <SidebarLink to="my-test-requests" icon={<ListChecks className="mr-3 w-5 h-5" />} text="My Test Requests" />
            </div>

            <div className="pt-4 mt-4 border-t">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</p>
              <SidebarLink to="notifications" icon={<Bell className="mr-3 w-5 h-5" />} text="Notifications" badge={unreadCount} />
              <SidebarLink to="profile" icon={<UserIcon className="mr-3 w-5 h-5" />} text="My Profile" />
              <SidebarLink to="settings" icon={<Settings className="mr-3 w-5 h-5" />} text="Settings" />
            </div>
          </div>
        </nav>
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
          <div className="flex items-center">
            <img className="w-10 h-10 rounded-full object-cover" src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=fee2e2&color=dc2626`} alt="User" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">Blood Type: {user?.bloodGroup || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
              <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
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

            <div className="flex items-center space-x-4">
              <Link to="/user/notifications" className="text-gray-400 hover:text-red-600 transition-colors duration-200 relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
              </Link>
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <img className="w-8 h-8 rounded-full object-cover" src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=fee2e2&color=dc2626`} alt="User" />
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="py-1">
                      <Link to="/user/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                      <Link to="/user/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                      <div className="border-t border-gray-100"></div>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default UserLayout;