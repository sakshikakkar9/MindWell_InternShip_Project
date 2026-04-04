import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 1. Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware
app.use(cors());
app.use(json());

// 3. Database Connection (Local)
// Note: We use 127.0.0.1 to avoid DNS/IPv6 issues on Windows
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('---');
    console.log('✅ LOCAL DATABASE CONNECTED SUCCESSFULLY');
    console.log(`📂 Database: ${mongoose.connection.name}`);
    console.log('---');
  })
  .catch((err) => {
    console.log('---');
    console.log('❌ Local Connection Failed.');
    console.log('Error Details:', err.message);
    console.log('Tip: Ensure MongoDB Service is running in services.msc');
    console.log('---');
  });

// 4. Health Check Route
app.get('/', (req, res) => {
  res.send('🚀 MindWell Server is running smoothly on Local MongoDB!');
});

// 5. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is active on http://localhost:${PORT}`);
});