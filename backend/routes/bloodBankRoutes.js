import express from 'express';
import { protect, isBloodBank } from '../middleware/authMiddleware.js';
import {
    getDashboardStats,
    addBloodStock,
    getBloodStock,
    deleteBloodStock,
    getAllDonors,
    findBanksByLocationAndBloodGroup, // Import the new function
    getMyStock 
} from '../controllers/bloodBankController.js';

const router = express.Router();

// Publicly accessible route for finding banks
router.get('/find', protect, findBanksByLocationAndBloodGroup);

// All routes below are protected and require a 'Blood Bank' role
router.use(protect, isBloodBank);

router.get('/stats', getDashboardStats);

router.get('/my-stock', getMyStock);

router.route('/stock')
    .post(addBloodStock)
    .get(getBloodStock);

router.delete('/stock/:id', deleteBloodStock);

router.get('/donors', getAllDonors);

export default router;