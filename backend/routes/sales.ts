import { Router, Request, Response } from 'express';
import { SaleModel } from '../models/Sale';

const router = Router();

// Get all sales
router.get('/', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const sales = SaleModel.getAll(limit);
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get sale by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const sale = SaleModel.getById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by date range
router.get('/range/:startDate/:endDate', (req: Request, res: Response) => {
  try {
    const sales = SaleModel.getByDateRange(req.params.startDate, req.params.endDate);
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales statistics
router.get('/stats/summary', (req: Request, res: Response) => {
  try {
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const stats = SaleModel.getSalesStats(startDate, endDate);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get top selling products
router.get('/stats/top-products', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const products = SaleModel.getTopProducts(limit, startDate, endDate);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new sale
router.post('/', (req: Request, res: Response) => {
  try {
    const sale = SaleModel.create(req.body);
    res.status(201).json(sale);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
