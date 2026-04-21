import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  // This links the journal to the specific person logged in
  userEmail: { type: String, required: true }, 
  title: { type: String, required: true },
  slug: { type: String },
  content: { type: String, required: true }, 
  tags: [String],
  sessionToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Journal', journalSchema);