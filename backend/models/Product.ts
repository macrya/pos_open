import { db } from '../database/schema';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  category?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  tax_applicable: boolean;
  created_at: string;
  updated_at: string;
}

export class ProductModel {
  static getAll(includeInactive = false): Product[] {
    const query = includeInactive
      ? 'SELECT * FROM products ORDER BY name'
      : 'SELECT * FROM products WHERE is_active = 1 ORDER BY name';

    return db.prepare(query).all() as Product[];
  }

  static getById(id: string): Product | undefined {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
  }

  static getByBarcode(barcode: string): Product | undefined {
    return db.prepare('SELECT * FROM products WHERE barcode = ?').get(barcode) as Product | undefined;
  }

  static getBySku(sku: string): Product | undefined {
    return db.prepare('SELECT * FROM products WHERE sku = ?').get(sku) as Product | undefined;
  }

  static getByCategory(category: string): Product[] {
    return db.prepare('SELECT * FROM products WHERE category = ? AND is_active = 1 ORDER BY name')
      .all(category) as Product[];
  }

  static getLowStock(): Product[] {
    return db.prepare('SELECT * FROM products WHERE stock_quantity <= low_stock_threshold AND is_active = 1')
      .all() as Product[];
  }

  static create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO products (
        id, name, description, sku, barcode, price, cost, category,
        stock_quantity, low_stock_threshold, is_active, tax_applicable, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      product.name,
      product.description || null,
      product.sku || null,
      product.barcode || null,
      product.price,
      product.cost || 0,
      product.category || null,
      product.stock_quantity,
      product.low_stock_threshold,
      product.is_active ? 1 : 0,
      product.tax_applicable ? 1 : 0,
      now,
      now
    );

    return this.getById(id)!;
  }

  static update(id: string, updates: Partial<Product>): Product | undefined {
    const current = this.getById(id);
    if (!current) return undefined;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push((updates as any)[key]);
      }
    });

    if (fields.length === 0) return current;

    fields.push('updated_at = ?');
    values.push(now, id);

    const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static updateStock(id: string, quantityChange: number): Product | undefined {
    const product = this.getById(id);
    if (!product) return undefined;

    const newQuantity = product.stock_quantity + quantityChange;
    return this.update(id, { stock_quantity: newQuantity });
  }

  static search(query: string): Product[] {
    const searchTerm = `%${query}%`;
    return db.prepare(`
      SELECT * FROM products
      WHERE (name LIKE ? OR description LIKE ? OR sku LIKE ? OR barcode LIKE ?)
      AND is_active = 1
      ORDER BY name
    `).all(searchTerm, searchTerm, searchTerm, searchTerm) as Product[];
  }
}
