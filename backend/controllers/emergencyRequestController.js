import EmergencyRequest from '../models/emergencyRequestModel.js';
import Notification from '../models/notificationModel.js'; // Import if not already there
import User from '../models/userModel.js';
import BloodStock from '../models/bloodStockModel.js'; // BloodStock import korun
import Donation from '../models/donationModel.js';

// Helper function to parse strings like "1 hour", "30 minutes" into milliseconds
const calculateExpiryDate = (timeString) => {
    // We assume the number is always in hours as per the current requirement.
    const hours = parseInt(timeString, 10);
    if (isNaN(hours)) {
        // If the string is invalid, default to a 24-hour expiry to prevent errors.
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    // Calculate the future time in milliseconds and create a new Date object.
    return new Date(Date.now() + hours * 60 * 60 * 1000);
};


// 1. Create a new Emergency Request (UPDATED to set expireAt)
export const createEmergencyRequest = async (req, res) => {
    try {
        const requestData = { ...req.body, createdBy: req.user._id };


        // Calculate the expiry time
        if (requestData.timeNeeded) {
            requestData.expireAt = calculateExpiryDate(requestData.timeNeeded);
        }

        const newRequest = new EmergencyRequest(requestData);
        await newRequest.save();

        await createEmergencyNotification(newRequest);

        const populatedRequest = await EmergencyRequest.findById(newRequest._id).populate('createdBy', 'name email phone address city zipcode');

        res.status(201).json({ message: "Emergency request created successfully!", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. Get all ACTIVE requests relevant to the user's location
export const getEmergencyRequestsByLocation = async (req, res) => {
    try {
        const bloodBank = req.user;
        if (!bloodBank.city && !bloodBank.zipcode) {
            return res.json([]);
        }

        // Step 1: Find all active requests in the blood bank's area
        const allLocalRequests = await EmergencyRequest.find({
            status: 'Active',
            $or: [{ city: bloodBank.city }, { zipcode: bloodBank.zipcode }],
        }).populate('createdBy', 'name email phone address city zipcode');

        // Step 2: Get the blood bank's current stock levels
        const bankStock = await BloodStock.aggregate([
            { $match: { bloodBank: bloodBank._id } },
            { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$quantity' } } }
        ]);
        const stockMap = bankStock.reduce((acc, item) => {
            acc[item._id] = item.totalUnits;
            return acc;
        }, {});

        // Step 3: Filter the requests based on the bank's stock
        const filteredRequests = allLocalRequests.filter(request => {
            const requiredBloodGroup = request.bloodGroup;
            const requiredUnits = request.unitsRequired;
            const availableUnits = stockMap[requiredBloodGroup] || 0;

            // Only show the request if the bank has enough stock
            return availableUnits >= requiredUnits;
        });

        res.json(filteredRequests);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// 3. Get only the requests created by the logged-in user
export const getMyEmergencyRequests = async (req, res) => {
    try {
        const myRequests = await EmergencyRequest.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });
        res.json(myRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// 4. Update an Emergency Request
export const updateEmergencyRequest = async (req, res) => {
    try {
        const request = await EmergencyRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }
        // Ensure the user updating the request is the one who created it
        if (request.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this request." });
        }

        const updatedRequest = await EmergencyRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Request updated successfully!", request: updatedRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 5. Delete an Emergency Request
export const deleteEmergencyRequest = async (req, res) => {
    try {
        const request = await EmergencyRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }
        if (request.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this request." });
        }

        await request.deleteOne();
        res.json({ message: "Request deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const createEmergencyNotification = async (request) => {
    try {
        // Find users AND blood banks in the same city or zipcode
        const relevantRecipients = await User.find({
            role: { $in: ['User', 'Blood Bank'] }, // Find both roles
            $or: [{ city: request.city }, { zipcode: request.zipcode }],
            _id: { $ne: request.createdBy }
        }).select('_id');

        if (relevantRecipients.length === 0) return;

        const recipientIds = relevantRecipients.map(user => user._id);

        const notificationMessage = `New '${request.urgency}' request for ${request.bloodGroup} blood in your area (${request.city}).`;

        const notifications = recipientIds.map(userId => ({
            user: userId,
            message: notificationMessage,
            link: `/user/emergency`
        }));

        await Notification.insertMany(notifications);
        console.log(`Sent emergency notifications to ${recipientIds.length} recipients.`);

    } catch (error) {
        console.error("Error creating emergency notifications:", error);
    }
};

export const fulfillEmergencyRequest = async (req, res) => {
    try {
        const request = await EmergencyRequest.findById(req.params.id);
        const bloodBank = req.user;

        if (!request) return res.status(404).json({ message: "Request not found." });
        if (request.status !== 'Active') return res.status(400).json({ message: "This request is no longer active." });

        const requiredUnits = request.unitsRequired;

        // Final check to ensure stock is still sufficient before deducting
        const stockItems = await BloodStock.find({ bloodBank: bloodBank._id, bloodGroup: request.bloodGroup }).sort({ expiryDate: 1 });
        const totalAvailable = stockItems.reduce((sum, item) => sum + item.quantity, 0);

        if (totalAvailable < requiredUnits) {
            return res.status(400).json({ message: "Insufficient stock to fulfill this request." });
        }

        // --- Stock Deduction Logic ---
        let unitsToDeduct = requiredUnits;
        for (const stockItem of stockItems) {
            if (unitsToDeduct <= 0) break;

            if (stockItem.quantity >= unitsToDeduct) {
                stockItem.quantity -= unitsToDeduct;
                unitsToDeduct = 0;
                await stockItem.save();
            } else {
                unitsToDeduct -= stockItem.quantity;
                stockItem.quantity = 0;
                await stockItem.deleteOne(); // Remove empty stock item
            }
        }
        // -----------------------------

        // Mark request as fulfilled
        request.status = 'Fulfilled';
        request.fulfilledBy = bloodBank._id;
        await request.save();

        // Create a record of this "donation" for reporting
        await Donation.create({
            donor: request.createdBy, // The original requester
            bloodBank: bloodBank._id,
            bloodGroup: request.bloodGroup,
            quantity: request.unitsRequired,
            donationDate: new Date()
        });

        res.json({ message: "Request marked as fulfilled and stock updated!", request });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

