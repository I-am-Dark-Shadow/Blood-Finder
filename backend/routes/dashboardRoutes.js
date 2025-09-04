import express from 'express';
import { protect, isTestLab } from '../middleware/authMiddleware.js';
import { getUserDashboardData, getTestLabDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

// User dashboard route
router.get('/user', protect, getUserDashboardData);

// Test Lab dashboard route (protected for Test Labs)
router.get('/test-lab', protect, isTestLab, getTestLabDashboardData);

export default router;