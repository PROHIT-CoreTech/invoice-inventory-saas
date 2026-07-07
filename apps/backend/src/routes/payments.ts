import { Router, Request, Response, NextFunction } from 'express';
import { tenantMiddleware } from '../middleware/tenantMiddleware';

const router = Router();

// Apply tenantMiddleware to ensure all requests contain X-Tenant-Id header and have req.db set
router.use(tenantMiddleware);

// Map of plan details: ID -> price, duration (months)
const PLANS: Record<string, { price: number; months: number | null; label: string }> = {
  'TRIAL': { price: 0, months: null, label: '10-Day Free Trial' },
  '1_MONTH': { price: 999, months: 1, label: 'Monthly Starter' },
  '6_MONTHS': { price: 4999, months: 6, label: 'Bi-Annual Pro' },
  '1_YEAR': { price: 9999, months: 12, label: 'Annual Enterprise' },
  'LIFETIME': { price: 20000, months: null, label: 'Lifetime Unlimited' }
};

// POST: Start 10-day free trial directly without payment gateway
router.post('/start-trial', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const existingProfile = await req.db.tenantProfile.findUnique({
      where: { tenantId }
    });

    const now = new Date();
    const subscriptionExpiresAt = new Date(now.setDate(now.getDate() + 10));

    let profile;
    if (existingProfile) {
      profile = await req.db.tenantProfile.update({
        where: { tenantId },
        data: {
          tier: 'PREMIUM',
          subscriptionPlan: 'TRIAL',
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: subscriptionExpiresAt
        }
      });
    } else {
      profile = await req.db.tenantProfile.create({
        data: {
          tenantId,
          companyName: tenantId.toUpperCase() + ' INVOICES',
          address: 'Default Billing Address',
          tier: 'PREMIUM',
          subscriptionPlan: 'TRIAL',
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: subscriptionExpiresAt
        }
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
});

// POST: Simulate payment success directly updating tenant profile
router.post('/simulate-success', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.body;
    const tenantId = req.tenantId!;

    const plan = PLANS[planId];
    if (!plan) {
      res.status(400).json({ message: 'Invalid subscription plan selected.' });
      return;
    }

    const now = new Date();
    let subscriptionExpiresAt: Date | null = null;
    if (plan.months) {
      const targetDate = new Date();
      subscriptionExpiresAt = new Date(targetDate.setMonth(targetDate.getMonth() + plan.months));
    }

    const existingProfile = await req.db.tenantProfile.findUnique({
      where: { tenantId }
    });

    let profile;
    if (existingProfile) {
      profile = await req.db.tenantProfile.update({
        where: { tenantId },
        data: {
          tier: 'PREMIUM',
          subscriptionPlan: planId,
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: subscriptionExpiresAt
        }
      });
    } else {
      profile = await req.db.tenantProfile.create({
        data: {
          tenantId,
          companyName: tenantId.toUpperCase() + ' INVOICES',
          address: 'Default Billing Address',
          tier: 'PREMIUM',
          subscriptionPlan: planId,
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: subscriptionExpiresAt
        }
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
});

// POST: Create a Cashfree PG Order
router.post('/create-order', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId, customerName, customerEmail, customerPhone } = req.body;
    const tenantId = req.tenantId!;

    const plan = PLANS[planId];
    if (!plan) {
      res.status(400).json({ message: 'Invalid subscription plan selected.' });
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      res.status(400).json({ message: 'Customer name, email, and phone number are required.' });
      return;
    }

    // Cashfree Sandbox or Production URL
    const isProd = process.env.CASHFREE_ENV === 'production';
    const cashfreeUrl = isProd 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const appId = process.env.CASHFREE_APP_ID || 'TEST10317822998f5a6b57953fe5efbc22871301';
    const secretKey = process.env.CASHFREE_SECRET_KEY || 'TEST2fa4a0815ea78dbd54e4c2f6d0f6b43d5fa6c1bb';

    // Unique order ID prefixing tenant and timestamp
    const orderId = `SUB_${tenantId.toUpperCase()}_${Date.now()}`;

    // Return URL on success
    const currentHost = req.get('host') || 'localhost:5001';
    const origin = req.headers.origin || `http://${currentHost}`;
    const returnUrl = `${origin}/payment-status?order_id={order_id}&tenant=${tenantId}`;

    const requestBody = {
      order_id: orderId,
      order_amount: plan.price,
      order_currency: 'INR',
      customer_details: {
        customer_id: `CUST_${tenantId.toUpperCase()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: returnUrl
      }
    };

    const response = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cashfree Create Order Error Details:', errorData);
      throw new Error(errorData.message || 'Failed to create payment order with Cashfree.');
    }

    const orderData = await response.json();
    
    res.json({
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id,
      orderAmount: orderData.order_amount,
      cfOrderId: orderData.cf_order_id,
      paymentStatus: orderData.order_status
    });
  } catch (error) {
    next(error);
  }
});

// POST: Verify payment and update subscription
router.post('/verify-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, planId } = req.body;
    const tenantId = req.tenantId!;

    const plan = PLANS[planId];
    if (!plan) {
      res.status(400).json({ message: 'Invalid subscription plan.' });
      return;
    }

    const isProd = process.env.CASHFREE_ENV === 'production';
    const cashfreeUrl = isProd 
      ? `https://api.cashfree.com/pg/orders/${orderId}` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const appId = process.env.CASHFREE_APP_ID || 'TEST10317822998f5a6b57953fe5efbc22871301';
    const secretKey = process.env.CASHFREE_SECRET_KEY || 'TEST2fa4a0815ea78dbd54e4c2f6d0f6b43d5fa6c1bb';

    const response = await fetch(cashfreeUrl, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retrieve payment details from Cashfree.');
    }

    const orderData = await response.json();
    
    // Cashfree order_status can be: PAID, ACTIVE, SUCCESS, or others
    const isPaid = orderData.order_status === 'PAID' || orderData.order_status === 'SUCCESS';

    if (!isPaid) {
      res.json({
        success: false,
        status: orderData.order_status,
        message: `Payment has not been completed. Status: ${orderData.order_status}`
      });
      return;
    }

    // Calculate Expiry Date
    let subscriptionExpiresAt: Date | null = null;
    if (plan.months) {
      const now = new Date();
      subscriptionExpiresAt = new Date(now.setMonth(now.getMonth() + plan.months));
    }

    // Update TenantProfile in DB
    const updatedProfile = await req.db.tenantProfile.update({
      where: { tenantId },
      data: {
        tier: 'PREMIUM',
        subscriptionPlan: planId,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: subscriptionExpiresAt
      }
    });

    res.json({
      success: true,
      status: orderData.order_status,
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

export default router;
