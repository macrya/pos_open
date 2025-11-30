import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// Service URLs from environment variables
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
  INVENTORY: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8002',
  SALES: process.env.SALES_SERVICE_URL || 'http://localhost:8003',
  PAYMENT: process.env.PAYMENT_SERVICE_URL || 'http://localhost:8004',
  CUSTOMER: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:8005',
  REPORTING: process.env.REPORTING_SERVICE_URL || 'http://localhost:8006',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8007',
  RECEIPT: process.env.RECEIPT_SERVICE_URL || 'http://localhost:8008',
  USER: process.env.USER_SERVICE_URL || 'http://localhost:8009',
};

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICES),
  });
});

// API Gateway info
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'POS API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      inventory: '/api/inventory',
      sales: '/api/sales',
      payments: '/api/payments',
      customers: '/api/customers',
      reports: '/api/reports',
      notifications: '/api/notifications',
      documents: '/api/documents',
      users: '/api/users',
    },
  });
});

// Route /api/auth/* to Authentication Service (no auth required for login)
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: SERVICES.AUTH,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '',
    },
    onError: (err, req, res) => {
      console.error('Auth Service Error:', err);
      res.status(503).json({ error: 'Authentication service unavailable' });
    },
  })
);

// Protected routes - require authentication
const protectedProxy = (serviceName: keyof typeof SERVICES, pathPrefix: string) => {
  return [
    authMiddleware,
    createProxyMiddleware({
      target: SERVICES[serviceName],
      changeOrigin: true,
      pathRewrite: {
        [`^/api${pathPrefix}`]: '',
      },
      onProxyReq: (proxyReq, req: any) => {
        // Forward user information to microservices
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
      },
      onError: (err, req, res) => {
        console.error(`${serviceName} Service Error:`, err);
        res.status(503).json({ error: `${serviceName} service unavailable` });
      },
    }),
  ];
};

// Protected service routes
app.use('/api/inventory', ...protectedProxy('INVENTORY', '/inventory'));
app.use('/api/sales', ...protectedProxy('SALES', '/sales'));
app.use('/api/payments', ...protectedProxy('PAYMENT', '/payments'));
app.use('/api/customers', ...protectedProxy('CUSTOMER', '/customers'));
app.use('/api/reports', ...protectedProxy('REPORTING', '/reports'));
app.use('/api/notifications', ...protectedProxy('NOTIFICATION', '/notifications'));
app.use('/api/documents', ...protectedProxy('RECEIPT', '/documents'));
app.use('/api/users', ...protectedProxy('USER', '/users'));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Gateway Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ API Gateway running on http://localhost:${PORT}`);
  console.log(`✓ Routing to ${Object.keys(SERVICES).length} microservices`);
});

export default app;
