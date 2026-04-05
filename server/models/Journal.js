import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  tags: [String], // Array of strings for user-defined tags
  mood: {
    type: String,
    default: 'neutral'
  }
}, {
  timestamps: true // This automatically handles Task 3's "timestamps" requirement
});

const Journal = mongoose.model('Journal', journalSchema);
export default Journal;