import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@procash-invoices/database/server';
import { ensureDefaultPlansSeeded, evaluatePlanPricing, attachPlanComparisons } from './subscriptionPlans';

const router = Router();

async function seedHistoricalSubscriptionsIfNeeded() {
  try {
    const tenants = await prisma.tenantProfile.findMany();
    for (const t of tenants) {
      let amount = t.subscriptionAmount;
      if (amount === null || amount === undefined) {
        if (t.tenantId === 'priya' || t.tenantId === 'rohit') {
          amount = 999;
        } else if (t.tenantId === 'demoworkspace') {
          amount = 1499;
        } else {
          const defaultMap: Record<string, number> = {
            'TRIAL': 0,
            '1_MONTH': 1499,
            '6_MONTHS': 4999,
            '1_YEAR': 9999,
            'LIFETIME': 20000,
            'FREE': 0
          };
          amount = defaultMap[t.subscriptionPlan || 'FREE'] || 0;
        }
        await prisma.tenantProfile.update({
          where: { tenantId: t.tenantId },
          data: { subscriptionAmount: amount }
        });
      }

      const historyCount = await prisma.subscriptionHistory.count({
        where: { tenantId: t.tenantId }
      });

      if (historyCount === 0 && (amount > 0 || t.subscriptionPlan !== 'FREE')) {
        const planNames: Record<string, string> = {
          '1_MONTH': 'Monthly Starter',
          '6_MONTHS': '6 Months Pro',
          '1_YEAR': '1 Year Enterprise',
          'LIFETIME': 'Lifetime Unlimited',
          'TRIAL': '10-Day Free Trial',
          'FREE': 'Free Tier'
        };
        await prisma.subscriptionHistory.create({
          data: {
            tenantId: t.tenantId,
            planId: t.subscriptionPlan || 'FREE',
            planName: planNames[t.subscriptionPlan || 'FREE'] || 'Subscription Plan',
            amount: amount,
            paymentStatus: 'VERIFIED',
            paymentMode: 'UPI',
            utrNumber: `HIST-${t.tenantId.toUpperCase()}-001`,
            startDate: t.createdAt,
            endDate: t.subscriptionExpiresAt
          }
        });
      }
    }
  } catch (err) {
    console.error('Error seeding historical subscription data:', err);
  }
}

// GET: Fetch all tenant profiles (Requires admin password query param)
router.get('/tenants', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.query;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    await seedHistoricalSubscriptionsIfNeeded();

    // Query all records using unscoped client
    const tenants = await prisma.tenantProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const updatedTenants = await Promise.all(
      tenants.map(async (t) => {
        let status = t.subscriptionStatus || 'INACTIVE';
        if (t.subscriptionExpiresAt && now > new Date(t.subscriptionExpiresAt) && status === 'ACTIVE') {
          status = 'EXPIRED';
          try {
            await prisma.tenantProfile.update({
              where: { tenantId: t.tenantId },
              data: { subscriptionStatus: 'EXPIRED' }
            });
          } catch (err) {
            console.error(`Failed to update tenant ${t.tenantId} status to EXPIRED:`, err);
          }
        }
        return {
          ...t,
          subscriptionStatus: status
        };
      })
    );

    res.json(updatedTenants);
  } catch (error) {
    next(error);
  }
});

// GET: Fetch revenue metrics, plan analytics & transaction audit ledger
router.get('/revenue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.query;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    await seedHistoricalSubscriptionsIfNeeded();

    const tenants = await prisma.tenantProfile.findMany();
    const historyLogs = await prisma.subscriptionHistory.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let totalRevenue = 0;
    historyLogs.forEach((log) => {
      if (log.paymentStatus === 'VERIFIED' || log.paymentStatus === 'MANUAL_GRANT') {
        totalRevenue += log.amount;
      }
    });

    const activePayingTenants = tenants.filter(
      (t) => (t.subscriptionStatus === 'ACTIVE' || t.subscriptionStatus === 'EXPIRED') && t.subscriptionPlan !== 'FREE' && t.subscriptionPlan !== 'TRIAL'
    );
    const activePayingCount = activePayingTenants.length;
    const freeTrialCount = tenants.filter((t) => t.subscriptionPlan === 'TRIAL').length;

    let mrr = 0;
    activePayingTenants.forEach((t) => {
      const amt = t.subscriptionAmount || 0;
      switch (t.subscriptionPlan) {
        case '1_MONTH':
          mrr += amt;
          break;
        case '6_MONTHS':
          mrr += amt / 6;
          break;
        case '1_YEAR':
          mrr += amt / 12;
          break;
        case 'LIFETIME':
          mrr += amt / 24;
          break;
      }
    });

    const arpu = activePayingCount > 0 ? totalRevenue / activePayingCount : 0;

    const planMap: Record<string, { planId: string; planName: string; totalAmount: number; count: number }> = {
      '1_MONTH': { planId: '1_MONTH', planName: 'Monthly Starter', totalAmount: 0, count: 0 },
      '6_MONTHS': { planId: '6_MONTHS', planName: '6 Months Pro', totalAmount: 0, count: 0 },
      '1_YEAR': { planId: '1_YEAR', planName: '1 Year Enterprise', totalAmount: 0, count: 0 },
      'LIFETIME': { planId: 'LIFETIME', planName: 'Lifetime Unlimited', totalAmount: 0, count: 0 },
      'TRIAL': { planId: 'TRIAL', planName: '10-Day Free Trial', totalAmount: 0, count: 0 }
    };

    historyLogs.forEach((log) => {
      if (log.paymentStatus === 'VERIFIED' || log.paymentStatus === 'MANUAL_GRANT') {
        if (!planMap[log.planId]) {
          planMap[log.planId] = { planId: log.planId, planName: log.planName, totalAmount: 0, count: 0 };
        }
        planMap[log.planId].totalAmount += log.amount;
        planMap[log.planId].count += 1;
      }
    });

    res.json({
      totalRevenue,
      mrr,
      activePayingCount,
      freeTrialCount,
      arpu,
      revenueByPlan: Object.values(planMap),
      subscriptionLogs: historyLogs
    });
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
      '1_MONTH': 1499,
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

    res.json({ success: true, message: 'Payment rejected successfully.' });
  } catch (error) {
    next(error);
  }
});

