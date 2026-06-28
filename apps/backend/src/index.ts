import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/db';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas (Mongoose buffers queries, so we can connect asynchronously)
connectDatabase().catch((error) => {
  console.error('Failed to connect to database:', error);
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend API Server running on http://localhost:${PORT}`);
  });
}

export default app;
