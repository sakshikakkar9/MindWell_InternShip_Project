import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String },
  content: { type: String, required: true }, // This will store the ENCRYPTED text
  tags: [String],
  sessionToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Journal', journalSchema);