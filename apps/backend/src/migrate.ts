import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db';
import { InvoiceModel } from '@my-billing/database/server';

dotenv.config();

const runMigration = async () => {
  console.log('Connecting to database...');
  await connectDatabase();

  console.log('Fetching all invoices/documents...');
  const docs = await InvoiceModel.find({});
  console.log(`Found ${docs.length} documents.`);

  for (const doc of docs) {
    const originalNum = doc.documentNumber;
    let newNum = originalNum;

    // Helper to get financial year from a date
    const getFinancialYear = (date: Date) => {
      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth();
      const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const endYear = (startYear + 1) % 100;
      return `${startYear}-${String(endYear).padStart(2, '0')}`;
    };

    const date = (doc as any).createdAt || new Date();
    const fy = getFinancialYear(date);

    if (doc.documentType === 'QUOTATION') {
      // e.g. 2026-27/CFS-001 -> 2026-27/CFS-QT-001
      if (originalNum.includes('/CFS-') && !originalNum.includes('/CFS-QT-')) {
        newNum = originalNum.replace('/CFS-', '/CFS-QT-');
      } else if (!originalNum.includes('CFS-QT-')) {
        const match = originalNum.match(/\d+$/);
        const seq = match ? match[0].padStart(3, '0') : '001';
        newNum = `${fy}/CFS-QT-${seq}`;
      }
    } else if (doc.documentType === 'PROFORMA') {
      // e.g. 2026-27/CFS-001 -> 2026-27/CFS-PRO-001
      if (originalNum.includes('/CFS-') && !originalNum.includes('/CFS-PRO-')) {
        newNum = originalNum.replace('/CFS-', '/CFS-PRO-');
      } else if (originalNum.startsWith('PRO-')) {
        // e.g. PRO-2026-0042 -> 2026-27/CFS-PRO-042
        const matchNum = originalNum.match(/\d+$/);
        const seq = matchNum ? matchNum[0].slice(-3).padStart(3, '0') : '001';
        newNum = `${fy}/CFS-PRO-${seq}`;
      } else if (!originalNum.includes('CFS-PRO-')) {
        const match = originalNum.match(/\d+$/);
        const seq = match ? match[0].padStart(3, '0') : '001';
        newNum = `${fy}/CFS-PRO-${seq}`;
      }
    } else if (doc.documentType === 'FINAL_INVOICE') {
      // e.g. 2026-27/CFS-001 -> 2026-27/CFS-INV-001
      if (originalNum.includes('/CFS-') && !originalNum.includes('/CFS-INV-')) {
        newNum = originalNum.replace('/CFS-', '/CFS-INV-');
      } else if (originalNum.startsWith('INV-')) {
        // e.g. INV-2026-0042 -> 2026-27/CFS-INV-042
        const matchNum = originalNum.match(/\d+$/);
        const seq = matchNum ? matchNum[0].slice(-3).padStart(3, '0') : '001';
        newNum = `${fy}/CFS-INV-${seq}`;
      } else if (!originalNum.includes('CFS-INV-')) {
        const match = originalNum.match(/\d+$/);
        const seq = match ? match[0].padStart(3, '0') : '001';
        newNum = `${fy}/CFS-INV-${seq}`;
      }
    }

    if (newNum !== originalNum) {
      console.log(`Updating ${doc.documentType}: ${originalNum} -> ${newNum}`);
      doc.documentNumber = newNum;
      
      try {
        await doc.save();
      } catch (err: any) {
        console.error(`Error saving document ${doc._id}:`, err.message);
        if (err.code === 11000) {
          console.warn(`Duplicate document number detected for ${newNum}. Trying unique suffix...`);
          doc.documentNumber = `${newNum}-DUP`;
          await doc.save();
        }
      }
    }
  }

  console.log('Migration finished successfully!');
  await mongoose.disconnect();
};

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
