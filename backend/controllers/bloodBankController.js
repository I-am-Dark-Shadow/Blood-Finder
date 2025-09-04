import BloodStock from '../models/bloodStockModel.js';
import User from '../models/userModel.js';
import EmergencyRequest from '../models/emergencyRequestModel.js';
import Donation from '../models/donationModel.js';
import Notification from '../models/notificationModel.js'; // <-- THIS LINE IS THE FIX

const LOW_STOCK_THRESHOLD = 10;

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const bloodBank = req.user;
        const stockLevelsRaw = await BloodStock.aggregate([
            { $match: { bloodBank: bloodBank._id } },
            { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$quantity' } } }
        ]);
        const stockLevels = stockLevelsRaw.reduce((acc, item) => {
            acc[item._id] = item.totalUnits;
            return acc;
        }, {});
        const totalDonors = await User.countDocuments({ role: 'User', $or: [{ city: bloodBank.city }, { zipcode: bloodBank.zipcode }] });
        const activeRequests = await EmergencyRequest.countDocuments({ status: 'Active', $or: [{ city: bloodBank.city }, { zipcode: bloodBank.zipcode }] });
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
        const monthDonationsResult = await Donation.aggregate([
            { $match: { bloodBank: bloodBank._id, donationDate: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$quantity" } } }
        ]);
        const monthDonations = monthDonationsResult[0]?.total || 0;
        res.json({ stockLevels, totalDonors, activeRequests, monthDonations });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Manage Blood Stock
export const addBloodStock = async (req, res) => {
    const { bloodGroup, quantity, expiryDate } = req.body;
    try {
        const newStock = new BloodStock({ bloodBank: req.user._id, bloodGroup, quantity, expiryDate });
        const savedStock = await newStock.save();
        const allStockForGroup = await BloodStock.find({ bloodBank: req.user._id, bloodGroup });
        const totalUnits = allStockForGroup.reduce((sum, item) => sum + item.quantity, 0);
        if (totalUnits <= LOW_STOCK_THRESHOLD) {
            await Notification.create({
                user: req.user._id,
                message: `Warning: Stock for ${bloodGroup} is critically low (${totalUnits} units remaining).`,
                link: '/blood-bank/stock'
            });
        }
        res.status(201).json(savedStock);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getBloodStock = async (req, res) => {
    try {
        const stock = await BloodStock.find({ bloodBank: req.user._id }).sort({ createdAt: -1 });
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const deleteBloodStock = async (req, res) => {
    try {
        const stock = await BloodStock.findById(req.params.id);
        if (!stock || stock.bloodBank.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Stock not found or not authorized' });
        }
        await stock.deleteOne();
        res.json({ message: 'Stock removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Donor Records
export const getAllDonors = async (req, res) => {
    const { page = 1 } = req.query;
    const limit = 15;
    const skip = (page - 1) * limit;
    try {
        const bloodBank = req.user;
        const query = { role: 'User', $or: [{ city: bloodBank.city }, { zipcode: bloodBank.zipcode }] };
        const donors = await User.find(query).select('name bloodGroup email phone city zipcode isActive').sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalDonors = await User.countDocuments(query);
        res.json({ donors, currentPage: Number(page), totalPages: Math.ceil(totalDonors / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Find Banks
export const findBanksByLocationAndBloodGroup = async (req, res) => {
    const { city, bloodGroup } = req.query;
    if (!city || !bloodGroup) {
        return res.status(400).json({ message: "City and blood group are required." });
    }
    try {
        const stocks = await BloodStock.find({ bloodGroup, quantity: { $gt: 0 } }).populate({ path: 'bloodBank', select: 'name email phone address city zipcode' });
        const banksInCity = stocks.filter(stock => stock.bloodBank && stock.bloodBank.city.toLowerCase() === city.toLowerCase()).map(stock => ({ _id: stock.bloodBank._id, name: stock.bloodBank.name, phone: stock.bloodBank.phone, address: stock.bloodBank.address, city: stock.bloodBank.city, zipcode: stock.bloodBank.zipcode, stock: stock.quantity }));
        res.json(banksInCity);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getMyStock = async (req, res) => {
    try {
        const stockLevelsRaw = await BloodStock.aggregate([
            { $match: { bloodBank: req.user._id } },
            { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$quantity' } } }
        ]);
        // Convert array to a map for easier lookup, e.g., { "A+": 32, "O-": 2 }
        const stockMap = stockLevelsRaw.reduce((acc, item) => {
            acc[item._id] = item.totalUnits;
            return acc;
        }, {});
        res.json(stockMap);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};