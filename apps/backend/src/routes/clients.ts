import { Router, Request, Response, NextFunction } from 'express';
import { clientSchema } from '@procash-invoices/database';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import { subscriptionGuard } from '../middleware/subscriptionGuard';

const router = Router();

// Apply the tenantMiddleware to all client routes
router.use(tenantMiddleware);
router.use(subscriptionGuard);

// POST: Register a new Client in the master list
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = clientSchema.parse(req.body);
    
    // Check if email already registered
    const exists = await req.db.client.findUnique({
      where: { email: validatedData.email }
    });
    if (exists) {
      res.status(400).json({ message: 'Client with this email already exists' });
      return;
    }

    const newClient = await req.db.client.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        billingAddress: validatedData.billingAddress,
        taxId: validatedData.taxId,
        gstin: validatedData.gstin || null,
        pan: validatedData.pan || null,
        tenantId: req.tenantId!,
      }
    });
    
    res.status(201).json(newClient);
  } catch (error) {
    next(error);
  }
});

// GET: List all clients in the master list (sorted alphabetically)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await req.db.client.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

// GET: Search clients by query (case-insensitive search for autocomplete dropdowns)
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Query parameter is required' });
      return;
    }

    const clients = await req.db.client.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        billingAddress: true,
        taxId: true,
        gstin: true,
        pan: true,
      }
    });

    res.json(clients);
  } catch (error) {
    next(error);
  }
});

export default router;
