import { Request, Response, NextFunction } from 'express';
import { getTenantPrisma, TenantPrismaClient } from '@procash-invoices/database/server';

// Extend Express Request type definitions to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      db: TenantPrismaClient;
    }
  }
}

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
  
  next();
};
