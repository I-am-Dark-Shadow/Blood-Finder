import app from './app.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

// Configure environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});