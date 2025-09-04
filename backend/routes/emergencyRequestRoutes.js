import express from 'express';
import { protect, isBloodBank  } from '../middleware/authMiddleware.js';
import {
    createEmergencyRequest,
    getEmergencyRequestsByLocation,
    getMyEmergencyRequests,
    updateEmergencyRequest,
    deleteEmergencyRequest,
    fulfillEmergencyRequest 
} from '../controllers/emergencyRequestController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .post(createEmergencyRequest)
    .get(getEmergencyRequestsByLocation); // Gets requests for user's location

router.get('/my-requests', getMyEmergencyRequests); // Gets requests created by the user

router.route('/:id')
    .put(updateEmergencyRequest)
    .delete(deleteEmergencyRequest);

router.put('/:id/fulfill', isBloodBank, fulfillEmergencyRequest);

export default router;