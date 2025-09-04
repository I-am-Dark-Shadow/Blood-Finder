import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Common fields for all
  name: { type: String, required: [true, 'Please enter your name'] },
  email: { type: String, required: [true, 'Please enter your email'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'Please enter your password'], minlength: 6 },
  role: { type: String, enum: ['User', 'Blood Bank', 'Test Lab'], default: 'User' },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  zipcode: { type: String },
  profilePicture: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  
  // User/Donor specific
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  
  // Blood Bank / Test Lab specific
  ownerName: { type: String },

  // Blood Bank specific
  hospitalName: { type: String },
  
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;