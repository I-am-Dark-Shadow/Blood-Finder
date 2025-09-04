import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import OtpModel from '../models/otpModel.js';


// Function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


// 1. Register User and Send OTP
export const registerUser = async (req, res) => {
    const { email } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email is already registered.' });
        }

        await OtpModel.deleteOne({ email });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const pendingUser = new OtpModel({ ...req.body, otp });
        await pendingUser.save();

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:30px;">
            <div style="max-width:600px; margin:auto; background:white; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden;">
              <div style="background:linear-gradient(90deg, #b91c1c, #dc2626); padding:20px; text-align:center; color:white;">
                <h1 style="margin:0; font-size:22px; font-weight:bold;">Find Blood</h1>
                <p style="margin:5px 0 0; font-size:14px;">Your trusted blood donation & finder platform</p>
              </div>
              <div style="padding:25px; text-align:center;">
                <h2 style="color:#111827; margin-bottom:15px;">Welcome to Find Blood! 🎉</h2>
                <p style="font-size:15px; color:#374151;">Thank you for registering. Use the OTP below to verify your email address.</p>
                <div style="margin:25px auto; display:inline-block; background:#fef2f2; border:2px dashed #dc2626; border-radius:8px; padding:15px 25px;">
                  <span style="font-size:28px; font-weight:bold; letter-spacing:6px; color:#b91c1c;">${otp}</span>
                </div>
                <p style="font-size:14px; color:#6b7280; margin-top:10px;">This OTP is valid for <b>10 minutes</b>.</p>
              </div>
              <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
                <p style="margin:0;">If you didn’t request this, please ignore this email.</p>
                <p style="margin:5px 0 0;">&copy; ${new Date().getFullYear()} Find Blood | bloodfinder247@gmail.com</p>
              </div>
            </div>
          </div>`;

        await sendEmail({
            email: email,
            subject: 'Find Blood - Email Verification',
            html: emailHtml,
        });

        res.status(201).json({
            message: 'Registration successful! Please check your email for the verification OTP.',
            email: email,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};


// 2. Verify OTP (UPDATED FUNCTION)
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const pendingUser = await OtpModel.findOne({ email, otp });

    if (!pendingUser) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please register again.' });
    }
    
    // Create the base user payload with common fields
    const newUserPayload = {
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
        role: pendingUser.role,
        phone: pendingUser.phone,
        address: pendingUser.address,
        city: pendingUser.city,
        zipcode: pendingUser.zipcode,
        isVerified: true,
    };

    // Conditionally add role-specific fields
    if (pendingUser.role === 'User') {
        newUserPayload.bloodGroup = pendingUser.bloodGroup;
        newUserPayload.gender = pendingUser.gender;
        newUserPayload.dateOfBirth = pendingUser.dateOfBirth;
    } else { // For 'Blood Bank' and 'Test Lab'
        newUserPayload.ownerName = pendingUser.ownerName;
        if (pendingUser.role === 'Blood Bank') {
            newUserPayload.hospitalName = pendingUser.hospitalName;
        }
    }

    const user = new User(newUserPayload);

    await user.save();
    await OtpModel.deleteOne({ email });

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Email verified successfully!',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error); // For server-side debugging
    res.status(500).json({ message: 'Server error during OTP verification.', error: error.message });
  }
};


// 3. Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Your email is not verified. Please verify your email to log in.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Login successful!",
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};


// --- REST OF THE FILE REMAINS THE SAME ---

// 4. Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const emailHtml = `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden;">
      <div style="background:linear-gradient(90deg, #dc2626, #ef4444); padding:20px; text-align:center; color:white;">
        <h1 style="margin:0; font-size:22px; font-weight:bold;">Blood Finder</h1>
        <p style="margin:5px 0 0; font-size:14px;">Reset your account password</p>
      </div>
      <div style="padding:25px; text-align:center;">
        <h2 style="color:#111827; margin-bottom:15px;">Password Reset Request 🔐</h2>
        <p style="font-size:15px; color:#374151;">We received a request to reset your <b>Blood Finder</b> account password.  
        Use the OTP below to set a new password.</p>
        <div style="margin:25px auto; display:inline-block; background:#fef2f2; border:2px dashed #dc2626; border-radius:8px; padding:15px 25px;">
          <span style="font-size:28px; font-weight:bold; letter-spacing:6px; color:#b91c1c;">${otp}</span>
        </div>
        <p style="font-size:14px; color:#6b7280; margin-top:10px;">This OTP is valid for <b>10 minutes</b>.  
        If you did not request a password reset, please ignore this email.</p>
      </div>
      <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
        <p style="margin:0;">Need help? Contact us at <b>bloodfinder247@gmail.com</b></p>
        <p style="margin:5px 0 0;">&copy; 2025 Blood Finder</p>
      </div>
    </div>
  </div>`;

    await sendEmail({
      email: user.email,
      subject: 'Blood Finder - Password Reset OTP',
      html: emailHtml,
    });

    res.status(200).json({ message: 'Password reset OTP has been sent to your email.', email });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// 5. Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Your password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};


// 6. Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// 7. Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Common fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.zipcode = req.body.zipcode || user.zipcode;

    if (req.file) {
      user.profilePicture = req.file.path;
    }

    // Role-specific fields
    if (user.role === 'User') {
      user.gender = req.body.gender || user.gender;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    }
    else if (user.role === 'Blood Bank') {
      user.ownerName = req.body.ownerName || user.ownerName;
      user.hospitalName = req.body.hospitalName || user.hospitalName;
    }
    else if (user.role === 'Test Lab') {
      user.ownerName = req.body.ownerName || user.ownerName;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully!",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// 8. Change Password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// 9. Deactivate Account
export const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    const updatedUser = await user.save();

    res.status(200).json({ 
        message: `Account has been ${updatedUser.isActive ? 'activated' : 'deactivated'}.`,
        user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// 10. Delete Account
export const deleteAccount = async (req, res) => {
  const { password } = req.body;
  try {
    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    await user.deleteOne();

    res.status(200).json({ message: 'Account has been permanently deleted.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};