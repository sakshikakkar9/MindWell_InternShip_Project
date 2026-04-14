import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Journal from './models/Journal.js'; 
import { formatApiResponse } from './utils/formatters.js'; 

// FIX 1: Added 'decryptText' to the import list
import { 
  slugify, sanitizeEntry, parseTags, 
  encryptText, decryptText, generateSecureToken 
} from './utils/validation.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ LOCAL DATABASE CONNECTED SUCCESSFULLY'))
  .catch((err) => console.log('❌ Connection Failed:', err.message));

/**
 * TASK 8: SECURE SAVE ENDPOINT
 */
app.post('/api/journal/save', async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        message: formatApiResponse("title and content are required") 
      });
    }
    const cleanContent = sanitizeEntry(content).cleaned;
    const entrySlug = slugify(title);
    const tagsArray = parseTags(tags);

    const encryptedContent = encryptText(cleanContent, 5); 
    const sessionToken = generateSecureToken(16);

    const newEntry = new Journal({
      title,
      slug: entrySlug,
      content: encryptedContent,
      tags: tagsArray,
      sessionToken: sessionToken
    });

    await newEntry.save();

    res.status(201).json({
      message: formatApiResponse("entry saved securely to database"),
      data: {
        id: newEntry._id,
        slug: entrySlug
      }
    });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ 
      message: formatApiResponse("failed to save entry") 
    });
  }
});

/**
 * TASK 9: SECURE RETRIEVAL ENDPOINT
 */
app.get('/api/journal/entries', async (req, res) => {
  try {
    const entries = await Journal.find().sort({ createdAt: -1 });

    // FIX 2: Added safety checks to prevent crashing on empty content
    const decryptedEntries = entries.map(entry => {
      // Ensure content exists before trying to decrypt it
      const decryptedContent = entry.content 
        ? decryptText(entry.content, 5) 
        : "No content available";
      
      return {
        _id: entry._id, // Matching MongoDB ID naming
        title: entry.title,
        content: decryptedContent, 
        tags: entry.tags,
        date: entry.createdAt
      };
    });

    res.status(200).json({
      message: formatApiResponse("entries retrieved and decrypted successfully"),
      count: decryptedEntries.length,
      entries: decryptedEntries
    });

  } catch (error) {
    // This will now show the exact error in your terminal
    console.error("Retrieval Error:", error); 
    res.status(500).json({ 
      message: formatApiResponse("failed to retrieve entries") 
    });
  }
});

app.get('/', (req, res) => {
  res.send('🚀 MindWell Server is active!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server active on http://localhost:${PORT}`);
});