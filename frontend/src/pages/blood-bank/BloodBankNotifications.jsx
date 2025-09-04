import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Bell, AlertTriangle } from "lucide-react";
import useNotificationStore from "../../store/notificationStore";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  return `A few seconds ago`;
};

const NotificationItem = ({ notification }) => {
  const isLowStock = notification.message.toLowerCase().includes("stock");
  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl border shadow-sm transition 
      ${
        notification.isRead
          ? "bg-gray-50 border-gray-200"
          : isLowStock
          ? "bg-yellow-50 border-yellow-300"
          : "bg-red-50 border-red-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-full ${
            isLowStock ? "bg-yellow-100" : "bg-red-100"
          }`}
        >
          {isLowStock ? (
            <Bell className="w-5 h-5 text-yellow-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div>
          <h4
            className={`font-semibold text-sm ${
              isLowStock ? "text-yellow-800" : "text-red-800"
            }`}
          >
            {isLowStock ? "Low Stock Alert" : "Emergency Request"}
          </h4>
          <p className="text-sm text-gray-700">{notification.message}</p>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
      </div>
      {!notification.isRead && (
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2 ${
            isLowStock ? "bg-yellow-500" : "bg-red-500"
          }`}
        ></span>
      )}
    </div>
  );
};

const BloodBankNotifications = () => {
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
        const { data } = await api.get("/notifications", { params: filters });
        setNotifications(data.notifications);
        if (data.unreadCount > 0) {
          markAllAsRead();
        }
      } catch (error) {
        toast.error("Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [filters, markAllAsRead]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <div className="flex gap-2">
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
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
            className="px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-600">Loading notifications...</p>
        ) : notifications.length > 0 ? (
          notifications.map((note) => (
            <NotificationItem key={note._id} notification={note} />
          ))
        ) : (
          <div className="text-center py-10 bg-white border rounded-xl">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No notifications for this period
            </h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodBankNotifications;
