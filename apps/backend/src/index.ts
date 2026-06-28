import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/db';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Backend API Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start the Express server:', error);
  process.exit(1);
});
