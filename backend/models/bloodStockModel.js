import mongoose from 'mongoose';

const bloodStockSchema = new mongoose.Schema({
    bloodBank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    quantity: { // in units
        type: Number,
        required: true,
        default: 1,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const BloodStock = mongoose.model('BloodStock', bloodStockSchema);
export default BloodStock;