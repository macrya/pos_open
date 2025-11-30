# POS System - Microservices Architecture

A modern, scalable Point of Sale system built with microservices architecture, designed for retail and wholesale operations.

## 🏗️ Architecture Overview

This system is built using a microservices architecture with the following components:

### Core Services

| Service | Port | Description | Technology |
|---------|------|-------------|------------|
| API Gateway | 8000 | Request routing, authentication, rate limiting | Express.js |
| Auth Service | 8001 | User authentication, JWT management | Express.js, PostgreSQL |
| Inventory Service | 8002 | Product & stock management | Express.js, PostgreSQL |
| Sales Service | 8003 | Transaction processing | Express.js, PostgreSQL |
| Payment Service | 8004 | Payment processing, M-Pesa integration | Express.js, PostgreSQL |
| Customer Service | 8005 | Customer relationship management | Express.js, PostgreSQL |
| Reporting Service | 8006 | Analytics and reports | Express.js, PostgreSQL |
| Notification Service | 8007 | SMS, email, in-app notifications | Express.js, MongoDB |
| Receipt Service | 8008 | Document generation | Express.js, PostgreSQL |
| User Management | 8009 | Staff administration | Express.js, PostgreSQL |

### Infrastructure

- **PostgreSQL** - Primary database (separate DB per service)
- **Redis** - Caching layer
- **RabbitMQ** - Event bus for inter-service communication
- **Docker** - Containerization
- **Kubernetes** - Container orchestration (production)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd pos_open

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8000
# RabbitMQ Management: http://localhost:15672
```

### Using Make Commands

```bash
# Install dependencies
make install

# Build Docker images
make build

# Start all services
make up

# View logs
make logs

# Stop all services
make down

# Clean up
make clean
```

## 📋 Prerequisites

- **Docker** & **Docker Compose** (v20.10+)
- **Node.js** 18+ (for local development)
- **PostgreSQL** 15+ (for local development)
- **RabbitMQ** (for local development)
- **Make** (optional, for convenience commands)

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-key

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
```

## 📡 API Documentation

### Authentication

All API requests (except `/api/auth/login`) require a JWT token:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"admin123"}'

# Use the token in subsequent requests
curl http://localhost:8000/api/inventory/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Key Endpoints

#### Inventory Management
```
GET    /api/inventory/products          # List all products
POST   /api/inventory/products          # Create product
PUT    /api/inventory/products/:id      # Update product
POST   /api/inventory/stock/adjust      # Adjust stock
GET    /api/inventory/alerts/low-stock  # Get low stock alerts
```

#### Sales Management
```
POST   /api/sales/transactions          # Create new sale
GET    /api/sales/transactions/:id      # Get sale details
GET    /api/sales/history               # Sales history
POST   /api/sales/refund                # Process refund
```

#### Payment Processing
```
POST   /api/payments/mpesa/stk-push     # Initiate M-Pesa payment
POST   /api/payments/cash               # Record cash payment
GET    /api/payments/:transactionId     # Get payment status
```

#### Customer Management
```
GET    /api/customers                   # List customers
POST   /api/customers                   # Create customer
GET    /api/customers/:id/history       # Purchase history
POST   /api/customers/:id/loyalty       # Update loyalty points
```

For complete API documentation, see [MICROSERVICES_ARCHITECTURE.md](./MICROSERVICES_ARCHITECTURE.md)

## 🏃 Development

### Running Services Locally

```bash
# Terminal 1: API Gateway
cd services/api-gateway
npm install
npm run dev

# Terminal 2: Auth Service
cd services/auth-service
npm install
npm run dev

# Terminal 3: Inventory Service
cd services/inventory-service
npm install
npm run dev

# Terminal 4: Frontend
cd frontend
npm install
npm run dev
```

### Database Setup

Each service has its own PostgreSQL database:

```bash
# Create databases
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE pos_auth;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE pos_inventory;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE pos_sales;"

# Or use the init script
docker-compose exec postgres psql -U postgres -f /docker-entrypoint-initdb.d/init-databases.sql
```

## 🔄 Event-Driven Architecture

Services communicate asynchronously via RabbitMQ:

### Event Flow Example: Complete Sale

```
1. Client → API Gateway → Sales Service: Create sale
2. Sales Service → Inventory Service: Check stock (REST)
3. Sales Service → Payment Service: Process payment (REST)
4. Payment Service → Event Bus: Publish "payment.confirmed"
5. Sales Service → Event Bus: Publish "sale.completed"
6. Inventory Service: Listen & reduce stock
7. Customer Service: Listen & update purchase history
8. Notification Service: Listen & send receipt SMS
```

