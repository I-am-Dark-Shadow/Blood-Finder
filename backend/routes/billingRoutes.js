import express from 'express';
import { protect, isTestLab } from '../middleware/authMiddleware.js';
import { uploadToMemory } from '../config/cloudinary.js';
import { getPatientsForBilling, generateBill, downloadBill } from '../controllers/billingController.js';

const router = express.Router();

// Routes for Test Labs
router.get('/patients-for-billing', protect, isTestLab, getPatientsForBilling);
router.post('/generate-bill/:requestId', protect, isTestLab, uploadToMemory.single('report'), generateBill);

// Route for downloading bills (accessible by both patient and lab)
router.get('/download-bill/:requestId', protect, downloadBill);

export default router;