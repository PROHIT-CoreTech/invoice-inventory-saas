import { Router, Request, Response, NextFunction } from 'express';
import { FinalInvoiceModel } from '@my-billing/database/server';
import { invoiceSchema } from '@my-billing/database';

const router = Router();

// Helper to calculate totals based on line items
const calculateTotals = (items: any[]) => {
  let subTotal = 0;
  let taxAmount = 0;
  const processedItems = items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const itemSubtotal = qty * price;
    const itemTax = itemSubtotal * (taxRate / 100);
    const itemTotal = itemSubtotal + itemTax;
    subTotal += itemSubtotal;
    taxAmount += itemTax;
    return {
      ...item,
      taxAmount: Number(itemTax.toFixed(2)),
      total: Number(itemTotal.toFixed(2)),
    };
  });
  const totalAmount = subTotal + taxAmount;
  return {
    items: processedItems,
    subTotal: Number(subTotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
};

// GET: List all final invoices
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await FinalInvoiceModel.find()
      .populate('proformaRef')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// GET: Fetch invoice by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await FinalInvoiceModel.findById(req.params.id).populate('proformaRef');
    if (!invoice) {
      res.status(404).json({ message: 'Final Invoice not found' });
      return;
    }
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// POST: Create a new final invoice
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = invoiceSchema.parse(req.body);
    const totals = calculateTotals(validatedData.items);
    
    // Automatically manage paymentStatus and paymentDate transitions
    if (validatedData.status === 'PAID') {
      validatedData.paymentStatus = 'PAID';
      validatedData.paymentDate = validatedData.paymentDate || new Date();
    }
    
    const newInvoice = new FinalInvoiceModel({
      ...validatedData,
      ...totals,
    });
    
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// PUT: Update an existing invoice
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await FinalInvoiceModel.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Final Invoice not found' });
      return;
    }

    const merged = { ...existing.toObject(), ...req.body };
    const validatedData = invoiceSchema.parse(merged);
    const totals = calculateTotals(validatedData.items);
    
    // Adjust payment mapping
    if (validatedData.status === 'PAID') {
      validatedData.paymentStatus = 'PAID';
      validatedData.paymentDate = validatedData.paymentDate || new Date();
    }

    const updated = await FinalInvoiceModel.findByIdAndUpdate(
      req.params.id,
      { ...validatedData, ...totals },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

export default router;
