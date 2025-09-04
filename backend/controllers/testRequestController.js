import TestRequest from '../models/testRequestModel.js';
import Notification from '../models/notificationModel.js'; // Import Notification model

// 1. Create a new Test Request
export const createTestRequest = async (req, res) => {
    const { testLabId, patientName, tests } = req.body;
    try {
        if (!tests || !Array.isArray(tests) || tests.length === 0) {
            return res.status(400).json({ message: "At least one test is required." });
        }

        const newRequest = new TestRequest({
            patient: req.user._id,
            testLab: testLabId,
            patientName,
            tests: Array.isArray(tests) ? tests : [tests], // Ensure tests is an array
            prescriptionUrl: req.file ? req.file.path : null
        });

        await newRequest.save();

        // --- NEW: Create a notification for the Test Lab ---
        await Notification.create({
            user: testLabId, // The recipient of the notification is the test lab
            message: `New test request received from patient: ${patientName}`,
            link: `/test-lab/requests` // Link to the requests page in their dashboard
        });
        // --------------------------------------------------

        res.status(201).json({ message: "Test request submitted successfully!", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. Get all test requests for the logged-in user
export const getMyTestRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const requests = await TestRequest.find({ patient: req.user._id })
            .populate('testLab', 'name city')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalRequests = await TestRequest.countDocuments({ patient: req.user._id });

        res.json({
            requests,
            currentPage: page,
            totalPages: Math.ceil(totalRequests / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};