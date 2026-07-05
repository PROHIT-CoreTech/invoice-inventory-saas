import { prisma } from '@procash-invoices/database/server';

export const connectDatabase = async () => {
  try {
    const provider = process.env.DATABASE_PROVIDER || 'sqlite';
    console.log(`Connecting to database (Provider: ${provider})...`);
    await prisma.$connect();
    console.log('Successfully connected to database.');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};
