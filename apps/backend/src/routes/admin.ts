import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@procash-invoices/database/server';

const router = Router();

// GET: Fetch all tenant profiles (Requires admin password query param)
router.get('/tenants', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.query;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    // Query all records using unscoped client
    const tenants = await prisma.tenantProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

// POST: Manually onboard/create a new tenant (Requires admin password)
router.post('/tenants', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      password,
      tenantId,
      companyName,
      proprietorName,
      address,
      gstin,
      pan,
      bankName,
      bankAccHolder,
      bankAccType,
      bankAccNumber,
      bankIfsc,
      bankBranch,
      theme,
      subscriptionPlan
    } = req.body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    if (!tenantId || !companyName || !address || !subscriptionPlan) {
      res.status(400).json({ message: 'Tenant ID, Company Name, Address, and Subscription Plan are required.' });
      return;
    }

    // Clean tenantId to lowercase alphanumeric only
    const cleanTenantId = tenantId.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check if tenant already exists
    const existing = await prisma.tenantProfile.findUnique({
      where: { tenantId: cleanTenantId }
    });

    if (existing) {
      res.status(400).json({ message: `Tenant with subdomain "${cleanTenantId}" already exists.` });
      return;
    }

    // Calculate expiry dates
    const PLANS: Record<string, number | null> = {
      'TRIAL': 10,
      '1_MONTH': 1,
      '6_MONTHS': 6,
      '1_YEAR': 12,
      'LIFETIME': null,
      'FREE': null
    };

    const value = PLANS[subscriptionPlan];
    let expiresAt: Date | null = null;
    if (value !== null) {
      const now = new Date();
      if (subscriptionPlan === 'TRIAL') {
        expiresAt = new Date(now.setDate(now.getDate() + 10));
      } else {
        expiresAt = new Date(now.setMonth(now.getMonth() + value));
      }
    }

    const newTenant = await prisma.tenantProfile.create({
      data: {
        tenantId: cleanTenantId,
        companyName,
        proprietorName: proprietorName || '',
        address,
        gstin: gstin || '',
        pan: pan || '',
        bankName: bankName || '',
        bankAccHolder: bankAccHolder || '',
        bankAccType: bankAccType || 'CURRENT',
        bankAccNumber: bankAccNumber || '',
        bankIfsc: bankIfsc || '',
        bankBranch: bankBranch || '',
        theme: theme || 'DEFAULT',
        tier: subscriptionPlan === 'FREE' ? 'FREE' : 'PREMIUM',
        subscriptionPlan,
        subscriptionStatus: subscriptionPlan === 'FREE' ? 'INACTIVE' : 'ACTIVE',
        subscriptionExpiresAt: expiresAt
      }
    });

    // Also log a cash payment record in the Mongoose payment tracking collection
    const amountMap: Record<string, number> = {
      'TRIAL': 0,
      '1_MONTH': 999,
      '6_MONTHS': 4999,
      '1_YEAR': 9999,
      'LIFETIME': 20000,
      'FREE': 0
    };

    try {
      const SubscriptionPayment = require('../models/SubscriptionPayment').default;
      const payment = new SubscriptionPayment({
        tenantId: cleanTenantId,
        planTier: subscriptionPlan,
        amountPaid: amountMap[subscriptionPlan] || 0,
        utrNumber: `CASH-${Date.now().toString().slice(-8)}`,
        verificationStatus: 'APPROVED',
        submittedAt: new Date()
      });
      await payment.save();
    } catch (e) {
      console.error('Failed to log cash subscription payment audit:', e);
    }

    res.json(newTenant);
  } catch (error) {
    next(error);
  }
});

// PUT: Update a tenant profile from admin side (Requires admin password)
router.put('/tenants/:tenantId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;
    const {
      password,
      companyName,
      logoUrl,
      proprietorName,
      address,
      gstin,
      pan,
      bankName,
      bankAccHolder,
      bankAccType,
      bankAccNumber,
      bankIfsc,
      bankBranch,
      signatureUrl,
      theme,
      tier
    } = req.body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    if (!companyName || !address) {
      res.status(400).json({ message: 'Company Name and Address are required fields.' });
      return;
    }

    const updated = await prisma.tenantProfile.update({
      where: { tenantId },
      data: {
        companyName,
        logoUrl: logoUrl || null,
        proprietorName: proprietorName || null,
        address,
        gstin: gstin || null,
        pan: pan || null,
        bankName: bankName || null,
        bankAccHolder: bankAccHolder || null,
        bankAccType: bankAccType || null,
        bankAccNumber: bankAccNumber || null,
        bankIfsc: bankIfsc || null,
        bankBranch: bankBranch || null,
        signatureUrl: signatureUrl || null,
        theme: theme || 'DEFAULT',
        tier: tier || 'FREE',
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// GET: Fetch all pending UPI subscription payments
router.get('/pending-payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.query;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    // Dynamic import to avoid mongoose schema validation issues on mount
    const SubscriptionPayment = require('../models/SubscriptionPayment').default;
    const pending = await SubscriptionPayment.find({ verificationStatus: 'PENDING' }).sort({ submittedAt: -1 });
    res.json(pending);
  } catch (error) {
    next(error);
  }
});

// POST: Approve a pending UPI subscription payment and activate workspace
router.post('/approve-payment/:paymentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    const SubscriptionPayment = require('../models/SubscriptionPayment').default;
    const payment = await SubscriptionPayment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ message: 'Payment record not found.' });
      return;
    }

    payment.verificationStatus = 'APPROVED';
    await payment.save();

    const PLANS: Record<string, number | null> = {
      'TRIAL': 10,
      '1_MONTH': 1,
      '6_MONTHS': 6,
      '1_YEAR': 12,
      'LIFETIME': null
    };

    const value = PLANS[payment.planTier];
    let expiresAt: Date | null = null;
    if (value !== null) {
      const now = new Date();
      if (payment.planTier === 'TRIAL') {
        expiresAt = new Date(now.setDate(now.getDate() + 10));
      } else {
        expiresAt = new Date(now.setMonth(now.getMonth() + value));
      }
    }

    // Update the corresponding TenantProfile
    await prisma.tenantProfile.update({
      where: { tenantId: payment.tenantId },
      data: {
        tier: 'PREMIUM',
        subscriptionPlan: payment.planTier,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: expiresAt
      }
    });

    res.json({ success: true, message: 'Payment approved and workspace activated successfully.' });
  } catch (error) {
    next(error);
  }
});

// POST: Reject a pending UPI subscription payment
router.post('/reject-payment/:paymentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    const SubscriptionPayment = require('../models/SubscriptionPayment').default;
    const payment = await SubscriptionPayment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ message: 'Payment record not found.' });
      return;
    }

    payment.verificationStatus = 'REJECTED';
    await payment.save();

    res.json({ success: true, message: 'Payment rejected successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
