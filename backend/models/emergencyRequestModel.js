import mongoose from 'mongoose';

const emergencyRequestSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patientName: { type: String, required: true },
    hospitalName: { type: String, required: true },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsRequired: { type: Number, required: true },
    urgency: {
        type: String,
        enum: ['Critical', 'Urgent', 'Normal'],
        default: 'Normal',
        required: true
    },
    timeNeeded: { type: String, required: true }, // e.g., "Within 2 hours"
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipcode: { type: String, required: true },
    contactNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ['Active', 'Fulfilled', 'Closed'],
        default: 'Active',
    },
    fulfilledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expireAt: {
        type: Date,
        expires: 0 
    },  
}, { timestamps: true });

const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);
export default EmergencyRequest;