import { Router, Request, Response, NextFunction } from 'express';
import { QuotationModel } from '@my-billing/database/server';
import { quotationSchema } from '@my-billing/database';

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

// GET: List all quotations
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quotations = await QuotationModel.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    next(error);
  }
});

// GET: Fetch quotation details by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quotation = await QuotationModel.findById(req.params.id);
    if (!quotation) {
       res.status(404).json({ message: 'Quotation not found' });
       return;
    }
    res.json(quotation);
  } catch (error) {
    next(error);
  }
});

// POST: Create a new quotation
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = quotationSchema.parse(req.body);
    
    // Calculate values server-side
    const totals = calculateTotals(validatedData.items);
    
    const newQuotation = new QuotationModel({
      ...validatedData,
      ...totals,
    });
    
    await newQuotation.save();
    res.status(201).json(newQuotation);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// PUT: Update an existing quotation
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await QuotationModel.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Quotation not found' });
      return;
    }

    // Merge updates and validate
    const merged = { ...existing.toObject(), ...req.body };
    const validatedData = quotationSchema.parse(merged);
    
    // Recalculate totals
    const totals = calculateTotals(validatedData.items);
    
    const updated = await QuotationModel.findByIdAndUpdate(
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
