import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { // The user who will receive this notification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Optional link to navigate to, e.g., /user/emergency/requestId
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;