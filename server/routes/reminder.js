import express from 'express';
import Reminder from '../models/Reminder.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all reminders for a user
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders" });
  }
});

// Create a new reminder
router.post('/', auth, async (req, res) => {
  try {
    const { activity, time, days } = req.body;
    const newReminder = new Reminder({
      userId: req.user.id,
      activity,
      time,
      days
    });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ message: "Error creating reminder" });
  }
});

// Update a reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const { activity, time, days, isEnabled } = req.body;
    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { activity, time, days, isEnabled },
      { new: true }
    );
    if (!updatedReminder) return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(500).json({ message: "Error updating reminder" });
  }
});

// Delete a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedReminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!deletedReminder) return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reminder" });
  }
});

export default router;