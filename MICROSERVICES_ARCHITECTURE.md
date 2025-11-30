# POS System - Microservices Architecture Implementation

## Overview

This POS system has been refactored into a scalable microservices architecture with the following services:

- **API Gateway** (Port 8000) - Single entry point for all client requests
- **Authentication Service** (Port 8001) - User authentication and JWT management
- **Inventory Service** (Port 8002) - Product and stock management
- **Sales Service** (Port 8003) - Sales transaction management
- **Payment Service** (Port 8004) - Payment processing and M-Pesa integration
- **Customer Service** (Port 8005) - Customer relationship management
- **Reporting Service** (Port 8006) - Business intelligence and analytics
- **Notification Service** (Port 8007) - SMS, email, and in-app notifications
- **Receipt Service** (Port 8008) - Document generation and printing
- **User Management Service** (Port 8009) - Staff and user administration

## Architecture Components

### Infrastructure

- **PostgreSQL** - Relational database (separate database per service)
- **Redis** - Caching layer
- **RabbitMQ** - Event bus for inter-service communication
- **Docker** - Containerization
- **Kubernetes** - Container orchestration (production)

### Communication Patterns

1. **Synchronous**: REST APIs through API Gateway
2. **Asynchronous**: Event-driven via RabbitMQ

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- RabbitMQ (for local development)

### Running with Docker Compose

```bash
# 1. Clone the repository
git clone <repository-url>
cd pos_open

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your configurations

# 3. Build and start all services
docker-compose up --build

# 4. Access the services:
# - Frontend: http://localhost:3000
# - API Gateway: http://localhost:8000
# - RabbitMQ Management: http://localhost:15672 (user: pos_user, pass: pos_password)
```

### Running Services Locally (Development)

Each service can be run independently for development:

```bash
# Install dependencies for shared libraries
cd shared
npm install
npm run build

# Install and run API Gateway
cd ../services/api-gateway
npm install
npm run dev

# Install and run Auth Service
cd ../auth-service
npm install
npm run dev

# Install and run Inventory Service
cd ../inventory-service
npm install
npm run dev

# ... repeat for other services
```

## Service Details

### 1. API Gateway (Port 8000)

**Responsibilities:**
- Request routing to microservices
- JWT token validation
- Rate limiting
- Load balancing

**Key Endpoints:**
- `/api/auth/*` → Auth Service
- `/api/inventory/*` → Inventory Service
- `/api/sales/*` → Sales Service
- `/api/payments/*` → Payment Service
- `/api/customers/*` → Customer Service
- `/api/reports/*` → Reporting Service
- `/api/notifications/*` → Notification Service
- `/api/documents/*` → Receipt Service
- `/api/users/*` → User Management Service

**Environment Variables:**
```env
PORT=8000
JWT_SECRET=your-secret
AUTH_SERVICE_URL=http://localhost:8001
INVENTORY_SERVICE_URL=http://localhost:8002
...
```

### 2. Authentication Service (Port 8001)

**Responsibilities:**
- User login/logout
- JWT token generation and validation
- Session management
- Role-based access control (RBAC)

**Database:** `pos_auth` (PostgreSQL)

**API Endpoints:**
```
POST /login - User login
POST /logout - User logout
POST /refresh - Refresh access token
GET /validate - Validate token
POST /register - Register new user (admin only)
```

**Default Credentials:**
- Email: `admin@pos.com`
- Password: `admin123`

### 3. Inventory Service (Port 8002)

**Responsibilities:**
- Product CRUD operations
- Stock level tracking
- Low stock alerts
- Product categorization
- Barcode management

**Database:** `pos_inventory` (PostgreSQL)

**API Endpoints:**
```
GET /products - Get all products
GET /products/:id - Get product by ID
GET /products/search/:query - Search products
GET /alerts/low-stock - Get low stock products
POST /products - Create product
PUT /products/:id - Update product
POST /stock/adjust - Adjust stock levels
GET /stock/:productId - Get product stock
DELETE /products/:id - Delete product
```

**Events Published:**
- `product.created`
- `product.updated`
- `stock.low`
- `stock.adjusted`

### 4. Sales Service (Port 8003)

**Responsibilities:**
- Create and process sales
- Transaction history
- Sales analytics
- Refunds and returns

**Database:** `pos_sales` (PostgreSQL)

**API Endpoints:**
```
POST /transactions - Create new sale
GET /transactions/:id - Get sale by ID
GET /history - Get sales history
POST /refund - Process refund
GET /reports/daily - Daily sales report
```

**Events Published:**
- `sale.completed`
- `sale.refunded`

**Events Consumed:**
- `payment.confirmed`

### 5. Payment Service (Port 8004)

**Responsibilities:**
- M-Pesa STK Push integration
- Cash payment recording
- Payment status tracking
- Payment reconciliation

**Database:** `pos_payments` (PostgreSQL)

**API Endpoints:**
```
POST /mpesa/stk-push - Initiate M-Pesa payment
POST /mpesa/callback - M-Pesa callback handler
POST /cash - Record cash payment
GET /:transactionId - Get payment details
GET /status/:id - Get payment status
```

**Events Published:**
- `payment.initiated`
- `payment.confirmed`
- `payment.failed`

**M-Pesa Configuration:**
```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback
```

### 6. Customer Service (Port 8005)

**Responsibilities:**
- Customer profiles
- Purchase history
- Loyalty programs
- Credit management

**Database:** `pos_customers` (PostgreSQL)

**Events Consumed:**
- `sale.completed`

## Event-Driven Architecture

### Event Bus (RabbitMQ)

All microservices communicate asynchronously through RabbitMQ using a topic exchange.

**Exchange:** `pos_events` (type: topic)