### Event Types

- `product.created` - New product added
- `product.updated` - Product modified
- `stock.low` - Stock below threshold
- `stock.adjusted` - Stock quantity changed
- `sale.completed` - Sale finalized
- `sale.refunded` - Sale refunded
- `payment.initiated` - Payment started
- `payment.confirmed` - Payment successful
- `payment.failed` - Payment failed

## 🧪 Testing

```bash
# Run all tests
make test

# Test specific service
cd services/inventory-service
npm test

# Integration tests
docker-compose -f docker-compose.test.yml up
```

## 📊 Monitoring

### RabbitMQ Management UI

```
URL: http://localhost:15672
Username: pos_user
Password: pos_password
```

### Health Checks

```bash
# Check all services
curl http://localhost:8000/health      # API Gateway
curl http://localhost:8001/health      # Auth Service
curl http://localhost:8002/health      # Inventory Service
```

### Logs

```bash
# View all logs
make logs

# View specific service logs
make logs-service SERVICE=inventory-service

# Docker Compose logs
docker-compose logs -f inventory-service
```

## 🚢 Deployment

### Staging/Production with Kubernetes

```bash
# 1. Build and push images
docker build -t registry.example.com/pos-api-gateway:latest services/api-gateway
docker push registry.example.com/pos-api-gateway:latest

# 2. Create Kubernetes secrets
kubectl create secret generic pos-secrets \
  --from-literal=jwt-secret=your-secret

kubectl create secret generic postgres-secrets \
  --from-literal=username=postgres \
  --from-literal=password=postgres

# 3. Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/deployment.yml

# 4. Check status
kubectl get pods
kubectl get services
```

### Scaling Services

```bash
# Scale specific service
kubectl scale deployment inventory-service --replicas=5

# Auto-scaling
kubectl autoscale deployment inventory-service --min=2 --max=10 --cpu-percent=80
```

## 🔒 Security

### Best Practices

1. **Change default credentials** in production
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable HTTPS/TLS** for all services
4. **Implement rate limiting** (already configured in API Gateway)
5. **Use secrets management** (Vault, AWS Secrets Manager)
6. **Regular security audits** and dependency updates

### Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Request validation and sanitization
- ✅ Rate limiting on API Gateway
- ✅ CORS configuration
- ✅ Helmet.js security headers

## 📈 Performance

### Optimization Strategies

1. **Database connection pooling** - Each service maintains a connection pool
2. **Redis caching** - Cache frequently accessed data
3. **Event-driven updates** - Non-blocking async operations
4. **Horizontal scaling** - Scale services independently
5. **Load balancing** - Distribute traffic across instances

### Benchmarks

- API Gateway: ~1000 req/s
- Inventory Service: ~800 req/s
- Auth Service: ~600 req/s

## 🛠️ Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check Docker status
docker-compose ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

**Database connection errors:**
```bash
# Check PostgreSQL is running
docker-compose exec postgres pg_isready

# Check database exists
docker-compose exec postgres psql -U postgres -l
```

**RabbitMQ connection issues:**
```bash
# Check RabbitMQ status
docker-compose exec rabbitmq rabbitmqctl status

# Check queues
docker-compose exec rabbitmq rabbitmqctl list_queues
```

## 📚 Documentation

- [Microservices Architecture Guide](./MICROSERVICES_ARCHITECTURE.md) - Detailed architecture documentation
- [Original Setup Guide](./SETUP.md) - Monolithic version setup
- [Render Deployment](./RENDER_DEPLOYMENT.md) - Cloud deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check the [MICROSERVICES_ARCHITECTURE.md](./MICROSERVICES_ARCHITECTURE.md) guide
- Review Docker Compose logs for debugging

## 🎯 Roadmap

- [x] Core microservices (API Gateway, Auth, Inventory)
- [x] Docker Compose setup
- [x] Event-driven architecture with RabbitMQ
- [x] Kubernetes deployment files
- [ ] Complete remaining services (Sales, Payment, Customer, etc.)
- [ ] Comprehensive unit tests
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Monitoring with Prometheus & Grafana
- [ ] Distributed tracing with Jaeger
- [ ] Service mesh with Istio
- [ ] Production deployment guide

---

**Built with ❤️ for modern retail operations**
