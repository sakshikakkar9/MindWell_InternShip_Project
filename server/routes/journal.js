import express from 'express';
import Journal from '../models/Journal.js';
import auth from '../middleware/auth.js'; 
import { encrypt, decrypt } from '../utils/encryption.js'; // Ensure these utils exist

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

    // --- THE FIX: Convert encrypted DB data to readable text ---
    const decryptedEntries = entries.map(entry => {
      const entryObj = entry.toObject(); 
      try {
        // We decrypt here so the frontend receives "I CAN" instead of "U2Fsd..."
        entryObj.content = decrypt(entry.content); 
        // Only decrypt title if you encrypted it during save
        if (entry.title.includes('U2Fsd')) {
           entryObj.title = decrypt(entry.title);
        }
      } catch (e) {
        console.error("Decryption failed for entry:", entry._id);
      }
      return entryObj;
    });

    const total = await Journal.countDocuments({ userId: req.user.id });

    res.json({
      entries: decryptedEntries, // Send the readable version
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
    
    // Ensure req.user.id exists (comes from your auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User identity lost" });
    }

    const newEntry = new Journal({
      userId: req.user.id, 
      userEmail: req.user.email,
      title: encrypt(title), 
      content: encrypt(content),
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      createdAt: new Date()
    });

    await newEntry.save();
    res.status(201).json({ message: "Saved" });
  } catch (error) { 
    res.status(500).send("Error saving entry"); 
  }
});

export default router;