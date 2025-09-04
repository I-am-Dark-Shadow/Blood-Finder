import Test from '../models/testModel.js';
import TestRequest from '../models/testRequestModel.js';

// Get Dashboard Stats (Placeholder)
export const getTestLabStats = async (req, res) => {
    try {
        const testsCompleted = await TestRequest.countDocuments({ testLab: req.user._id, status: 'Completed' });
        const pendingRequests = await TestRequest.countDocuments({ testLab: req.user._id, status: 'Pending' });
        const totalTestsOffered = await Test.countDocuments({ testLab: req.user._id });

        res.json({ testsCompleted, pendingRequests, totalTestsOffered });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Available Tests CRUD
export const addAvailableTest = async (req, res) => {
    const { testName, category, price, duration, description } = req.body;
    try {
        const newTest = new Test({
            testLab: req.user._id,
            testName, category, price, duration, description
        });
        const savedTest = await newTest.save();
        res.status(201).json(savedTest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getAvailableTests = async (req, res) => {
    try {
        const tests = await Test.find({ testLab: req.user._id }).sort({ createdAt: -1 });
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateAvailableTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test || test.testLab.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Test not found or not authorized' });
        }
        
        const updatedTest = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const deleteAvailableTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test || test.testLab.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Test not found or not authorized' });
        }
        await test.deleteOne();
        res.json({ message: 'Test removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Manage Test Requests
export const getTestRequests = async (req, res) => {
    try {
        const requests = await TestRequest.find({ testLab: req.user._id })
            .populate('patient', 'name email address dateOfBirth gender phone')
            // The line below was causing the crash and has been removed:
            // .populate('test', 'testName') 
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateTestRequestStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const request = await TestRequest.findById(req.params.id);
        if (!request || request.testLab.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Request not found or not authorized' });
        }

        request.status = status;
        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// NEW FUNCTION: Get requests that are 'Approved' and ready for processing
export const getProcessableRequests = async (req, res) => {
    try {
        const requests = await TestRequest.find({
            testLab: req.user._id,
            status: 'Approved' // Fetch only approved requests
        })
        .populate('patient', 'name email')
        .sort({ updatedAt: -1 }); // Show most recently approved first
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};