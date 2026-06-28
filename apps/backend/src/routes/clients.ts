import { Router, Request, Response, NextFunction } from 'express';
import { ClientModel } from '@my-billing/database/server';
import { clientSchema } from '@my-billing/database';

const router = Router();

// POST: Register a new Client in the master list
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = clientSchema.parse(req.body);
    
    // Check if email already registered
    const exists = await ClientModel.findOne({ email: validatedData.email });
    if (exists) {
      res.status(400).json({ message: 'Client with this email already exists' });
      return;
    }

    const newClient = new ClientModel(validatedData);
    await newClient.save();
    
    res.status(201).json(newClient);
  } catch (error) {
    next(error);
  }
});

// GET: List all clients in the master list (sorted alphabetically)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await ClientModel.find().sort({ name: 1 });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

// GET: Search clients by query (case-insensitive regex for autocomplete dropdowns)
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Query parameter is required' });
      return;
    }

    // Escape special regex characters in user input
    const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // Case-insensitive regex match on name or email fields
    const clients = await ClientModel.find({
      $or: [
        { name: { $regex: escapedQuery, $options: 'i' } },
        { email: { $regex: escapedQuery, $options: 'i' } }
      ]
    })
    .limit(5) // Limit to 5 results for dropdown performance
    .select('name email billingAddress taxId gstin pan'); // Select only required fields

    res.json(clients);
  } catch (error) {
    next(error);
  }
});

export default router;
