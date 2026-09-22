import { Router, Request, Response, NextFunction } from 'express';
import { paymentRecordSchema } from '@procash-invoices/database';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { subscriptionGuard } from '../middleware/subscriptionGuard';

const router = Router();
router.use(tenantMiddleware);
router.use(subscriptionGuard);

// GET: Fetch client ledger timeline & summary stats
router.get('/:clientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;

    const client = await req.db.client.findFirst({
      where: { id: clientId }
    });

    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    // Fetch all Final Invoices for this client
    const invoices = await req.db.invoice.findMany({
      where: { clientRef: clientId, documentType: 'FINAL_INVOICE' },
      include: { items: true },
      orderBy: { issueDate: 'asc' }
    });

    // Fetch all Payment Records for this client
    const payments = await req.db.paymentRecord.findMany({
      where: { clientId },
      orderBy: { paymentDate: 'asc' }
    });

    // Calculate Summary Totals
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const netBalanceDue = totalInvoiced - totalPaid;

    const advancePayments = payments.filter(p => p.type === 'ADVANCE_PAYMENT' || !p.invoiceId);
    const totalAdvance = advancePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Merge into chronological timeline
    interface LedgerEntry {
      id: string;
      date: Date;
      type: 'INVOICE' | 'PAYMENT' | 'ADVANCE_PAYMENT' | 'REFUND';
      documentNumber?: string;
      invoiceId?: string;
      paymentMode?: string;
      referenceNo?: string;
      debit: number;   // Invoice amount added to balance
      credit: number;  // Payment amount subtracted from balance
      runningBalance: number;
      notes?: string | null;
      status?: string | null;
    }

    const timeline: LedgerEntry[] = [];

    invoices.forEach(inv => {
      timeline.push({
        id: inv.id,
        date: new Date(inv.issueDate),
        type: 'INVOICE',
        documentNumber: inv.documentNumber,
        invoiceId: inv.id,
        debit: inv.totalAmount || 0,
        credit: 0,
        runningBalance: 0, // calculated below after sorting
        notes: inv.notes,
        status: inv.paymentStatus || inv.status
      });
    });

    payments.forEach(p => {
      const isAdvance = p.type === 'ADVANCE_PAYMENT' || !p.invoiceId;
      timeline.push({
        id: p.id,
        date: new Date(p.paymentDate),
        type: isAdvance ? 'ADVANCE_PAYMENT' : 'PAYMENT',
        referenceNo: p.referenceNo || undefined,
        invoiceId: p.invoiceId || undefined,
        paymentMode: p.paymentMode,
        debit: p.type === 'REFUND' ? p.amount : 0,
        credit: p.type === 'REFUND' ? 0 : p.amount,
        runningBalance: 0,
        notes: p.notes
      });
    });

    // Sort chronologically by date
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Compute running balance
    let currentBalance = 0;
    timeline.forEach(entry => {
      currentBalance = currentBalance + entry.debit - entry.credit;
      entry.runningBalance = Number(currentBalance.toFixed(2));
    });

    res.json({
      client,
      summary: {
        totalInvoiced: Number(totalInvoiced.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        netBalanceDue: Number(netBalanceDue.toFixed(2)),
        totalAdvance: Number(totalAdvance.toFixed(2))
      },
      entries: timeline
    });
  } catch (error) {
    next(error);
  }
});

// POST: Record a Payment or Advance Payment for a Client
router.post('/payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = paymentRecordSchema.parse(req.body);

    // Verify Client exists
    const client = await req.db.client.findFirst({
      where: { id: validatedData.clientId }
    });

    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    // Create Payment Record
    const paymentRecord = await req.db.paymentRecord.create({
      data: {
        clientId: validatedData.clientId,
        invoiceId: validatedData.invoiceId || null,
        amount: validatedData.amount,
        type: validatedData.type || (validatedData.invoiceId ? 'PAYMENT_RECEIVED' : 'ADVANCE_PAYMENT'),
        paymentMode: validatedData.paymentMode || 'CASH',
        referenceNo: validatedData.referenceNo || null,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : new Date(),
        notes: validatedData.notes || null,
        tenantId: req.tenantId!
      }
    });

    // If payment is attached to a specific invoice, update the invoice's paidAmount & paymentStatus
    if (validatedData.invoiceId) {
      const invoice = await req.db.invoice.findFirst({
        where: { id: validatedData.invoiceId }
      });

      if (invoice) {
        const newPaidAmount = Number(((invoice.paidAmount || 0) + validatedData.amount).toFixed(2));
        let newPaymentStatus = 'PARTIALLY_PAID';
        if (newPaidAmount >= (invoice.totalAmount || 0)) {
          newPaymentStatus = 'PAID';
        }

        await req.db.invoice.update({
          where: { id: validatedData.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
            paymentDate: new Date()
          }
        });
      }
    }

    res.status(201).json(paymentRecord);
  } catch (error) {
    next(error);
  }
});

// DELETE: Void / Delete a payment record
router.delete('/payment/:paymentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;

    const existingPayment = await req.db.paymentRecord.findFirst({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      res.status(404).json({ message: 'Payment record not found' });
      return;
    }

    // If tied to an invoice, revert paid amount on invoice
    if (existingPayment.invoiceId) {
      const invoice = await req.db.invoice.findFirst({
        where: { id: existingPayment.invoiceId }
      });

      if (invoice) {
        const newPaidAmount = Math.max(0, Number(((invoice.paidAmount || 0) - existingPayment.amount).toFixed(2)));
        let newPaymentStatus = 'UNPAID';
        if (newPaidAmount >= (invoice.totalAmount || 0) && newPaidAmount > 0) {
          newPaymentStatus = 'PAID';
        } else if (newPaidAmount > 0) {
          newPaymentStatus = 'PARTIALLY_PAID';
        }

        await req.db.invoice.update({
          where: { id: existingPayment.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus
          }
        });
      }
    }

    await req.db.paymentRecord.delete({
      where: { id: paymentId }
    });

    res.json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
