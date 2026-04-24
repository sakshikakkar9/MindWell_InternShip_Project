import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// User Schema for Authentication
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferences: Object
});
mongoose.model('User', userSchema);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ LOCAL DATABASE CONNECTED SUCCESSFULLY'))
  .catch((err) => console.log('❌ Connection Failed:', err.message));

// Async import routers to ensure models are registered
const loadRoutes = async () => {
  const authRoutes = (await import('./routes/auth.js')).default;
  const journalRoutes = (await import('./routes/journal.js')).default;
  const feedbackRoutes = (await import('./routes/feedback.js')).default;
  const userRoutes = (await import('./routes/user.js')).default;
  const analyticsRoutes = (await import('./routes/analytics.js')).default;

  app.use('/api/auth', authRoutes);
  app.use('/api/journal', journalRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/analytics', analyticsRoutes);
};

loadRoutes().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));
}).catch(err => {
  console.error("Failed to load routes:", err);
});