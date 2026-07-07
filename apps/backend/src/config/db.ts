import { prisma } from '@procash-invoices/database/server';
import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const provider = process.env.DATABASE_PROVIDER || 'sqlite';
    console.log(`Connecting to database (Provider: ${provider})...`);
    await prisma.$connect();
    console.log('Successfully connected Prisma to database.');

    const mongoUrl = process.env.DATABASE_URL;
    if (mongoUrl) {
      console.log('Connecting Mongoose to MongoDB Atlas...');
      await mongoose.connect(mongoUrl);
      console.log('Successfully connected Mongoose to MongoDB.');
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};
