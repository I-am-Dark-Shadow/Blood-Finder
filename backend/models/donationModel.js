import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
    donor: { // The user who donated
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bloodBank: { // The blood bank that received the donation
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bloodGroup: { type: String, required: true },
    quantity: { // in units
        type: Number,
        required: true,
        default: 1,
    },
    donationDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;