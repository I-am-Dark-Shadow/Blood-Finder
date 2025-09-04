import React from 'react';
import useNotificationStore from '../../store/notificationStore';
import { Bell, Check } from 'lucide-react';

// Helper function to format time
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

const NotificationItem = ({ notification }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm border-l-4 ${notification.isRead ? 'border-gray-300' : 'border-red-500'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`rounded-full p-2 mr-3 ${notification.isRead ? 'bg-gray-100' : 'bg-red-100'}`}>
            <Bell className={`w-4 h-4 ${notification.isRead ? 'text-gray-600' : 'text-red-600'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">New Alert in Your Area</h4>
            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
            <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
          </div>
        </div>
        {!notification.isRead && <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>}
      </div>
    </div>
  );
};

const UserNotifications = () => {
    const { notifications, unreadCount, markAllAsRead, loading } = useNotificationStore();

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
                    <p className="text-gray-600">Stay updated with important blood donation alerts.</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 flex items-center gap-2">
                        <Check size={16}/> Mark all as read
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {loading && <p>Loading notifications...</p>}
                {!loading && notifications.length === 0 && (
                    <div className="text-center py-10 bg-white border rounded-lg">
                        <Bell className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications yet</h3>
                        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                    </div>
                )}
                {!loading && notifications.map(note => (
                    <NotificationItem key={note._id} notification={note} />
                ))}
            </div>
        </div>
    );
};

export default UserNotifications;