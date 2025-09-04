import mongoose from 'mongoose';

const testRequestSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testLab: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tests: [{ type: String, required: true }],
    patientName: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Completed', 'Rejected'],
        default: 'Pending',
    },
    prescriptionUrl: { type: String },
    
    // --- NEW FIELDS FOR BILLING AND REPORTS ---
    testsWithPrices: [{
        name: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    totalPrice: { type: Number },
    report: { // Report will be stored in MongoDB
        data: Buffer,
        contentType: String
    },
    bill: {
        data: Buffer,
        contentType: String
    },   // Link to the generated bill PDF
    billGeneratedAt: { type: Date },
    // ------------------------------------------

}, { timestamps: true });

const TestRequest = mongoose.model('TestRequest', testRequestSchema);
export default TestRequest;