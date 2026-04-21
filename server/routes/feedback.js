import express from 'express';
const router = express.Router();
import Feedback from '../models/Feedback.js'; // Ensure the .js extension is present
import auth from '../middleware/auth.js';      // Ensure the .js extension is present

// POST /api/feedback
// Protected by 'auth' middleware to fix Audit Loophole #4
router.post('/', auth, async (req, res) => {
  try {
    const { type, message } = req.body;
    
    // Validation check
    if (!message || message.length < 10) {
      return res.status(400).json({ 
        message: "Feedback must be at least 10 characters." 
      });
    }

    // Creating the feedback entry
    const newFeedback = new Feedback({
      userId: req.user.id,        // Injected by your auth middleware from the JWT
      type,
      message,
      browserInfo: req.headers['user-agent']
    });

    await newFeedback.save();
    
    console.log(`✅ Feedback saved for user ID: ${req.user.id}`);
    res.status(201).json({ message: "Feedback received. Thank you!" });

  } catch (err) {
    console.error("Feedback Error:", err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

export default router;