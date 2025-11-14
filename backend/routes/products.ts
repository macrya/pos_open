import { Router, Request, Response } from 'express';
import { ProductModel } from '../models/Product';

const router = Router();

// Get all products
router.get('/', (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const products = ProductModel.getAll(includeInactive);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const product = ProductModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search products
router.get('/search/:query', (req: Request, res: Response) => {
  try {
    const products = ProductModel.search(req.params.query);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get('/category/:category', (req: Request, res: Response) => {
  try {
    const products = ProductModel.getByCategory(req.params.category);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products
router.get('/alerts/low-stock', (req: Request, res: Response) => {
  try {
    const products = ProductModel.getLowStock();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', (req: Request, res: Response) => {
  try {
    const product = ProductModel.create(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update product
router.put('/:id', (req: Request, res: Response) => {
  try {
    const product = ProductModel.update(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update stock
router.patch('/:id/stock', (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Quantity must be a number' });
    }

    const product = ProductModel.updateStock(req.params.id, quantity);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = ProductModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
