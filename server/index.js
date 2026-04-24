import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Import models first
import './models/User.js';
import './models/Journal.js';
import './models/Feedback.js';

// Import routers
import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';
import feedbackRoutes from './routes/feedback.js';
import userRoutes from './routes/user.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(helmet());
app.use(limiter);
app.use(cors()); 
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ LOCAL DATABASE CONNECTED SUCCESSFULLY'))
  .catch((err) => console.log('❌ Connection Failed:', err.message));

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));