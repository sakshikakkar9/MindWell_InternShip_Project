import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first'); 
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Import models
import './models/User.js';
import './models/Journal.js';
import './models/Feedback.js';
import './models/Reminder.js';

// Import routers
import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';
import feedbackRoutes from './routes/feedback.js';
import userRoutes from './routes/user.js';
import analyticsRoutes from './routes/analytics.js';
import reminderRoutes from './routes/reminder.js';
import { startReminderService } from './utils/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// FIX 1: Only one CORS declaration is needed. 
// Replace 'https://your-mindwell-frontend.vercel.app' with your ACTUAL Vercel URL from your screenshot.
app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin that makes a request
    // If the request has no origin (like a server-to-server call or Postman), allow it
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json());

const connectDB = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    // FIX 2: Removed VPN-specific flags that might fail on Render's Linux environment
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MONGODB ATLAS CONNECTED SUCCESSFULLY');
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server active on port ${PORT}`);
    startReminderService();
  });
};

startServer();
