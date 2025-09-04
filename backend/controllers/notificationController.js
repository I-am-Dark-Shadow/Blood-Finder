import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// This is an internal function, not an API endpoint.
// It will be called when an emergency request is created.
export const createEmergencyNotification = async (request) => {
    try {
        // Find users in the same city or zipcode
        const relevantUsers = await User.find({
            role: 'User',
            $or: [{ city: request.city }, { zipcode: request.zipcode }],
            _id: { $ne: request.createdBy } // Don't notify the creator
        }).select('_id');

        if (relevantUsers.length === 0) return;

        const userIds = relevantUsers.map(user => user._id);

        const notificationMessage = `New '${request.urgency}' request for ${request.bloodGroup} blood in your area (${request.city}).`;
        
        const notifications = userIds.map(userId => ({
            user: userId,
            message: notificationMessage,
            link: `/user/emergency` // Link to the emergency page
        }));

        await Notification.insertMany(notifications);
        console.log(`Sent notifications to ${userIds.length} users.`);

    } catch (error) {
        console.error("Error creating emergency notifications:", error);
    }
};

// --- API Endpoints ---

// Get notifications for the logged-in user
export const getMyNotifications = async (req, res) => {
    try {
        const { year, month } = req.query;
        const query = { user: req.user._id };

        // If year and month are provided, add a date range to the query
        if (year && month) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59); // Last day of the month
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(100); // Limit to 100 results for performance
            
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Mark notifications as read
export const markNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "Notifications marked as read." });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};