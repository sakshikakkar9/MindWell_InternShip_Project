import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  // --- TASK 20 OPTIMIZATION ---
  // Using ObjectId instead of String for userId is faster for indexing large datasets
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Adding an index makes retrieval much faster as the database grows
  },
  
  // We keep userEmail as a secondary field if you need it for quick display
  userEmail: { type: String, required: true }, 
  
  title: { type: String, required: true },
  slug: { type: String },
  
  // Encrypted content from Task 4
  content: { type: String, required: true }, 
  
  tags: [String],
  sessionToken: { type: String },
  
  // Ensuring we use Date objects for our Trend Analytics (Task 18)
  createdAt: { type: Date, default: Date.now }
});

// Create a compound index for optimized searching/sorting
journalSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Journal', journalSchema);