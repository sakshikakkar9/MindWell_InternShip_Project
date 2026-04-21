import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Journal from './models/Journal.js'; 
import { formatApiResponse } from './utils/formatters.js'; 
import { 
  slugify, sanitizeEntry, parseTags, 
  encryptText, decryptText, generateSecureToken 
} from './utils/validation.js';
import feedbackRoutes from './routes/feedback.js';
dotenv.config();

// TASK 15: User Schema for Authentication
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  resetToken: String,
});
const User = mongoose.model('User', userSchema);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ LOCAL DATABASE CONNECTED SUCCESSFULLY'))
  .catch((err) => console.log('❌ Connection Failed:', err.message));

app.use('/api/feedback', feedbackRoutes);

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "Account created!" });
  } catch (error) {
    res.status(500).json({ message: "Signup error" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = generateSecureToken(32); 
    user.resetToken = resetToken;
    await user.save();

    console.log(`\n🔑 RESET LINK: http://localhost:5173/reset-password/${resetToken}\n`);
    res.status(200).json({ message: "Link generated in console" });
  } catch (error) {
    res.status(500).json({ message: "Recovery error" });
  }
});

// --- JOURNAL ROUTES ---

app.post('/api/journal/save', async (req, res) => {
  try {
    // Now we also destructure 'email' from the request body
    const { title, content, tags, email } = req.body; 

    const newEntry = new Journal({
      userEmail: email, // Save the email here
      title: encryptText(title, 5),
      content: encryptText(content, 5),
      tags: tags.split(',').map(tag => tag.trim()),
    });

    await newEntry.save();
    res.status(201).json({ message: "Saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving entry" });
  }
});

// Add this to your server/index.js
// 1. Update the GET route to decrypt with SHIFT 5
app.get('/api/journal/entries', async (req, res) => {
  try {
    const { email } = req.query; // Get the email from the URL (?email=...)

    // Only find journals where userEmail matches the logged-in user
    const entries = await Journal.find({ userEmail: email }).sort({ createdAt: -1 });

    const processedEntries = entries.map(entry => ({
      ...entry._doc,
      title: decryptText(entry.title, 5),
      content: decryptText(entry.content, 5),
    }));

    res.status(200).json({ entries: processedEntries });
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

app.get('/api/journal/export', async (req, res) => {
  try {
    const { email } = req.query; // Get email from query params
    
    // 1. Fetch only this user's entries
    const entries = await Journal.find({ userEmail: email }).sort({ createdAt: -1 });

    // 2. Decrypt the data so the export is readable
    const decryptedData = entries.map(entry => ({
      title: decryptText(entry.title, 5),
      content: decryptText(entry.content, 5),
      tags: entry.tags,
      date: entry.createdAt
    }));

    // 3. Set headers to prompt a file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mindwell_backup_${email}.json`);
    
    res.status(200).send(JSON.stringify(decryptedData, null, 2));
  } catch (error) {
    res.status(500).json({ message: "Export failed" });
  }
});

// 1. Get Profile Data
app.get('/api/user/profile', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email }).select('-password'); // Don't send the password!
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// 2. Update Profile & Settings
app.post('/api/user/update-profile', async (req, res) => {
  try {
    const { email, username, preferences } = req.body;
    await User.findOneAndUpdate({ email }, { username, preferences });
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

// 3. Change Password (Simplified for now)
app.post('/api/user/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  // In a real app, you would hash the newPassword here
  await User.findOneAndUpdate({ email }, { password: newPassword });
  res.status(200).json({ message: "Password changed successfully" });
});

app.get('/api/analytics/mood-insights', async (req, res) => {
  try {
    const { email } = req.query;
    const entries = await Journal.find({ userEmail: email });

    // 1. Simple Keyword Sentiment Analysis
    const positiveWords = ['happy', 'productive', 'calm', 'great', 'love', 'excited'];
    const negativeWords = ['sad', 'stressed', 'tired', 'anxious', 'angry', 'bad'];

    let moodCorrelation = {
      work: { positive: 0, negative: 0 },
      health: { positive: 0, negative: 0 },
      social: { positive: 0, negative: 0 }
    };

    entries.forEach(entry => {
      const content = decryptText(entry.content, 5).toLowerCase();
      const tags = entry.tags.map(t => t.toLowerCase());

      // Check for correlations
      tags.forEach(tag => {
        if (moodCorrelation[tag]) {
          positiveWords.forEach(word => { if (content.includes(word)) moodCorrelation[tag].positive++; });
          negativeWords.forEach(word => { if (content.includes(word)) moodCorrelation[tag].negative++; });
        }
      });
    });

    res.status(200).json(moodCorrelation);
  } catch (error) {
    res.status(500).json({ message: "Analytics failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));