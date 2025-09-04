import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadPrescription } from '../config/cloudinary.js';
import { createTestRequest, getMyTestRequests } from '../controllers/testRequestController.js';
import { downloadBill } from '../controllers/billingController.js';

const router = express.Router();
router.use(protect);

router.post('/', uploadPrescription.single('prescription'), createTestRequest);
router.get('/my-requests', getMyTestRequests);

router.get('/download-bill/:requestId', downloadBill);

export default router;