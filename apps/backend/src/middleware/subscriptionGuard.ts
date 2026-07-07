import { Request, Response, NextFunction } from 'express';

export const subscriptionGuard = (req: Request, res: Response, next: NextFunction) => {
  // Allow all read-only calls (GET)
  if (req.method === 'GET') {
    next();
    return;
  }

  // Reject write operations (POST, PUT, DELETE) if subscription is expired
  if (req.subscriptionStatus === 'EXPIRED') {
    res.status(403).json({
      message: 'Subscription Expired: Your workspace is in Read-Only Mode. Please renew your subscription to perform this action.'
    });
    return;
  }

  next();
};
