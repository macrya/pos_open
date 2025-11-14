import { Router, Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';

const router = Router();

// Get all customers
router.get('/', (req: Request, res: Response) => {
  try {
    const customers = CustomerModel.getAll();
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const customer = CustomerModel.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search customers
router.get('/search/:query', (req: Request, res: Response) => {
  try {
    const customers = CustomerModel.search(req.params.query);
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', (req: Request, res: Response) => {
  try {
    const customer = CustomerModel.create(req.body);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', (req: Request, res: Response) => {
  try {
    const customer = CustomerModel.update(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add loyalty points
router.patch('/:id/loyalty', (req: Request, res: Response) => {
  try {
    const { points } = req.body;
    if (typeof points !== 'number') {
      return res.status(400).json({ error: 'Points must be a number' });
    }

    const customer = CustomerModel.addLoyaltyPoints(req.params.id, points);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = CustomerModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
