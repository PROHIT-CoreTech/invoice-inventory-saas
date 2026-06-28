import { Router, Request, Response, NextFunction } from 'express';
import { ProformaInvoiceModel } from '@my-billing/database/server';
import { proformaSchema } from '@my-billing/database';

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

// GET: List all proformas
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proformas = await ProformaInvoiceModel.find()
      .populate('quotationRef')
      .sort({ createdAt: -1 });
    res.json(proformas);
  } catch (error) {
    next(error);
  }
});

// GET: Fetch proforma by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proforma = await ProformaInvoiceModel.findById(req.params.id).populate('quotationRef');
    if (!proforma) {
      res.status(404).json({ message: 'Proforma Invoice not found' });
      return;
    }
    res.json(proforma);
  } catch (error) {
    next(error);
  }
});

// POST: Create a new proforma
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = proformaSchema.parse(req.body);
    const totals = calculateTotals(validatedData.items);
    
    const newProforma = new ProformaInvoiceModel({
      ...validatedData,
      ...totals,
    });
    
    await newProforma.save();
    res.status(201).json(newProforma);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// PUT: Update an existing proforma
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await ProformaInvoiceModel.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Proforma Invoice not found' });
      return;
    }

    const merged = { ...existing.toObject(), ...req.body };
    const validatedData = proformaSchema.parse(merged);
    const totals = calculateTotals(validatedData.items);
    
    const updated = await ProformaInvoiceModel.findByIdAndUpdate(
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
