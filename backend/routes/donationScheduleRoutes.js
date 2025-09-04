import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createDonationSchedule,
    getMyDonationSchedules,
    cancelDonationSchedule
} from '../controllers/donationScheduleController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .post(createDonationSchedule);

router.get('/my-schedules', getMyDonationSchedules);

router.delete('/:id', cancelDonationSchedule);

export default router;