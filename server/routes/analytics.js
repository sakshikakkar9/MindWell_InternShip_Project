import express from 'express';
import Journal from '../models/Journal.js';
import auth from '../middleware/auth.js';
import { decryptText } from '../utils/validation.js';

const router = express.Router();

router.get('/mood-insights', auth, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user.id }).sort({ createdAt: 1 });

    // 1. Simple Keyword Sentiment Analysis
    const positiveWords = ['happy', 'productive', 'calm', 'great', 'love', 'excited'];
    const negativeWords = ['sad', 'stressed', 'tired', 'anxious', 'angry', 'bad'];

    let moodCorrelation = {
      work: { positive: 0, negative: 0 },
      health: { positive: 0, negative: 0 },
      social: { positive: 0, negative: 0 }
    };

    // TASK 25: Predictive Analytics - Identify Triggers
    // Logic: Look for tags that are frequently present when mood drops compared to previous entry
    let triggers = {};
    let previousMood = null;

    entries.forEach((entry, index) => {
      const content = decryptText(entry.content, 5).toLowerCase();
      const tags = entry.tags.map(t => t.toLowerCase());
      const currentMood = entry.sentimentScore || 3;

      // Check for correlations (Existing logic)
      tags.forEach(tag => {
        if (moodCorrelation[tag]) {
          positiveWords.forEach(word => { if (content.includes(word)) moodCorrelation[tag].positive++; });
          negativeWords.forEach(word => { if (content.includes(word)) moodCorrelation[tag].negative++; });
        }
      });

      // Predictive Trigger Analysis
      if (previousMood !== null && currentMood < previousMood) {
        // Mood dropped! What tags were present in this or previous session?
        tags.forEach(tag => {
          triggers[tag] = (triggers[tag] || 0) + 1;
        });
      }
      previousMood = currentMood;
    });

    // Sort triggers by frequency and take top 3
    const sortedTriggers = Object.entries(triggers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    res.status(200).json({
      correlations: moodCorrelation,
      potentialTriggers: sortedTriggers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Analytics failed" });
  }
});

// TASK 26: Wellness Reporting Endpoint
router.get('/report', auth, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user.id }).sort({ createdAt: -1 });

    if (entries.length === 0) {
      return res.json({ message: "Not enough data for report." });
    }

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentEntries = entries.filter(e => new Date(e.createdAt) >= last7Days);

    const avgMood = recentEntries.reduce((acc, curr) => acc + (curr.sentimentScore || 3), 0) / (recentEntries.length || 1);

    // Frequency: Entries per week
    const frequency = recentEntries.length;

    res.status(200).json({
      period: "Last 7 Days",
      averageMood: avgMood.toFixed(1),
      journalingFrequency: frequency,
      totalEntries: entries.length
    });
  } catch (error) {
    res.status(500).json({ message: "Report generation failed" });
  }
});

export default router;
