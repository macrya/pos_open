import { db } from '../database/schema';
import { v4 as uuidv4 } from 'uuid';
import { ProductModel } from './Product';

export interface Sale {
  id: string;
  transaction_number: string;
  customer_id?: string;
  employee_id?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}

export class SaleModel {
  static generateTransactionNumber(): string {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TXN-${timestamp}-${random}`;
  }

  static getAll(limit = 100): SaleWithItems[] {
    const sales = db.prepare('SELECT * FROM sales ORDER BY created_at DESC LIMIT ?')
      .all(limit) as Sale[];

    return sales.map(sale => ({
      ...sale,
      items: this.getSaleItems(sale.id)
    }));
  }

  static getById(id: string): SaleWithItems | undefined {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as Sale | undefined;
    if (!sale) return undefined;

    return {
      ...sale,
      items: this.getSaleItems(id)
    };
  }

  static getSaleItems(saleId: string): SaleItem[] {
    return db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId) as SaleItem[];
  }

  static getByDateRange(startDate: string, endDate: string): SaleWithItems[] {
    const sales = db.prepare(`
      SELECT * FROM sales
      WHERE created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
    `).all(startDate, endDate) as Sale[];

    return sales.map(sale => ({
      ...sale,
      items: this.getSaleItems(sale.id)
    }));
  }

  static create(saleData: {
    items: Array<{ product_id: string; quantity: number; discount_amount?: number }>;
    customer_id?: string;
    employee_id?: string;
    payment_method: string;
    notes?: string;
    applied_discount?: number;
  }): SaleWithItems {
    const saleId = uuidv4();
    const transactionNumber = this.generateTransactionNumber();
    const now = new Date().toISOString();

    // Get tax rate from settings
    const taxRateSetting = db.prepare("SELECT value FROM settings WHERE key = 'tax_rate'")
      .get() as { value: string } | undefined;
    const taxRate = parseFloat(taxRateSetting?.value || '0');

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    const items: SaleItem[] = [];

    // Use a transaction for data consistency
    const transaction = db.transaction(() => {
      for (const item of saleData.items) {
        const product = ProductModel.getById(item.product_id);
        if (!product) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemId = uuidv4();
        const itemSubtotal = product.price * item.quantity;
        const itemDiscount = item.discount_amount || 0;
        const itemTaxableAmount = itemSubtotal - itemDiscount;
        const itemTax = product.tax_applicable ? itemTaxableAmount * taxRate : 0;
        const itemTotal = itemTaxableAmount + itemTax;

        subtotal += itemSubtotal;
        totalTax += itemTax;

        const saleItem: SaleItem = {
          id: itemId,
          sale_id: saleId,
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: product.price,
          discount_amount: itemDiscount,
          tax_amount: itemTax,
          total: itemTotal
        };

        items.push(saleItem);

        // Insert sale item
        db.prepare(`
          INSERT INTO sale_items (
            id, sale_id, product_id, product_name, quantity,
            unit_price, discount_amount, tax_amount, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId, saleId, product.id, product.name, item.quantity,
          product.price, itemDiscount, itemTax, itemTotal
        );

        // Update stock
        ProductModel.updateStock(product.id, -item.quantity);
      }

      const discountAmount = saleData.applied_discount || 0;
      const total = subtotal - discountAmount + totalTax;

      // Insert sale
      db.prepare(`
        INSERT INTO sales (
          id, transaction_number, customer_id, employee_id,
          subtotal, tax_amount, discount_amount, total,
          payment_method, payment_status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        saleId, transactionNumber, saleData.customer_id || null,
        saleData.employee_id || null, subtotal, totalTax,
        discountAmount, total, saleData.payment_method,
        'completed', saleData.notes || null, now
      );
    });

    transaction();

    return this.getById(saleId)!;
  }

  static getSalesStats(startDate?: string, endDate?: string) {
    let query = 'SELECT COUNT(*) as total_sales, SUM(total) as total_revenue, AVG(total) as avg_sale FROM sales';
    const params: string[] = [];

    if (startDate && endDate) {
      query += ' WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const stats = db.prepare(query).get(...params) as {
      total_sales: number;
      total_revenue: number;
      avg_sale: number;
    };

    return {
      total_sales: stats.total_sales || 0,
      total_revenue: stats.total_revenue || 0,
      average_sale: stats.avg_sale || 0
    };
  }

  static getTopProducts(limit = 10, startDate?: string, endDate?: string) {
    let query = `
      SELECT
        product_id,
        product_name,
        SUM(quantity) as total_quantity,
        SUM(total) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE s.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' GROUP BY product_id, product_name ORDER BY total_revenue DESC LIMIT ?';
    params.push(limit);

    return db.prepare(query).all(...params);
  }
}
