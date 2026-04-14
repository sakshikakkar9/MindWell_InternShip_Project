import express from 'express';
import Journal from '../models/Journal.js'; // Assuming you have a Mongoose model
import { encrypt } from '../utils/encryption.js'; // From Task 4
import { formatApiResponse } from '../utils/formatters.js';

const router = express.Router();

router.post('/save', async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    // 1. Basic Validation (Connecting back to Task 2/3)
    if (!title || !content) {
      return res.status(400).json({ 
        message: formatApiResponse("title and content are required") 
      });
    }

    // 2. Encrypt the content (Task 4)
    const encryptedContent = encrypt(content);

    // 3. Save to MongoDB
    const newEntry = new Journal({
      title,
      content: encryptedContent,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      date: new Date()
    });

    await newEntry.save();

    res.status(201).json({
      message: formatApiResponse("entry saved securely"),
      entryId: newEntry._id
    });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ 
      message: formatApiResponse("failed to save entry") 
    });
  }
});

export default router;