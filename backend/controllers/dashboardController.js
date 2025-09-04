import BloodStock from '../models/bloodStockModel.js';
import EmergencyRequest from '../models/emergencyRequestModel.js';
import User from '../models/userModel.js';
import TestRequest from '../models/testRequestModel.js';

// Controller to get all data for the User Dashboard
export const getUserDashboardData = async (req, res) => {
    try {
        const user = req.user;

        // 1. Find Nearby Blood Banks with the user's blood group
        let nearbyBanks = [];
        if (user.bloodGroup && (user.city || user.zipcode)) {
            const stockQuery = {
                bloodGroup: user.bloodGroup,
                quantity: { $gt: 0 }
            };

            const stocks = await BloodStock.find(stockQuery)
                .populate({
                    path: 'bloodBank', // The 'bloodBank' field in BloodStock model must be a ref to 'User'
                    select: 'name city zipcode',
                    match: {
                        $or: [
                            { city: user.city },
                            { zipcode: user.zipcode }
                        ]
                    }
                });

            nearbyBanks = stocks
                .filter(stock => stock.bloodBank) // Filter out stocks where the bank didn't match the location
                .map(stock => ({
                    name: stock.bloodBank.name,
                    stock: stock.quantity
                }))
                .slice(0, 2); // Limit to a maximum of 2
        }

        // 2. Find the most recent Urgent Request in the user's location
        let urgentRequest = null;
        if (user.city || user.zipcode) {
            urgentRequest = await EmergencyRequest.findOne({
                status: 'Active',
                $or: [{ city: user.city }, { zipcode: user.zipcode }]
            }).sort({ createdAt: -1 }); // Get the latest one
        }

        res.json({
            nearbyBanks,
            urgentRequest
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getTestLabDashboardData = async (req, res) => {
  try {
    const testLabId = req.user._id;
    const { year, month, groupBy = "month" } = req.query;

    // --- 1. Stat Cards Data ---
    const pendingRequests = await TestRequest.countDocuments({
      testLab: testLabId,
      status: "Pending",
    });

    const completedToday = await TestRequest.countDocuments({
      testLab: testLabId,
      status: "Completed",
      updatedAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    const totalRevenueThisMonth = await TestRequest.aggregate([
      {
        $match: {
          testLab: testLabId,
          status: "Completed",
          billGeneratedAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // --- 2. Income Chart Data ---
    const matchStage = {
      testLab: testLabId,
      status: "Completed",
      billGeneratedAt: {
        $gte: new Date(parseInt(year), 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1),
      },
    };

    if (groupBy === "day" && month) {
      matchStage.billGeneratedAt = {
        $gte: new Date(parseInt(year), parseInt(month) - 1, 1),
        $lt: new Date(parseInt(year), parseInt(month), 1),
      };
    }

    const groupStage = {
      _id:
        groupBy === "day"
          ? { day: { $dayOfMonth: "$billGeneratedAt" } }
          : { month: { $month: "$billGeneratedAt" } },
      totalIncome: { $sum: "$totalPrice" },
    };

    let incomeData = await TestRequest.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { "_id": 1 } },
    ]);

    // --- 3. Ensure no negative values (just income only) ---
    incomeData = incomeData.map((item) => ({
      _id: item._id,
      totalIncome: Math.max(0, Math.round(item.totalIncome)), // no -1
    }));

    // --- 4. Final Response ---
    res.json({
      stats: {
        pendingRequests,
        completedToday,
        totalRevenue: totalRevenueThisMonth[0]?.total || 0,
      },
      chartData: incomeData,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