// GET: Fetch all subscription plan configurations for admin
router.get('/subscription-plans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.query;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    await ensureDefaultPlansSeeded();
    const plans = await prisma.subscriptionPlanConfig.findMany({
      orderBy: { regularPrice: 'asc' }
    });

    const evaluated = plans.map(evaluatePlanPricing);
    const compared = attachPlanComparisons(evaluated);
    res.json(compared);
  } catch (error) {
    next(error);
  }
});

// PUT: Update a subscription plan configuration (regular price, offer price, offer dates, future price)
router.put('/subscription-plans/:planId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.params;
    const {
      password,
      name,
      description,
      regularPrice,
      offerPrice,
      offerBadge,
      offerStartDate,
      offerEndDate,
      futurePrice,
      futurePriceEffectiveDate,
      isActive,
      billingCycleMonths
    } = req.body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    if (regularPrice === undefined || regularPrice === null || regularPrice < 0) {
      res.status(400).json({ message: 'Regular price must be a non-negative number.' });
      return;
    }

    const updated = await prisma.subscriptionPlanConfig.upsert({
      where: { planId },
      update: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        regularPrice: Number(regularPrice),
        offerPrice: offerPrice !== null && offerPrice !== undefined && offerPrice !== '' ? Number(offerPrice) : null,
        offerBadge: offerBadge ? String(offerBadge).trim() : null,
        offerStartDate: offerStartDate ? new Date(offerStartDate) : null,
        offerEndDate: offerEndDate ? new Date(offerEndDate) : null,
        futurePrice: futurePrice !== null && futurePrice !== undefined && futurePrice !== '' ? Number(futurePrice) : null,
        futurePriceEffectiveDate: futurePriceEffectiveDate ? new Date(futurePriceEffectiveDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        billingCycleMonths: billingCycleMonths !== undefined && billingCycleMonths !== null ? Number(billingCycleMonths) : null
      },
      create: {
        planId,
        name: name || planId,
        description: description || '',
        regularPrice: Number(regularPrice),
        offerPrice: offerPrice !== null && offerPrice !== undefined && offerPrice !== '' ? Number(offerPrice) : null,
        offerBadge: offerBadge ? String(offerBadge).trim() : null,
        offerStartDate: offerStartDate ? new Date(offerStartDate) : null,
        offerEndDate: offerEndDate ? new Date(offerEndDate) : null,
        futurePrice: futurePrice !== null && futurePrice !== undefined && futurePrice !== '' ? Number(futurePrice) : null,
        futurePriceEffectiveDate: futurePriceEffectiveDate ? new Date(futurePriceEffectiveDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        billingCycleMonths: billingCycleMonths !== undefined && billingCycleMonths !== null ? Number(billingCycleMonths) : null
      }
    });

    const evaluated = evaluatePlanPricing(updated);
    res.json(evaluated);
  } catch (error) {
    next(error);
  }
});

// POST: Instantly apply scheduled future price as regular price
router.post('/subscription-plans/:planId/apply-future', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.params;
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    const plan = await prisma.subscriptionPlanConfig.findUnique({ where: { planId } });
    if (!plan || plan.futurePrice === null || plan.futurePrice === undefined) {
      res.status(400).json({ message: 'No scheduled future price found for this plan.' });
      return;
    }

    const updated = await prisma.subscriptionPlanConfig.update({
      where: { planId },
      data: {
        regularPrice: plan.futurePrice,
        futurePrice: null,
        futurePriceEffectiveDate: null
      }
    });

    const evaluated = evaluatePlanPricing(updated);
    res.json(evaluated);
  } catch (error) {
    next(error);
  }
});

// DELETE: Clear promotional offer for a plan
router.delete('/subscription-plans/:planId/offer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.params;
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== expectedPassword) {
      res.status(401).json({ message: 'Invalid Admin Password.' });
      return;
    }

    const updated = await prisma.subscriptionPlanConfig.update({
      where: { planId },
      data: {
        offerPrice: null,
        offerBadge: null,
        offerStartDate: null,
        offerEndDate: null
      }
    });

    const evaluated = evaluatePlanPricing(updated);
    res.json(evaluated);
  } catch (error) {
    next(error);
  }
});

export default router;
