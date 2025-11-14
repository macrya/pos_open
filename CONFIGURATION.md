# Configuration Guide

Detailed guide for configuring the POS system for different business types and use cases.

## Table of Contents

1. [Business Type Configurations](#business-type-configurations)
2. [Tax Configuration](#tax-configuration)
3. [Currency Settings](#currency-settings)
4. [Inventory Management](#inventory-management)
5. [Customer Loyalty](#customer-loyalty)
6. [Receipt Customization](#receipt-customization)
7. [Advanced Settings](#advanced-settings)

## Business Type Configurations

### Retail Store

**Best Settings:**
```env
BUSINESS_NAME=My Retail Store
BUSINESS_TYPE=retail
CURRENCY=USD
TAX_RATE=0.08
```

**Product Categories:**
- Electronics
- Clothing
- Home Goods
- Toys & Games
- Books & Media

**Recommended Features:**
- Enable low stock alerts
- Use SKU and barcode scanning
- Track product variants (size, color)

### Restaurant

**Best Settings:**
```env
BUSINESS_NAME=My Restaurant
BUSINESS_TYPE=restaurant
CURRENCY=USD
TAX_RATE=0.10
```

**Product Categories:**
- Appetizers
- Main Courses
- Sides
- Desserts
- Beverages
- Alcohol

**Recommended Features:**
- Quick-access menu items
- Modifier support (add-ons)
- Table management
- Kitchen display integration

### Grocery Store

**Best Settings:**
```env
BUSINESS_NAME=My Grocery
BUSINESS_TYPE=grocery
CURRENCY=USD
TAX_RATE=0.05
```

**Product Categories:**
- Produce
- Dairy & Eggs
- Meat & Seafood
- Bakery
- Frozen Foods
- Dry Goods
- Beverages

**Recommended Features:**
- Weight-based pricing
- Expiration date tracking
- High-volume inventory
- Multi-unit pricing

### Cafe

**Best Settings:**
```env
BUSINESS_NAME=My Cafe
BUSINESS_TYPE=cafe
CURRENCY=USD
TAX_RATE=0.08
```

**Product Categories:**
- Coffee & Espresso
- Tea
- Pastries
- Sandwiches
- Snacks

**Recommended Features:**
- Size variations (Small, Medium, Large)
- Customizations (milk type, sweeteners)
- Quick service mode

### Pharmacy

**Best Settings:**
```env
BUSINESS_NAME=My Pharmacy
BUSINESS_TYPE=pharmacy
CURRENCY=USD
TAX_RATE=0.00
```

**Product Categories:**
- Prescription Drugs
- OTC Medications
- Vitamins & Supplements
- Personal Care
- Medical Devices

**Recommended Features:**
- Prescription tracking
- Batch/lot numbers
- Expiration management
- Customer prescription history

## Tax Configuration

### Multiple Tax Rates

For businesses with different tax rates per product category:

1. **Set base tax rate** in Settings
2. **Mark tax-exempt products** when creating/editing products
3. **Override in code** for complex scenarios

### Regional Tax Examples

**United States:**
- Sales tax varies by state (0% - 10%)
- Some states exempt food/medicine

**European Union:**
- Standard VAT: 15% - 27%
- Reduced rates for essentials

**Canada:**
- GST: 5% (federal)
- PST: 0% - 10% (provincial)
- Combined HST in some provinces

### Tax-Exempt Items

When creating products, uncheck "Tax Applicable" for:
- Prescription medications
- Essential food items (varies by region)
- Educational materials
- Medical devices

## Currency Settings

### Supported Currencies

| Code | Symbol | Name |
|------|--------|------|
| USD | $ | US Dollar |
| EUR | € | Euro |
| GBP | £ | British Pound |
| CAD | $ | Canadian Dollar |
| AUD | $ | Australian Dollar |
| JPY | ¥ | Japanese Yen |
| INR | ₹ | Indian Rupee |

### Display Format

To customize currency display format, modify:

**Frontend**: `frontend/src/services/api.ts`

```typescript
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
```

## Inventory Management

### Stock Levels

Configure appropriate thresholds based on your business:

**High-Volume Retail:**
```
Stock Quantity: 500+
Low Stock Threshold: 50
```

**Specialty Retail:**
```
Stock Quantity: 10-50
Low Stock Threshold: 5
```

**Restaurant:**
```
Stock Quantity: Based on daily usage
Low Stock Threshold: 2-3 days supply
```

### Reorder Points

Set low stock thresholds to trigger reorders:

1. Calculate average daily sales
2. Add lead time for suppliers
3. Add safety stock buffer
4. Set threshold = (daily sales × lead time) + safety stock

**Example:**
- Daily sales: 10 units
- Lead time: 5 days
- Safety stock: 10 units
- Threshold: (10 × 5) + 10 = 60 units

### Product Variants

For products with variations (size, color):

**Option 1: Separate Products**
```
Product: T-Shirt Red Small (SKU: TSHIRT-RED-S)
Product: T-Shirt Red Medium (SKU: TSHIRT-RED-M)
Product: T-Shirt Blue Small (SKU: TSHIRT-BLUE-S)
```

**Option 2: Use Description Field**
```
Product: T-Shirt
Description: Available in Red/Blue, S/M/L
SKU: TSHIRT-BASE
```

## Customer Loyalty

### Enable Loyalty Program

In Settings:
```
Enable Loyalty Program: ✓
```

### Points Configuration

**Standard Retail (1% back):**
```
100 points = $1
Every $1 spent = 1 point
```

**Premium Retail (2% back):**
```
50 points = $1
Every $1 spent = 1 point
```

### Points Redemption

Implement in code (`backend/models/Sale.ts`):

```typescript
// Deduct points during sale
if (customer && pointsToRedeem > 0) {
  const discountAmount = pointsToRedeem / 100; // 100 points = $1
  CustomerModel.addLoyaltyPoints(customer.id, -pointsToRedeem);
}
```

### Loyalty Tiers

Create customer tiers based on points:

- **Bronze**: 0-999 points (1% back)
- **Silver**: 1,000-4,999 points (1.5% back)
- **Gold**: 5,000+ points (2% back)

## Receipt Customization

### Receipt Footer Examples

**Retail:**
```
Thank you for shopping with us!
Visit us at www.mystore.com
Follow us on social media @mystore
```

**Restaurant:**
```
Thank you for dining with us!
We hope to see you again soon!
Please rate us on Google
```

**Service Business:**
```
Thank you for your business!
Refer a friend and get 10% off
Questions? Call (555) 123-4567
```

### Multi-Language Receipts

For international businesses, configure language in Settings:

```typescript
interface ReceiptConfig {
  language: 'en' | 'es' | 'fr' | 'de';
  footer: {
    en: 'Thank you!',
    es: '¡Gracias!',
    fr: 'Merci!',
    de: 'Danke!',
  };
}
```

## Advanced Settings

### Performance Optimization

**High-Volume Stores:**

1. **Index frequently queried fields:**
   ```sql
   CREATE INDEX idx_products_barcode ON products(barcode);
   CREATE INDEX idx_sales_date ON sales(created_at);
   ```

2. **Archive old sales:**
   ```sql
   -- Move sales older than 1 year to archive table
   CREATE TABLE sales_archive AS SELECT * FROM sales WHERE created_at < date('now', '-1 year');
   DELETE FROM sales WHERE created_at < date('now', '-1 year');
   ```

### Multi-Store Configuration

For businesses with multiple locations:

1. **Add store_id field** to products and sales
2. **Filter by store** in all queries
3. **Sync inventory** across stores
4. **Aggregate reporting** for all locations

### Integration Settings

**Barcode Scanner:**
```typescript
// Listen for scanner input
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    // Process scanned barcode
    searchProductByBarcode(scannedCode);
  }
});
```

**Receipt Printer:**
```typescript
// ESC/POS printer commands
function printReceipt(sale: Sale) {
  const printer = new ThermalPrinter();
  printer.alignCenter();
  printer.bold(true);
  printer.println(businessName);
  // ... format receipt
  printer.cut();
  printer.execute();
}
```

**Payment Terminal:**
```typescript
// Integrate with payment processor
async function processCardPayment(amount: number) {
  const result = await paymentTerminal.charge({
    amount: amount,
    currency: settings.currency,
  });
  return result;
}
```

### Backup Configuration

**Automatic Backups:**

Create `scripts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="./backups"
DB_PATH="./pos_database.sqlite"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH "$BACKUP_DIR/pos_backup_$DATE.sqlite"

# Keep only last 30 days
find $BACKUP_DIR -name "pos_backup_*.sqlite" -mtime +30 -delete
```

Schedule with cron:
```bash
0 2 * * * /path/to/pos_open/scripts/backup.sh
```

### Security Settings

**Access Control:**

Add to `.env`:
```env
ENABLE_AUTH=true
JWT_SECRET=your-secret-key
SESSION_TIMEOUT=3600
```

**API Rate Limiting:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Configuration Profiles

### Quick Setup Profiles

**Profile: Small Retail**
```env
BUSINESS_TYPE=retail
TAX_RATE=0.08
LOW_STOCK_THRESHOLD=10
LOYALTY_ENABLED=false
```

**Profile: High-Volume Grocery**
```env
BUSINESS_TYPE=grocery
TAX_RATE=0.05
LOW_STOCK_THRESHOLD=50
LOYALTY_ENABLED=true
ENABLE_BARCODE_SCANNER=true
```

**Profile: Restaurant**
```env
BUSINESS_TYPE=restaurant
TAX_RATE=0.10
LOW_STOCK_THRESHOLD=5
ENABLE_TABLE_MANAGEMENT=true
KITCHEN_DISPLAY=true
```

## Testing Your Configuration

After configuration, test:

1. ✅ Create a product
2. ✅ Process a test sale
3. ✅ Verify tax calculation
4. ✅ Check receipt formatting
5. ✅ Test low stock alerts
6. ✅ Verify currency display
7. ✅ Test customer loyalty (if enabled)
8. ✅ Run a sales report

---

**Your POS system is now configured for your business!**
