import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    testLab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    testName: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true }, // e.g., "2-4 hours"
    description: { type: String },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema);
export default Test;