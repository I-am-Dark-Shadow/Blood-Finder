import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { searchDonors, searchBloodBanks, searchTestLabs, publicSearchDonors } from '../controllers/searchController.js';

const router = express.Router();

router.get('/public/donors', publicSearchDonors);

router.use(protect);

router.get('/donors', searchDonors);
router.get('/blood-banks', searchBloodBanks);
router.get('/test-labs', searchTestLabs); // New route

export default router;