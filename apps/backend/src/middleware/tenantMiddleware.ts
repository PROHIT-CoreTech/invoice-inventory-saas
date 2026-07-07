import { Request, Response, NextFunction } from 'express';
import { getTenantPrisma, TenantPrismaClient } from '@procash-invoices/database/server';

// Extend Express Request type definitions to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      db: TenantPrismaClient;
      subscriptionStatus?: string;
    }
  }
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Extract tenant ID from the custom X-Tenant-Id header
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId || typeof tenantId !== 'string') {
    res.status(400).json({ 
      message: 'Multi-tenancy verification failed: X-Tenant-Id HTTP header is required.' 
    });
    return;
  }

  // Bind tenant info and the auto-scoped database client to this request
  req.tenantId = tenantId;
  req.db = getTenantPrisma(tenantId);
  
  try {
    const profile = await req.db.tenantProfile.findUnique({
      where: { tenantId }
    });

    if (profile) {
      let currentStatus = profile.subscriptionStatus || 'INACTIVE';

      // Auto-expire if subscriptionExpiresAt is in the past and status is ACTIVE
      if (profile.subscriptionExpiresAt && new Date() > new Date(profile.subscriptionExpiresAt) && currentStatus === 'ACTIVE') {
        currentStatus = 'EXPIRED';
        await req.db.tenantProfile.update({
          where: { tenantId },
          data: { subscriptionStatus: 'EXPIRED' }
        });
      }

      req.subscriptionStatus = currentStatus;
    } else {
      req.subscriptionStatus = 'FREE';
    }
  } catch (error) {
    console.error('Failed to verify tenant subscription expiration:', error);
    req.subscriptionStatus = 'FREE';
  }

  next();
};
