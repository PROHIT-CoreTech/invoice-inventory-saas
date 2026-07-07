import { Router, Request, Response, NextFunction } from 'express';
import SubscriptionPayment from '../models/SubscriptionPayment';
import { tenantMiddleware } from '../middleware/tenantMiddleware';

const router = Router();

// Apply tenantMiddleware to ensure x-tenant-id is verified
router.use(tenantMiddleware);

// POST: Submit a self-serve UPI payment UTR for tracking and manual activation
router.post('/submit-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planTier, amountPaid, utrNumber } = req.body;
    const tenantId = req.tenantId!;

    if (!planTier || amountPaid === undefined || !utrNumber) {
      res.status(400).json({ message: 'Plan tier, amount paid, and 12-digit UTR number are required.' });
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      res.status(400).json({ message: 'UTR number must be exactly a 12-digit numeric string.' });
      return;
    }

    // Check for duplicate UTR number across all payments
    const existingPayment = await SubscriptionPayment.findOne({ utrNumber: cleanUtr });
    if (existingPayment) {
      res.status(400).json({ 
        message: 'This UTR Ref / Transaction number has already been submitted. If this is an error, please contact support.' 
      });
      return;
    }

    // Create the transaction block in MongoDB
    const payment = new SubscriptionPayment({
      tenantId,
      planTier,
      amountPaid: Number(amountPaid),
      utrNumber: cleanUtr,
      verificationStatus: 'PENDING',
      submittedAt: new Date()
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment verification is processing. Your workspace dashboard activation is being verified by our ledger team.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
