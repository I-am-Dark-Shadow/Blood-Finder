import User from '../models/userModel.js';
import BloodStock from '../models/bloodStockModel.js';

// 0. Public Search for Active Donors (No login required)
export const publicSearchDonors = async (req, res) => {
    const { bloodGroup, location, page = 1 } = req.query;
    const limit = 15; // 15 results per page
    const skip = (page - 1) * limit;

    try {
        const query = { role: 'User', isActive: true }; // Search only for ACTIVE users

        if (bloodGroup) {
            query.bloodGroup = bloodGroup;
        }

        if (location) {
            // Search in both city (case-insensitive) and zipcode
            query.$or = [
                { city: { $regex: location, $options: 'i' } },
                { zipcode: location }
            ];
        }

        const donors = await User.find(query)
            .select('name bloodGroup city phone') // Select only public info
            .skip(skip)
            .limit(limit);

        const totalDonors = await User.countDocuments(query);

        res.json({
            donors,
            currentPage: Number(page),
            totalPages: Math.ceil(totalDonors / limit),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 1. Search for Donors
export const searchDonors = async (req, res) => {
    const { bloodGroup, city, zipcode, page = 1 } = req.query;
    const limit = 10; // 10 results per page
    const skip = (page - 1) * limit;

    try {
        const query = { role: 'User' };
        if (bloodGroup) query.bloodGroup = bloodGroup;

        if (city || zipcode) {
            query.$or = [];
            if (city) query.$or.push({ city: { $regex: city, $options: 'i' } }); // Case-insensitive search
            if (zipcode) query.$or.push({ zipcode });
        }

        const donors = await User.find(query)
            .select('name bloodGroup email phone address city zipcode')
            .skip(skip)
            .limit(limit);

        const totalDonors = await User.countDocuments(query);

        res.json({
            donors,
            currentPage: Number(page),
            totalPages: Math.ceil(totalDonors / limit),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. Search for Blood Banks
export const searchBloodBanks = async (req, res) => {
    const { bloodGroup, city, zipcode, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const stockQuery = { quantity: { $gt: 0 } };
        if (bloodGroup) stockQuery.bloodGroup = bloodGroup;

        // Find stock entries and populate the blood bank info
        const stocks = await BloodStock.find(stockQuery)
            .populate({
                path: 'bloodBank',
                select: 'name phone address city zipcode',
            });
        
        // Filter the populated results by location
        const filteredBanks = stocks.filter(stock => {
            if (!stock.bloodBank) return false;
            const bank = stock.bloodBank;
            const cityMatch = city ? bank.city?.toLowerCase().includes(city.toLowerCase()) : false;
            const zipcodeMatch = zipcode ? bank.zipcode === zipcode : false;
            
            if (city && zipcode) return cityMatch || zipcodeMatch;
            if (city) return cityMatch;
            if (zipcode) return zipcodeMatch;
            return true; // If no location, return all
        });

        // Manually paginate the filtered results
        const paginatedResults = filteredBanks.slice(skip, skip + limit);
        
        // Map to desired format
        const results = paginatedResults.map(stock => ({
            _id: stock.bloodBank._id,
            name: stock.bloodBank.name,
            phone: stock.bloodBank.phone,
            address: stock.bloodBank.address,
            city: stock.bloodBank.city,
            zipcode: stock.bloodBank.zipcode,
            stock: {
                bloodGroup: stock.bloodGroup,
                quantity: stock.quantity
            }
        }));

        res.json({
            banks: results,
            currentPage: Number(page),
            totalPages: Math.ceil(filteredBanks.length / limit),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 3. Search for Test Labs
export const searchTestLabs = async (req, res) => {
    const { city, zipcode, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const query = { role: 'Test Lab' };

        if (city || zipcode) {
            query.$or = [];
            if (city) query.$or.push({ city: { $regex: city, $options: 'i' } });
            if (zipcode) query.$or.push({ zipcode });
        }

        const labs = await User.find(query)
            .select('name address city zipcode phone')
            .skip(skip)
            .limit(limit);

        const totalLabs = await User.countDocuments(query);

        res.json({
            labs,
            currentPage: Number(page),
            totalPages: Math.ceil(totalLabs / limit),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};