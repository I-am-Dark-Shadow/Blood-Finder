import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  return `${Math.floor(seconds)} seconds ago`;
};

const NotificationItem = ({ notification }) => (
  <div
    className={`rounded-xl p-4 flex items-start justify-between transition border shadow-sm
      ${
        notification.isRead
          ? 'bg-white border-gray-200'
          : 'bg-gradient-to-r from-red-50 to-white border-red-200'
      }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`p-2 rounded-full ${
          notification.isRead ? 'bg-gray-100' : 'bg-red-100'
        }`}
      >
        <Bell
          className={`w-5 h-5 ${
            notification.isRead ? 'text-gray-600' : 'text-red-600'
          }`}
        />
      </div>
      <div>
        <p className="text-sm text-gray-800 font-medium">
          {notification.message}
        </p>
        <span className="text-xs text-gray-500">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>
    </div>
    {!notification.isRead && (
      <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></span>
    )}
  </div>
);

const TestLabNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const { markAllAsRead } = useNotificationStore();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/notifications', { params: filters });
        setNotifications(data.notifications);
        if (data.unreadCount > 0) {
          markAllAsRead();
        }
      } catch (error) {
        toast.error('Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [filters, markAllAsRead]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-5 py-3 rounded-xl shadow">
        <h2 className="text-xl font-bold">🔔 Notifications</h2>
        <div className="flex items-center gap-2">
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="px-3 py-2 rounded-lg text-gray-800 border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="px-3 py-2 rounded-lg text-gray-800 border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-600">Loading notifications...</p>
        ) : notifications.length > 0 ? (
          notifications.map((note) => (
            <NotificationItem key={note._id} notification={note} />
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No notifications for this period
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try selecting a different month or year.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestLabNotifications;
