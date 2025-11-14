import { ProductModel } from '../models/Product';
import { CustomerModel } from '../models/Customer';
import { initializeDatabase } from '../database/schema';

/**
 * Seed the database with sample data for testing
 */
export function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  // Sample products for a retail store
  const sampleProducts = [
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with USB receiver',
      sku: 'MOUSE-001',
      barcode: '1234567890123',
      price: 29.99,
      cost: 15.00,
      category: 'Electronics',
      stock_quantity: 50,
      low_stock_threshold: 10,
      is_active: true,
      tax_applicable: true,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical gaming keyboard',
      sku: 'KB-001',
      barcode: '1234567890124',
      price: 89.99,
      cost: 45.00,
      category: 'Electronics',
      stock_quantity: 25,
      low_stock_threshold: 5,
      is_active: true,
      tax_applicable: true,
    },
    {
      name: 'USB-C Cable',
      description: '6ft USB-C charging cable',
      sku: 'CABLE-001',
      barcode: '1234567890125',
      price: 12.99,
      cost: 5.00,
      category: 'Accessories',
      stock_quantity: 100,
      low_stock_threshold: 20,
      is_active: true,
      tax_applicable: true,
    },
    {
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand',
      sku: 'STAND-001',
      barcode: '1234567890126',
      price: 39.99,
      cost: 20.00,
      category: 'Accessories',
      stock_quantity: 30,
      low_stock_threshold: 8,
      is_active: true,
      tax_applicable: true,
    },
    {
      name: 'Webcam HD',
      description: '1080p HD webcam with microphone',
      sku: 'CAM-001',
      barcode: '1234567890127',
      price: 59.99,
      cost: 30.00,
      category: 'Electronics',
      stock_quantity: 15,
      low_stock_threshold: 5,
      is_active: true,
      tax_applicable: true,
    },
    {
      name: 'Phone Case',
      description: 'Protective phone case - Universal',
      sku: 'CASE-001',
      barcode: '1234567890128',
      price: 19.99,
      cost: 8.00,
      category: 'Accessories',
      stock_quantity: 75,
      low_stock_threshold: 15,
      is_active: true,
      tax_applicable: true,
    },
    {
      name: 'Headphones',
      description: 'Noise-cancelling over-ear headphones',
      sku: 'HEAD-001',
      barcode: '1234567890129',
      price: 149.99,
      cost: 75.00,
      category: 'Electronics',
      stock_quantity: 20,
      low_stock_threshold: 5,
      is_active: true,
      tax_applicable: true,
    },
    {
      name: 'Screen Protector',
      description: 'Tempered glass screen protector',
      sku: 'SCREEN-001',
      barcode: '1234567890130',
      price: 9.99,
      cost: 3.00,
      category: 'Accessories',
      stock_quantity: 8,
      low_stock_threshold: 10,
      is_active: true,
      tax_applicable: true,
    },
  ];

  // Sample customers
  const sampleCustomers = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-0101',
      address: '123 Main St, City, State 12345',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-0102',
      address: '456 Oak Ave, City, State 12345',
    },
    {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '555-0103',
      address: '789 Pine Rd, City, State 12345',
    },
  ];

  // Create products
  console.log('Creating products...');
  sampleProducts.forEach((product) => {
    try {
      ProductModel.create(product);
      console.log(`✓ Created product: ${product.name}`);
    } catch (error: any) {
      console.error(`✗ Failed to create product ${product.name}:`, error.message);
    }
  });

  // Create customers
  console.log('\nCreating customers...');
  sampleCustomers.forEach((customer) => {
    try {
      CustomerModel.create(customer);
      console.log(`✓ Created customer: ${customer.name}`);
    } catch (error: any) {
      console.error(`✗ Failed to create customer ${customer.name}:`, error.message);
    }
  });

  console.log('\n✅ Database seeding completed!');
  console.log('\nSummary:');
  console.log(`  Products: ${sampleProducts.length}`);
  console.log(`  Customers: ${sampleCustomers.length}`);
  console.log('\nYou can now start using the POS system with sample data.');
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
  seedDatabase();
  process.exit(0);
}
