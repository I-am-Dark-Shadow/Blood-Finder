import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyNotifications, markNotificationsAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getMyNotifications);
router.put('/read', markNotificationsAsRead);

export default router;