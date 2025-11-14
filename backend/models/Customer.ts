import { db } from '../database/schema';
import { v4 as uuidv4 } from 'uuid';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export class CustomerModel {
  static getAll(): Customer[] {
    return db.prepare('SELECT * FROM customers ORDER BY name').all() as Customer[];
  }

  static getById(id: string): Customer | undefined {
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer | undefined;
  }

  static getByEmail(email: string): Customer | undefined {
    return db.prepare('SELECT * FROM customers WHERE email = ?').get(email) as Customer | undefined;
  }

  static getByPhone(phone: string): Customer | undefined {
    return db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone) as Customer | undefined;
  }

  static create(customer: Omit<Customer, 'id' | 'loyalty_points' | 'created_at' | 'updated_at'>): Customer {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO customers (id, name, email, phone, address, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      customer.name,
      customer.email || null,
      customer.phone || null,
      customer.address || null,
      now,
      now
    );

    return this.getById(id)!;
  }

  static update(id: string, updates: Partial<Customer>): Customer | undefined {
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

    const stmt = db.prepare(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static addLoyaltyPoints(id: string, points: number): Customer | undefined {
    const customer = this.getById(id);
    if (!customer) return undefined;

    return this.update(id, { loyalty_points: customer.loyalty_points + points });
  }

  static search(query: string): Customer[] {
    const searchTerm = `%${query}%`;
    return db.prepare(`
      SELECT * FROM customers
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
      ORDER BY name
    `).all(searchTerm, searchTerm, searchTerm) as Customer[];
  }
}
