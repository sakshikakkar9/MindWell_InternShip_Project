const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust based on your actual model path

// 1. FORGOT PASSWORD: Request a link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a secure 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiry for 1 hour (3600000 ms)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 

    await user.save();

    // In a real app, you'd send this link via Nodemailer
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log("Reset Link:", resetUrl); // For testing in your terminal

    res.status(200).json({ message: "Recovery link generated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. RESET PASSWORD: Change it using the token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // TASK 15: Validate the token format (Hexadecimal, 64 chars)
  const hexRegex = /^[0-9a-f]{64}$/;
  if (!hexRegex.test(token)) {
    return res.status(400).json({ message: "Invalid token format detected." });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Must not be expired
    });

    if (!user) return res.status(400).json({ message: "Token invalid or expired." });

    user.password = password; // Ensure you have a 'pre-save' hook to hash this!
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example backend signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Your logic to save the user to MongoDB
    console.log("Signup attempt for:", email);
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;