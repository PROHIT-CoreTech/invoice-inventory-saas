import { Router, Request, Response, NextFunction } from 'express';
import { invoiceSchema } from '@procash-invoices/database';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { subscriptionGuard } from '../middleware/subscriptionGuard';

const router = Router();
router.use(tenantMiddleware);
router.use(subscriptionGuard);

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
    
    let initialPaid = validatedData.paidAmount || 0;
    let paymentStatus = validatedData.paymentStatus || 'UNPAID';

    if (validatedData.status === 'PAID' || initialPaid >= totals.totalAmount) {
      paymentStatus = 'PAID';
      initialPaid = totals.totalAmount;
      validatedData.paymentDate = validatedData.paymentDate || new Date();
    } else if (initialPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
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
        paidAmount: initialPaid,
        currency: validatedData.currency,
        notes: validatedData.notes || null,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status || 'DRAFT',
        quotationRef: validatedData.quotationRef || null,
        proformaRef: validatedData.proformaRef || null,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        paymentStatus: paymentStatus,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        logoUrl: validatedData.logoUrl || null,
        tenantId: req.tenantId!,
        items: {
          create: totals.items,
        },
      },
      include: { items: true },
    });

    // Automatically create a PaymentRecord if initial payment/advance was collected
    if (initialPaid > 0) {
      await req.db.paymentRecord.create({
        data: {
          clientId: validatedData.clientRef,
          invoiceId: newInvoice.id,
          amount: initialPaid,
          type: 'PAYMENT_RECEIVED',
          paymentMode: (req.body as any).paymentMode || 'CASH',
          referenceNo: (req.body as any).paymentReference || null,
          paymentDate: newInvoice.paymentDate || new Date(),
          notes: `Initial/Advance payment collected for Invoice #${newInvoice.documentNumber}`,
          tenantId: req.tenantId!
        }
      });
    }
    
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

    // Support partial status/payment status updates (e.g., from table action dropdowns)
    if (Object.keys(req.body).length <= 4 && (req.body.status || req.body.paymentStatus || req.body.paidAmount !== undefined)) {
      const updateData: any = {};
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.paymentStatus) updateData.paymentStatus = req.body.paymentStatus;
      if (req.body.paymentDate) updateData.paymentDate = new Date(req.body.paymentDate);
      if (req.body.paidAmount !== undefined) updateData.paidAmount = req.body.paidAmount;

      // Adjust payment mapping
      if (updateData.status === 'PAID' || (updateData.paidAmount && updateData.paidAmount >= existing.totalAmount)) {
        updateData.paymentStatus = 'PAID';
        updateData.paidAmount = existing.totalAmount;
        updateData.paymentDate = updateData.paymentDate || new Date();
      }

      const updated = await req.db.invoice.update({
        where: { id: req.params.id },
        data: updateData,
        include: { items: true },
      });
      res.json(mapInvoice(updated));
      return;
    }

    const validatedData = invoiceSchema.parse(req.body);
    const totals = calculateTotals(validatedData.items);

    let updatedPaid = validatedData.paidAmount !== undefined ? validatedData.paidAmount : existing.paidAmount;
    let paymentStatus = validatedData.paymentStatus || existing.paymentStatus || 'UNPAID';
    
    if (validatedData.status === 'PAID' || updatedPaid >= totals.totalAmount) {
      paymentStatus = 'PAID';
      updatedPaid = totals.totalAmount;
      validatedData.paymentDate = validatedData.paymentDate || new Date();
    } else if (updatedPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
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
        paidAmount: updatedPaid,
        currency: validatedData.currency,
        notes: validatedData.notes || null,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status || 'DRAFT',
        quotationRef: validatedData.quotationRef || null,
        proformaRef: validatedData.proformaRef || null,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        paymentStatus: paymentStatus,
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
