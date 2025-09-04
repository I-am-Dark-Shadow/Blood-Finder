import DonationSchedule from '../models/donationScheduleModel.js';

// 1. Create a new Donation Schedule
export const createDonationSchedule = async (req, res) => {
    try {
        const { preferredDate, address, city, zipcode, contactNumber } = req.body;
        const donorId = req.user._id;
        const bloodGroup = req.user.bloodGroup;

        if (!bloodGroup) {
            return res.status(400).json({ message: "Please update your blood group in your profile before scheduling a donation." });
        }

        const newSchedule = new DonationSchedule({
            donor: donorId,
            bloodGroup,
            preferredDate,
            address, city, zipcode, contactNumber
        });

        await newSchedule.save();
        res.status(201).json({ message: "Donation scheduled successfully!", schedule: newSchedule });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. Get all schedules for the logged-in user
export const getMyDonationSchedules = async (req, res) => {
    try {
        const schedules = await DonationSchedule.find({ donor: req.user._id })
            .sort({ createdAt: -1 });

        // Logic to mark past pending requests as "Expired"
        const updatedSchedules = schedules.map(schedule => {
            if (schedule.status === 'Pending' && new Date(schedule.preferredDate) < new Date()) {
                schedule.status = 'Expired';
                // In a real application, you might want to save this change to the DB
                // For now, we'll just change it for the response
            }
            return schedule;
        });

        res.json(updatedSchedules);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 3. Allow a user to cancel their own PENDING schedule
export const cancelDonationSchedule = async (req, res) => {
    try {
        const schedule = await DonationSchedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found." });
        }

        if (schedule.donor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to cancel this schedule." });
        }

        if (schedule.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending schedules can be canceled." });
        }

        await schedule.deleteOne();
        res.json({ message: "Donation schedule has been canceled." });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};