import express from 'express';
import {
  registerUser,
  verifyOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deactivateAccount,
  deleteAccount
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfilePicture } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require a valid token)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, uploadProfilePicture.single('profilePicture'), updateUserProfile);
router.put('/change-password', protect, changePassword);
router.put('/deactivate', protect, deactivateAccount);
router.delete('/profile', protect, deleteAccount);

export default router;