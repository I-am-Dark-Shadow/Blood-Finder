import express from 'express';
import { protect, isTestLab, isBloodBank } from '../middleware/authMiddleware.js';
import { 
    fetchPatientRecords, 
    exportPatientRecords, 
    getBloodBankReportData,
    downloadReport
} from '../controllers/reportController.js';

const router = express.Router();

// Test Lab specific routes
router.get('/patient-records', protect, isTestLab, fetchPatientRecords);
router.get('/export-patient-records', protect, isTestLab, exportPatientRecords);

// Blood Bank specific route
router.get('/blood-bank', protect, isBloodBank, getBloodBankReportData);

// Route for downloading a single report (accessible by patient and lab)
router.get('/download-report/:requestId', protect, downloadReport);

export default router;