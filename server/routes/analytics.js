import express from 'express';
import Journal from '../models/Journal.js';
import auth from '../middleware/auth.js';
import { decryptText } from '../utils/validation.js';

const router = express.Router();

router.get('/mood-insights', auth, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user.id });

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

export default router;