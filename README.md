# POS System

A fully functional Point of Sale (POS) system that can be customized to fit any business needs. Built with TypeScript, Express, React, and SQLite.

## Features

### Core Functionality
- **Point of Sale Interface**: Fast and intuitive cashier interface for processing transactions
- **Product Management**: Complete CRUD operations for products with SKU, barcode, and category support
- **Inventory Tracking**: Real-time stock management with low-stock alerts
- **Sales Processing**: Multi-payment method support (cash, card, mobile)
- **Customer Management**: Customer database with loyalty points tracking
- **Tax Calculation**: Automatic tax calculation based on configurable rates
- **Discount System**: Product-level and transaction-level discounts

### Reporting & Analytics
- **Sales Statistics**: Total sales, revenue, and average sale tracking
- **Top Products Report**: Identify best-selling items
- **Low Stock Alerts**: Monitor inventory levels
- **Date Range Filtering**: Analyze performance over specific periods

### Customization
- **Business Type Configuration**: Optimized for retail, restaurant, grocery, cafe, pharmacy, and more
- **Multi-Currency Support**: USD, EUR, GBP, CAD, AUD, JPY, INR
- **Configurable Tax Rates**: Set custom tax rates per region
- **Receipt Customization**: Personalize receipt footer messages

## Technology Stack

### Backend
- **Node.js** with **Express**: RESTful API server
- **TypeScript**: Type-safe code
- **SQLite**: Lightweight, embedded database
- **Better-SQLite3**: High-performance database driver

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type safety throughout
- **React Router**: Client-side routing
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client

## Installation

### Prerequisites
- Node.js 18+ and npm

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos_open
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` to customize your settings:
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_PATH=./pos_database.sqlite
   BUSINESS_NAME=My Business
   BUSINESS_TYPE=retail
   CURRENCY=USD
   TAX_RATE=0.08
   RECEIPT_FOOTER=Thank you for your business!
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on http://localhost:3001
   - Frontend UI on http://localhost:3000

## Usage

### First-Time Setup

1. **Access the application** at http://localhost:3000
2. **Configure settings** (Settings page)
   - Set your business name
   - Choose business type
   - Set tax rate
   - Configure currency

3. **Add products** (Products page)
   - Click "Add Product"
   - Fill in product details
   - Set initial stock quantities

4. **Start selling** (Point of Sale page)
   - Search or browse products
   - Click products to add to cart
   - Adjust quantities as needed
   - Select payment method
   - Complete sale

### Business Types

The system can be configured for different business types:

- **Retail**: General retail store
- **Restaurant**: Food service with table management
- **Grocery**: Grocery store with perishables
- **Cafe**: Coffee shop or small eatery
- **Pharmacy**: Medical supplies and prescriptions
- **Clothing**: Fashion and apparel
- **Electronics**: Technology products
- **Other**: Custom configuration

### API Endpoints

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search/:query` - Search products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Update stock
- `DELETE /api/products/:id` - Delete product

#### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/stats/summary` - Get sales statistics
- `GET /api/sales/stats/top-products` - Get top selling products
- `POST /api/sales` - Create new sale

#### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `GET /api/customers/search/:query` - Search customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `PATCH /api/customers/:id/loyalty` - Add loyalty points
- `DELETE /api/customers/:id` - Delete customer

#### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings/:key` - Update setting
- `POST /api/settings/bulk` - Update multiple settings

## Database Schema

The system uses SQLite with the following main tables:

- **products**: Product catalog with pricing and inventory
- **categories**: Product categories
- **customers**: Customer information and loyalty points
- **employees**: Staff management (optional)
- **sales**: Transaction records
- **sale_items**: Line items for each sale
- **discounts**: Promotional discounts
- **settings**: System configuration

## Customization Guide

### Adding Custom Features

1. **Backend**: Add new routes in `backend/routes/`
2. **Frontend**: Create new pages in `frontend/src/pages/`
3. **Database**: Modify `backend/database/schema.ts`
4. **API**: Update `frontend/src/services/api.ts`

### Styling

All styles are in `frontend/src/styles/index.css`. The system uses a utility-first approach with reusable classes.

### Business Logic

Core business logic is in model files:
- `backend/models/Product.ts`
- `backend/models/Sale.ts`
- `backend/models/Customer.ts`
- `backend/models/Settings.ts`

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates:
- Backend: Compiled JavaScript in `dist/`
- Frontend: Static files in `frontend/dist/`

### Environment Variables

For production, set:
```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=/path/to/production/database.sqlite
```

### Running in Production

```bash
npm start
```

Serve the frontend static files with a web server (nginx, Apache, etc.) and proxy API requests to the backend.

## Data Backup

The SQLite database is a single file (`pos_database.sqlite`). To backup:

```bash
cp pos_database.sqlite pos_database_backup_$(date +%Y%m%d).sqlite
```

Set up automated backups with cron or similar tools.

## Security Considerations

- **Authentication**: This version doesn't include user authentication. Add JWT or session-based auth for production use.
- **Input Validation**: All inputs are validated on the backend.
- **SQL Injection**: Protected by using prepared statements.
- **CORS**: Configure CORS appropriately for production.
- **Environment Variables**: Never commit `.env` files.

## Troubleshooting

### Database locked error
If you get "database is locked", ensure only one instance is running.

### Port already in use
Change the PORT in `.env` file.

### Frontend can't connect to backend
Check that both servers are running and the proxy is configured in `vite.config.ts`.

## Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for commercial or personal projects.

## Support

For issues, questions, or feature requests, please open an issue on the repository.

## Roadmap

Potential future enhancements:
- User authentication and role-based access
- Multi-store support
- Employee time tracking
- Advanced reporting with charts
- Receipt printing
- Barcode scanning
- Kitchen display system (for restaurants)
- Table management (for restaurants)
- Online ordering integration
- Payment gateway integration
- Email receipts
- SMS notifications
- Mobile app (React Native)

---

**Built with ❤️ for businesses of all sizes**
