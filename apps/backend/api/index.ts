import app from '../src/app';
import { connectDatabase } from '../src/config/db';

// Connect to MongoDB Atlas (asynchronous in serverless lifecycle)
connectDatabase().catch((error) => {
  console.error('Failed to connect to database in Vercel serverless handler:', error);
});

export default app;
