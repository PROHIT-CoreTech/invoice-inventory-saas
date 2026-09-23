import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@procash-invoices/database/server';

const router = Router();

export const DEFAULT_PLANS = [
  {
    planId: 'TRIAL',
    name: '10-Day Free Trial',
    description: 'Full feature test drive for 10 days with zero commitment',
    regularPrice: 0,
    billingCycleMonths: null,
    isActive: true
  },
  {
    planId: '1_MONTH',
    name: 'Monthly Starter',
    description: 'Flexible monthly plan for growing businesses',
    regularPrice: 999,
    billingCycleMonths: 1,
    isActive: true
  },
  {
    planId: '6_MONTHS',
    name: '6 Months Pro',
    description: 'Bi-annual subscription package with instant savings',
    regularPrice: 4999,
    billingCycleMonths: 6,
    isActive: true
  },
  {
    planId: '1_YEAR',
    name: '1 Year Enterprise',
    description: 'Maximum value & priority support for 12 complete months',
    regularPrice: 9999,
    billingCycleMonths: 12,
    isActive: true
  },
  {
    planId: 'LIFETIME',
    name: 'Lifetime Unlimited',
    description: 'Pay once, enjoy forever with zero recurring fees',
    regularPrice: 20000,
    billingCycleMonths: null,
    isActive: true
  }
];

export async function ensureDefaultPlansSeeded() {
  const count = await prisma.subscriptionPlanConfig.count();
  if (count === 0) {
    for (const plan of DEFAULT_PLANS) {
      await prisma.subscriptionPlanConfig.create({
        data: plan
      });
    }
  }
}

export function evaluatePlanPricing(plan: any) {
  const now = new Date();
  
  let regularPrice = plan.regularPrice;
  let futurePrice = plan.futurePrice;
  let futurePriceEffectiveDate = plan.futurePriceEffectiveDate;
  
  // Auto-promote future price if effective date has passed
  if (futurePrice !== null && futurePrice !== undefined && futurePriceEffectiveDate) {
    const effDate = new Date(futurePriceEffectiveDate);
    if (now >= effDate) {
      regularPrice = futurePrice;
      futurePrice = null;
      futurePriceEffectiveDate = null;
      // Fire async update to database so regular price update is persisted
      prisma.subscriptionPlanConfig.update({
        where: { planId: plan.planId },
        data: {
          regularPrice,
          futurePrice: null,
          futurePriceEffectiveDate: null
        }
      }).catch(err => console.error(`Failed to promote future price for ${plan.planId}:`, err));
    }
  }

  let offerPrice = plan.offerPrice;
  let isOfferActive = false;
  
  if (offerPrice !== null && offerPrice !== undefined && offerPrice >= 0) {
    let startValid = true;
    let endValid = true;
    if (plan.offerStartDate) {
      startValid = now >= new Date(plan.offerStartDate);
    }
    if (plan.offerEndDate) {
      endValid = now <= new Date(plan.offerEndDate);
    }
    if (startValid && endValid) {
      isOfferActive = true;
    }
  }

  const effectivePrice = isOfferActive ? offerPrice : regularPrice;
  const savingsAmount = isOfferActive ? Math.max(0, regularPrice - offerPrice) : 0;
  const savingsPercentage = isOfferActive && regularPrice > 0 ? Math.round((savingsAmount / regularPrice) * 100) : 0;

  return {
    ...plan,
    regularPrice,
    futurePrice,
    futurePriceEffectiveDate,
    effectivePrice,
    isOfferActive,
    savingsAmount,
    savingsPercentage
  };
}

// GET: Fetch all active subscription plans with dynamic pricing logic
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDefaultPlansSeeded();
    const plans = await prisma.subscriptionPlanConfig.findMany({
      where: { isActive: true }
    });

    const evaluatedPlans = plans.map(evaluatePlanPricing);
    res.json(evaluatedPlans);
  } catch (error) {
    next(error);
  }
});

export default router;
