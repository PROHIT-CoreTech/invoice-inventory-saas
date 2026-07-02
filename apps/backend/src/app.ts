import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import quotationRoutes from './routes/quotations';
import proformaRoutes from './routes/proformaInvoices';
import finalInvoiceRoutes from './routes/finalInvoices';
import clientRoutes from './routes/clients';
import conversionRoutes from './routes/conversions';

const app = express();

app.use(cors());
// Set JSON limit higher to support base64 image uploads
app.use(express.json({ limit: '10mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Expose static uploads route
app.use('/uploads', express.static(uploadsDir));

// POST: upload raw base64 image
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      res.status(400).json({ message: 'Missing name or data' });
      return;
    }
    const buffer = Buffer.from(data, 'base64');
    const filename = `${Date.now()}-${name}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    const host = req.get('host') || 'localhost:5001';
    const protocol = req.protocol || 'http';
    res.json({ url: `${protocol}://${host}/uploads/${filename}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Root Landing Route
app.get('/', (req: Request, res: Response) => {
  res.send('My Billing Backend API is running successfully!');
});

// Root API Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// App Routes
app.use('/api/quotations', quotationRoutes);
app.use('/api/proforma-invoices', proformaRoutes);
app.use('/api/final-invoices', finalInvoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/convert', conversionRoutes);

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  
  if (err && err.name === 'ZodError') {
    res.status(400).json({
      message: 'Validation Error',
      errors: err.errors || err,
    });
    return;
  }

  res.status(500).json({
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

export default app;
