import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  // All fields from registration form
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  zipcode: { type: String },
  bloodGroup: { type: String },
  gender: { type: String },
  dateOfBirth: { type: Date },
  ownerName: { type: String },
  hospitalName: { type: String },
  
  // OTP fields
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '10m' } // This is the TTL index
});

// TTL index to automatically delete documents after 10 minutes
// Note: The 'expires' option in the createdAt field already does this. 
// This is another way to ensure it.
// otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 }); 

const OtpModel = mongoose.model('Otp', otpSchema);
export default OtpModel;