import { create } from 'zustand';
import api from '../api/axios';
import toast from 'react-hot-toast';

const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/notifications');
            set({ notifications: data.notifications, unreadCount: data.unreadCount, loading: false });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            // Don't show a toast here to avoid annoying users on every load
            set({ loading: false });
        }
    },

    markAllAsRead: async () => {
        try {
            await api.put('/notifications/read');
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
            toast.success("Notifications marked as read.");
        } catch (error) {
            toast.error("Failed to mark notifications as read.");
        }
    }
}));

export default useNotificationStore;