**Event Types:**
- `product.created`
- `product.updated`
- `stock.low`
- `stock.adjusted`
- `sale.completed`
- `sale.refunded`
- `payment.initiated`
- `payment.confirmed`
- `payment.failed`

**Example Event Flow - Complete Sale:**
```
1. Client → API Gateway → Sales Service: Create sale
2. Sales Service → Inventory Service: Check stock (REST)
3. Sales Service → Payment Service: Process payment (REST)
4. Payment Service → M-Pesa API: Initiate STK Push
5. M-Pesa → Payment Service: Payment callback
6. Payment Service → Event Bus: Publish payment.confirmed
7. Sales Service (listening) → Update sale status
8. Sales Service → Event Bus: Publish sale.completed
9. Inventory Service (listening) → Reduce stock
10. Customer Service (listening) → Update purchase history
11. Notification Service (listening) → Send SMS receipt
```

## Database Strategy

Each microservice has its own PostgreSQL database:

- `pos_auth` - Authentication Service
- `pos_inventory` - Inventory Service
- `pos_sales` - Sales Service
- `pos_payments` - Payment Service
- `pos_customers` - Customer Service
- `pos_reporting` - Reporting Service
- `pos_notifications` - Notification Service
- `pos_users` - User Management Service

**Benefits:**
- Service independence
- Technology flexibility
- Better scalability
- Isolated failures

## Security

### Authentication & Authorization
- JWT-based authentication
- Tokens validated at API Gateway
- Role-based access control (admin, manager, cashier)
- Secure password hashing (bcrypt)

### Network Security
- TLS/SSL encryption in transit
- Internal service-to-service communication via private network
- API Gateway as single public entry point

### Secrets Management
- Environment variables for sensitive data
- Never commit secrets to version control
- Use secrets management systems in production (Vault, AWS Secrets Manager)

## Monitoring & Logging

### Logging
- Structured logging with timestamps
- Service name in all log entries
- Log levels: DEBUG, INFO, WARN, ERROR

### Health Checks
- Each service exposes `/health` endpoint
- Docker Compose health checks configured
- Kubernetes liveness/readiness probes

## Deployment

### Development
```bash
docker-compose up
```

### Staging/Production

1. **Build Images:**
```bash
docker-compose build
```

2. **Push to Registry:**
```bash
docker tag pos_api_gateway:latest registry.example.com/pos_api_gateway:latest
docker push registry.example.com/pos_api_gateway:latest
```

3. **Deploy to Kubernetes:**
```bash
kubectl apply -f infrastructure/kubernetes/
```

### Environment-Specific Configuration

Create environment-specific `.env` files:
- `.env.development`
- `.env.staging`
- `.env.production`

## Scaling Strategy

### Horizontal Scaling
- Scale services independently based on load
- Use Kubernetes HPA (Horizontal Pod Autoscaler)

Example:
```bash
kubectl scale deployment inventory-service --replicas=3
```

### Caching
- Redis for frequently accessed data
- Cache product catalog
- Cache customer profiles
- Session storage

## Testing

### Unit Tests
```bash
cd services/inventory-service
npm test
```

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up
```

### Load Testing
Use tools like k6 or Apache JMeter to test API Gateway and services.

## Troubleshooting

### Service Not Starting
```bash
# Check service logs
docker-compose logs -f service-name

# Check database connectivity
docker-compose exec postgres psql -U postgres -c '\l'

# Check RabbitMQ
docker-compose exec rabbitmq rabbitmqctl status
```

### Event Bus Issues
```bash
# Access RabbitMQ Management UI
http://localhost:15672
# Login: pos_user / pos_password

# Check queues and bindings
# Verify events are being published and consumed
```

### Database Migrations
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d pos_inventory

# Run manual migrations if needed
\dt  # List tables
```

## Development Workflow

### Adding a New Microservice

1. Create service directory:
```bash
mkdir -p services/new-service/src/{database,routes,events}
```

2. Copy package.json and tsconfig.json from existing service
3. Implement database schema in `src/database/schema.ts`
4. Create routes in `src/routes/`
5. Set up event handlers in `src/events/`
6. Add service to `docker-compose.yml`
7. Add route to API Gateway

### Adding a New Event Type

1. Add event type to `shared/types/index.ts`
2. Publish event from source service
3. Subscribe to event in consuming services
4. Handle event in consumer

## Performance Optimization

### Best Practices
1. Use connection pooling for databases
2. Implement caching for read-heavy operations
3. Use event-driven architecture for non-blocking operations
4. Optimize database queries and indexes
5. Implement circuit breakers for external APIs
6. Use compression for API responses

### Monitoring Metrics
- Request latency
- Error rates
- Database query performance
- Event bus throughput
- Resource utilization (CPU, memory)

## Migration from Monolith

The original monolithic application in `/backend` has been split into microservices:

- `backend/routes/products.ts` → `services/inventory-service`
- `backend/routes/sales.ts` → `services/sales-service`
- `backend/routes/customers.ts` → `services/customer-service`
- `backend/routes/settings.ts` → Distributed across services

The monolithic backend is kept for reference but should not be used in production.

## Next Steps

1. ✅ Core services implemented (API Gateway, Auth, Inventory)
2. 🔄 Implement remaining services (Sales, Payment, Customer, etc.)
3. 🔄 Add comprehensive unit tests
4. 🔄 Set up CI/CD pipeline
5. 🔄 Add monitoring (Prometheus + Grafana)
6. 🔄 Add distributed tracing (Jaeger)
7. 🔄 Implement service mesh (Istio)
8. 🔄 Production deployment to Kubernetes

## Support

For issues and feature requests, please refer to the main README.md or create an issue in the repository.

---

**Version:** 1.0.0
**Last Updated:** November 2025
