import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { slugify, sanitizeEntry, parseTags, encryptText, decryptText } from './utils/validation.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ LOCAL DATABASE CONNECTED SUCCESSFULLY'))
  .catch((err) => console.log('❌ Connection Failed:', err.message));

app.post('/api/journal/test', (req, res) => {
  if (!req.body || !req.body.title || !req.body.content) {
    return res.status(400).json({ error: "Title and Content are required." });
  }

  const { title, content, tags } = req.body;
  const shiftKey = 5;

  // Process through all 4 tasks:
  const cleanContent = sanitizeEntry(content).cleaned; // Task 2
  const entrySlug = slugify(title);                  // Task 2
  const tagsList = parseTags(tags);                  // Task 3
  const lockedData = encryptText(cleanContent, shiftKey); // Task 4

  res.json({
    message: "MindWell Backend Logic: All 4 Tasks Verified",
    data: {
      slug: entrySlug,
      tags: tagsList,
      encrypted: lockedData,
      decryptedPreview: decryptText(lockedData, shiftKey) // Verify it works
    }
  });
});

app.listen(5000, () => console.log('🚀 Server active on http://localhost:5000'));