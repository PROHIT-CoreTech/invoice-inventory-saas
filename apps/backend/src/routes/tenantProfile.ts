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
      signatureUrl,
      theme,
      tier
    } = req.body;

    if (!companyName || !address) {
      res.status(400).json({ message: 'Company Name and Address are required fields.' });
      return;
    }

    const existingProfile = await req.db.tenantProfile.findUnique({
      where: { tenantId: req.tenantId! }
    });

    let profile;
    if (existingProfile) {
      // Client-side update: Do not allow updating theme and tier
      profile = await req.db.tenantProfile.update({
        where: { tenantId: req.tenantId! },
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
        }
      });
    } else {
      // First-time onboarding: Theme and tier can be initialized
      profile = await req.db.tenantProfile.create({
        data: {
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
          theme: theme || 'DEFAULT',
          tier: tier || 'FREE',
        }
      });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
