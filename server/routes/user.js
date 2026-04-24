import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const User = mongoose.model('User');

// 1. Get Profile Data
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// 2. Update Profile & Settings
router.post('/update-profile', auth, async (req, res) => {
  try {
    const { username, preferences } = req.body;
    await User.findByIdAndUpdate(req.user.id, { username, preferences });
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

// 3. Change Password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password change failed" });
  }
});

export default router;