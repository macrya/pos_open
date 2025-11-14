# Setup Guide

Complete setup instructions for the POS System.

## System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk Space**: 500MB for application and dependencies

## Step-by-Step Installation

### 1. Install Node.js

If you don't have Node.js installed:

**Windows/macOS:**
- Download from https://nodejs.org/
- Run the installer
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone or Download the Repository

```bash
git clone <repository-url>
cd pos_open
```

Or download and extract the ZIP file.

### 3. Install Dependencies

Install both backend and frontend dependencies:

```bash
npm run install:all
```

This will:
- Install backend dependencies in the root directory
- Install frontend dependencies in the `frontend/` directory

If you encounter errors, try installing separately:

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your preferred settings:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./pos_database.sqlite

# Business Configuration
BUSINESS_NAME=My Business
BUSINESS_TYPE=retail
CURRENCY=USD
TAX_RATE=0.08
RECEIPT_FOOTER=Thank you for your business!
```

### 5. Start the Application

**Development Mode** (recommended for setup and testing):

```bash
npm run dev
```

This starts both backend and frontend in development mode with hot-reload.

**Production Mode**:

```bash
# Build
npm run build

# Start
npm start
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Initial Configuration

### 1. Configure Business Settings

1. Navigate to **Settings** in the sidebar
2. Update the following:
   - Business Name
   - Business Type (select from dropdown)
   - Currency
   - Tax Rate (enter as percentage)
   - Receipt Footer

3. Click **Save Settings**

### 2. Add Product Categories (Optional)

While the system doesn't require predefined categories, it's helpful to establish them:

Common categories by business type:

**Retail:**
- Electronics
- Clothing
- Home & Garden
- Sports & Outdoors

**Restaurant:**
- Appetizers
- Main Courses
- Desserts
- Beverages

**Grocery:**
- Produce
- Dairy
- Meat & Seafood
- Bakery

### 3. Add Initial Products

1. Go to **Products** page
2. Click **Add Product**
3. Fill in product details:
   - Name (required)
   - SKU (stock keeping unit)
   - Barcode (if applicable)
   - Price (required)
   - Cost (for profit tracking)
   - Category
   - Stock Quantity (required)
   - Low Stock Threshold

4. Click **Create**

**Tip**: You can import products via the API if you have a large inventory.

### 4. Add Customers (Optional)

1. Go to **Customers** page
2. Click **Add Customer**
3. Enter customer details
4. Click **Create**

### 5. Test a Sale

1. Navigate to **Point of Sale**
2. Click on a product to add to cart
3. Adjust quantity if needed
4. Select payment method
5. Click **Complete Sale**

## Advanced Configuration

### Custom Port Numbers

If ports 3000 or 3001 are already in use:

**Backend** (`.env`):
```env
PORT=4001
```

**Frontend** (`frontend/vite.config.ts`):
```typescript
server: {
  port: 4000,
  proxy: {
    '/api': {
      target: 'http://localhost:4001',
      changeOrigin: true,
    },
  },
}
```

### Database Location

To use a custom database location:

```env
DATABASE_PATH=/custom/path/to/database.sqlite
```

Make sure the directory exists and is writable.

### Network Access

To allow access from other devices on your network:

**Frontend** (`frontend/vite.config.ts`):
```typescript
server: {
  host: '0.0.0.0',
  port: 3000,
  // ...
}
```

**Backend** (`backend/server.ts`):
```typescript
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
```

Access from other devices using your computer's IP address:
```
http://192.168.1.x:3000
```

## Troubleshooting

### "Cannot find module" errors

```bash
rm -rf node_modules frontend/node_modules
npm run install:all
```

### Database errors

Delete the database and let it recreate:
```bash
rm pos_database.sqlite
npm run dev
```

### Port already in use

Find and kill the process:

**Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

### Frontend can't reach backend

1. Verify backend is running on the correct port
2. Check `vite.config.ts` proxy configuration
3. Check for CORS errors in browser console

### Build errors

Clear build cache:
```bash
rm -rf dist frontend/dist
npm run build
```

## Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY backend ./backend
COPY frontend/dist ./frontend/dist

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t pos-system .
docker run -p 3001:3001 -v $(pwd)/data:/app/data pos-system
```

## Backup and Restore

### Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
cp pos_database.sqlite backups/pos_backup_$(date +%Y%m%d_%H%M%S).sqlite
```

### Restore

```bash
cp backups/pos_backup_YYYYMMDD_HHMMSS.sqlite pos_database.sqlite
```

### Automated Backups

**Linux/macOS** (using cron):

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cp /path/to/pos_database.sqlite /path/to/backups/pos_backup_$(date +\%Y\%m\%d).sqlite
```

**Windows** (using Task Scheduler):
Create a batch file and schedule it with Task Scheduler.

## Next Steps

1. ✅ Complete initial configuration
2. ✅ Add products to inventory
3. ✅ Test a few sales transactions
4. ✅ Review reports and analytics
5. ✅ Customize settings for your business
6. 📝 Set up regular backups
7. 🚀 Deploy to production (if needed)

## Getting Help

- Check the README.md for feature documentation
- Review API documentation for integration
- Open an issue on the repository for bugs
- Consult the troubleshooting section above

---

**You're all set! Happy selling!** 🎉
