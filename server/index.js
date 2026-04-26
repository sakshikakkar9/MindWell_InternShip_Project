import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first'); // Fixes ECONNREFUSED on Windows
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

app.use(helmet());
app.use(cors()); 
app.use(express.json());

const connectDB = async () => {
  try {
    console.log('⏳ Connecting via VPN Tunnel (Standard Mode)...');
    await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  family: 4, 
  tlsAllowInvalidCertificates: true,
  // directConnection: true // Add this to force connection to the specified shards
});
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