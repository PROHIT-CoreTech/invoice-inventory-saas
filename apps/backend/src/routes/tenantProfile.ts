import { Router, Request, Response, NextFunction } from 'express';
import { tenantMiddleware } from '../middleware/tenantMiddleware';

const router = Router();
router.use(tenantMiddleware);

// GET: Fetch tenant profile
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await req.db.tenantProfile.findUnique({
      where: { tenantId: req.tenantId! }
    });
    
    // Return null instead of 404 so client knows onboarding is needed without triggering global error handlers
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// POST: Create or update tenant profile
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
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
      signatureUrl
    } = req.body;

    if (!companyName || !address) {
      res.status(400).json({ message: 'Company Name and Address are required fields.' });
      return;
    }

    const profile = await req.db.tenantProfile.upsert({
      where: { tenantId: req.tenantId! },
      update: {
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
      },
      create: {
        tenantId: req.tenantId!,
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
      }
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
