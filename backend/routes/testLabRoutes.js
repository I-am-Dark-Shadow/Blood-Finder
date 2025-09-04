import express from 'express';
import { protect, isTestLab } from '../middleware/authMiddleware.js';
import {
    getTestLabStats,
    addAvailableTest,
    getAvailableTests,
    updateAvailableTest,
    deleteAvailableTest,
    getTestRequests,
    updateTestRequestStatus,
    getProcessableRequests
} from '../controllers/testLabController.js';

const router = express.Router();

// All routes are protected and require Test Lab role
router.use(protect, isTestLab);

router.get('/stats', getTestLabStats);

router.route('/tests')
    .post(addAvailableTest)
    .get(getAvailableTests);

router.route('/tests/:id')
    .put(updateAvailableTest)
    .delete(deleteAvailableTest);

router.get('/requests', getTestRequests);
router.put('/requests/:id/status', updateTestRequestStatus);
router.get('/requests/processable', getProcessableRequests);

export default router;