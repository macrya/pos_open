import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/schema';
import { initializeEventBus } from './events/eventBus';
import inventoryRoutes from './routes/inventory';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and event bus
(async () => {
  try {
    await initializeDatabase();
    await initializeEventBus();
  } catch (err) {
    console.error('Failed to initialize services:', err);
    process.exit(1);
  }
})();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'inventory-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/products', inventoryRoutes);
app.use('/stock', inventoryRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`✓ Inventory Service running on http://localhost:${PORT}`);
});

export default app;
