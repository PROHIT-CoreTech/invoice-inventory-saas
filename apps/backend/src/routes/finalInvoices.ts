import { Router, Request, Response, NextFunction } from 'express';
import { invoiceSchema } from '@procash-invoices/database';
import { tenantMiddleware } from '../middleware/tenantMiddleware';

const router = Router();
router.use(tenantMiddleware);

// Helper to calculate totals based on line items
const calculateTotals = (items: any[]) => {
  let subTotal = 0;
  let taxAmount = 0;
  const processedItems = items.map((item) => {
    const qty = (item.quantity !== undefined && item.quantity !== null) ? Number(item.quantity) : 1;
    const price = Number(item.price) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const discountPercent = Number(item.discountPercent) || 0;
    const baseValue = qty * price;
    const discountAmt = baseValue * (discountPercent / 100);
    const itemSubtotal = baseValue - discountAmt;
    const itemTax = itemSubtotal * (taxRate / 100);
    const itemTotal = itemSubtotal + itemTax;
    subTotal += itemSubtotal;
    taxAmount += itemTax;
    return {
      description: item.description,
      quantity: item.quantity !== undefined ? Number(item.quantity) : null,
      price: Number(item.price),
      taxRate: Number(item.taxRate) || 0,
      hsnSac: item.hsnSac || '998311',
      discountPercent,
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

const mapInvoice = (inv: any) => {
  if (!inv) return null;
  return {
    ...inv,
    clientInfo: typeof inv.clientInfo === 'string' ? JSON.parse(inv.clientInfo) : inv.clientInfo,
  };
};

// GET: List all final invoices
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await req.db.invoice.findMany({
      where: { documentType: 'FINAL_INVOICE' },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices.map(mapInvoice));
  } catch (error) {
    next(error);
  }
});

// GET: Fetch invoice by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await req.db.invoice.findFirst({
      where: { id: req.params.id, documentType: 'FINAL_INVOICE' },
      include: { items: true },
    });
    if (!invoice) {
      res.status(404).json({ message: 'Final Invoice not found' });
      return;
    }
    res.json(mapInvoice(invoice));
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
    
    const newInvoice = await req.db.invoice.create({
      data: {
        documentType: 'FINAL_INVOICE',
        documentNumber: validatedData.documentNumber,
        clientRef: validatedData.clientRef,
        clientInfo: JSON.stringify(validatedData.clientInfo),
        subTotal: totals.subTotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        currency: validatedData.currency,
        notes: validatedData.notes || null,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status || 'DRAFT',
        quotationRef: validatedData.quotationRef || null,
        proformaRef: validatedData.proformaRef || null,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        paymentStatus: validatedData.paymentStatus || null,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        logoUrl: validatedData.logoUrl || null,
        tenantId: req.tenantId!,
        items: {
          create: totals.items,
        },
      },
      include: { items: true },
    });
    
    res.status(201).json(mapInvoice(newInvoice));
  } catch (error) {
    next(error);
  }
});

// PUT: Update an existing invoice
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await req.db.invoice.findFirst({
      where: { id: req.params.id, documentType: 'FINAL_INVOICE' },
    });
    if (!existing) {
      res.status(404).json({ message: 'Final Invoice not found' });
      return;
    }

    const validatedData = invoiceSchema.parse(req.body);
    const totals = calculateTotals(validatedData.items);
    
    // Adjust payment mapping
    if (validatedData.status === 'PAID') {
      validatedData.paymentStatus = 'PAID';
      validatedData.paymentDate = validatedData.paymentDate || new Date();
    }

    // Delete existing line items
    await req.db.lineItem.deleteMany({
      where: { invoiceId: req.params.id },
    });

    const updated = await req.db.invoice.update({
      where: { id: req.params.id },
      data: {
        documentNumber: validatedData.documentNumber,
        clientRef: validatedData.clientRef,
        clientInfo: JSON.stringify(validatedData.clientInfo),
        subTotal: totals.subTotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        currency: validatedData.currency,
        notes: validatedData.notes || null,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status || 'DRAFT',
        quotationRef: validatedData.quotationRef || null,
        proformaRef: validatedData.proformaRef || null,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        paymentStatus: validatedData.paymentStatus || null,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        logoUrl: validatedData.logoUrl || null,
        items: {
          create: totals.items,
        },
      },
      include: { items: true },
    });
    
    res.json(mapInvoice(updated));
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete a final invoice by ID
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await req.db.invoice.findFirst({
      where: { id: req.params.id, documentType: 'FINAL_INVOICE' },
    });
    if (!existing) {
      res.status(404).json({ message: 'Final Invoice not found' });
      return;
    }

    await req.db.invoice.delete({
      where: { id: req.params.id },
    });
    
    res.json({ message: 'Final Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
