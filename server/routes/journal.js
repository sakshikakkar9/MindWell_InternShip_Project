import express from 'express';
import Journal from '../models/Journal.js';
import auth from '../middleware/auth.js'; 
import { encryptText, decryptText, slugify, sanitizeEntry, analyzeSentiment } from '../utils/validation.js';

const router = express.Router();

// --- TASK 20: PAGINATED & DECRYPTED GET ROUTE ---
router.get('/entries', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const entries = await Journal.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const decryptedEntries = entries.map(entry => {
      const entryObj = entry.toObject(); 
      try {
        entryObj.content = decryptText(entry.content, 5);
        entryObj.title = decryptText(entry.title, 5);
      } catch (e) {
        console.error("Decryption failed for entry:", entry._id);
      }
      return entryObj;
    });

    const total = await Journal.countDocuments({ userId: req.user.id });

    res.json({
      entries: decryptedEntries,
      hasMore: page * limit < total
    });
  } catch (err) {
    res.status(500).json({ message: "Pagination Error" });
  }
});

// --- TASK 20: SAVE WITH USER ID ASSOCIATION ---
router.post('/save', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User identity lost" });
    }

    // Task 2: Sanitize inputs
    const sanitizedTitle = sanitizeEntry(title).cleaned;
    const sanitizedContent = sanitizeEntry(content).cleaned;

    const newEntry = new Journal({
      userId: req.user.id, 
      userEmail: req.user.email,
      title: encryptText(sanitizedTitle, 5),
      content: encryptText(sanitizedContent, 5),
      slug: slugify(sanitizedTitle), // Task 2: Slugify
      sentimentScore: analyzeSentiment(sanitizedContent), // Task 10: Sentiment Analysis
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      createdAt: new Date()
    });

    await newEntry.save();
    res.status(201).json({ message: "Saved" });
  } catch (error) { 
    console.error(error);
    res.status(500).send("Error saving entry"); 
  }
});

// --- EXPORT ROUTE ---
router.get('/export', auth, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const decryptedData = entries.map(entry => ({
      title: decryptText(entry.title, 5),
      content: decryptText(entry.content, 5),
      tags: entry.tags,
      date: entry.createdAt
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mindwell_backup.json`);

    res.status(200).send(JSON.stringify(decryptedData, null, 2));
  } catch (error) {
    res.status(500).json({ message: "Export failed" });
  }
});

export default router;