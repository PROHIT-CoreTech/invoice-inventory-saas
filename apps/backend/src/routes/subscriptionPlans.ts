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
  for (const plan of DEFAULT_PLANS) {
    const existing = await prisma.subscriptionPlanConfig.findFirst({
      where: { planId: plan.planId }
    });
    if (!existing) {
      await prisma.subscriptionPlanConfig.create({
        data: plan
      });
    }
  }

  // Deduplicate any accidental duplicate records in DB
  const allPlans = await prisma.subscriptionPlanConfig.findMany();
  const seenPlanIds = new Set<string>();
  for (const p of allPlans) {
    if (seenPlanIds.has(p.planId)) {
      await prisma.subscriptionPlanConfig.delete({ where: { id: p.id } }).catch(() => {});
    } else {
      seenPlanIds.add(p.planId);
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
      }).catch((err: any) => console.error(`Failed to promote future price for ${plan.planId}:`, err));
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

export function attachPlanComparisons(plans: any[]) {
  const monthlyPlan = plans.find(p => p.planId === '1_MONTH') || plans.find(p => p.billingCycleMonths === 1);
  const monthlyBaselineRate = monthlyPlan ? monthlyPlan.effectivePrice : 1499;

  return plans.map(plan => {
    let monthlyEquivalentPrice: number | null = null;
    let savingsVsMonthlyAmount = 0;
    let savingsVsMonthlyPercentage = 0;
    let comparedToMonthlyText = '';
    let isBestValue = false;

    if (plan.planId === 'TRIAL' || plan.regularPrice === 0) {
      monthlyEquivalentPrice = 0;
      comparedToMonthlyText = '100% Free 10-Day Trial';
    } else if (plan.planId === '1_MONTH' || plan.billingCycleMonths === 1) {
      monthlyEquivalentPrice = plan.effectivePrice;
      comparedToMonthlyText = 'Standard Monthly Baseline Rate';
    } else if (plan.billingCycleMonths && plan.billingCycleMonths > 1) {
      const months = plan.billingCycleMonths;
      monthlyEquivalentPrice = Math.round(plan.effectivePrice / months);
      const fullMonthlyCostForPeriod = monthlyBaselineRate * months;
      savingsVsMonthlyAmount = Math.max(0, fullMonthlyCostForPeriod - plan.effectivePrice);
      savingsVsMonthlyPercentage = fullMonthlyCostForPeriod > 0 
        ? Math.round((savingsVsMonthlyAmount / fullMonthlyCostForPeriod) * 100)
        : 0;

      if (months === 12) {
        isBestValue = true;
        comparedToMonthlyText = `Save ${savingsVsMonthlyPercentage}% (₹${savingsVsMonthlyAmount.toLocaleString('en-IN')}/yr) vs Monthly Starter`;
      } else {
        comparedToMonthlyText = `Save ${savingsVsMonthlyPercentage}% (₹${savingsVsMonthlyAmount.toLocaleString('en-IN')}) vs Monthly Starter`;
      }
    } else if (plan.planId === 'LIFETIME' || plan.billingCycleMonths === null) {
      monthlyEquivalentPrice = null;
      const breakEvenMonths = monthlyBaselineRate > 0 
        ? (plan.effectivePrice / monthlyBaselineRate).toFixed(1)
        : '16.7';
      savingsVsMonthlyPercentage = 100;
      comparedToMonthlyText = `Pays for itself in ~${breakEvenMonths} months (Zero recurring fees forever)`;
    }

    return {
      ...plan,
      monthlyBaselineRate,
      monthlyEquivalentPrice,
      savingsVsMonthlyAmount,
      savingsVsMonthlyPercentage,
      comparedToMonthlyText,
      isBestValue
    };
  });
}

// GET: Fetch all subscription plans with dynamic pricing logic & comparisons (including isActive state)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDefaultPlansSeeded();
    const plans = await prisma.subscriptionPlanConfig.findMany({
      orderBy: { regularPrice: 'asc' }
    });

    const evaluatedPlans = plans.map(evaluatePlanPricing);
    const comparedPlans = attachPlanComparisons(evaluatedPlans);
    res.json(comparedPlans);
  } catch (error) {
    next(error);
  }
});

export default router;
