import mongoose from 'mongoose';

const donationScheduleSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bloodGroup: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipcode: { type: String, required: true },
    contactNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Completed', 'Rejected', 'Expired'],
        default: 'Pending',
    },
    approvedBy: { // The Blood Bank that approved it
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    visitDate: { type: Date }, // Date the bank will visit
}, { timestamps: true });

const DonationSchedule = mongoose.model('DonationSchedule', donationScheduleSchema);
export default DonationSchedule;