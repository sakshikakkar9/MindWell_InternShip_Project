import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Bug', 'Suggestion', 'General'], default: 'General' },
  message: { type: String, required: true },
  browserInfo: String,
  createdAt: { type: Date, default: Date.now }
});

// The fix: Use 'export default' instead of 'module.exports'
const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;