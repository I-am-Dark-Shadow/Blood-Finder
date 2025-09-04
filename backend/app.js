import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import bloodBankRoutes from './routes/bloodBankRoutes.js';
import testLabRoutes from './routes/testLabRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import emergencyRequestRoutes from './routes/emergencyRequestRoutes.js';
import donationScheduleRoutes from './routes/donationScheduleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import testRequestRoutes from './routes/testRequestRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import billingRoutes from './routes/billingRoutes.js';

// Configure environment variables
dotenv.config();

const app = express();

// Middleware Setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get("/", (req, res) => {
    res.send("BloodFinder API is active...");
});

app.use('/api/users', userRoutes);
app.use('/api/blood-bank', bloodBankRoutes);
app.use('/api/test-lab', testLabRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency-requests', emergencyRequestRoutes);
app.use('/api/donation-schedules', donationScheduleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/test-requests', testRequestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);

export default app;