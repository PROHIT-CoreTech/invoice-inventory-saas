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

export default router;
