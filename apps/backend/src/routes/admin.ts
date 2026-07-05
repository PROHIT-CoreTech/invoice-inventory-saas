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

export default router;
