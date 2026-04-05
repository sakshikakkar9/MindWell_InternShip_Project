import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { slugify, sanitizeEntry, parseTags } from './utils/validation.js';

// 1. Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware
app.use(cors());
app.use(json());

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ LOCAL DATABASE CONNECTED SUCCESSFULLY'))
  .catch((err) => console.log('❌ Local Connection Failed:', err.message));

// --- TASK 3: JOURNAL DATA MODEL & VALIDATION ROUTE ---
app.post('/api/journal/test', (req, res) => {
  console.log("--- Processing Task 3 Request ---");
  
  // Safety Gate: If body is missing, stop here and tell the user why
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ 
      error: "The request body is empty. Please add JSON data in Thunder Client." 
    });
  }

  const { title, content, tags } = req.body;

  // Now the rest of your logic can run safely...
  if (!title || !content) {
    return res.status(400).json({ error: "Title and Content are required." });
  }

  const sanitizedContent = sanitizeEntry(content).cleaned;
  const urlSlug = slugify(title);
  const tagsArray = parseTags(tags);

  res.json({
    message: "Task 3: Journal Data Structure Prepared",
    entry: {
      title,
      slug: urlSlug,
      content: sanitizedContent,
      tags: tagsArray,
      timestamp: new Date().toISOString()
    }
  });
});

// 4. Health Check
app.get('/', (req, res) => {
  res.send('🚀 MindWell Server is active and Task 3 logic is loaded!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is active on http://localhost:${PORT}`);
});