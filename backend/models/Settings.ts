import { db } from '../database/schema';

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export interface BusinessSettings {
  business_name: string;
  business_type: string;
  currency: string;
  tax_rate: string;
  receipt_footer: string;
  low_stock_alerts: string;
  loyalty_enabled: string;
  [key: string]: string;
}

export class SettingsModel {
  static getAll(): BusinessSettings {
    const settings = db.prepare('SELECT key, value FROM settings').all() as Setting[];

    const settingsObject: BusinessSettings = {
      business_name: '',
      business_type: '',
      currency: '',
      tax_rate: '',
      receipt_footer: '',
      low_stock_alerts: '',
      loyalty_enabled: ''
    };

    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });

    return settingsObject;
  }

  static get(key: string): string | undefined {
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as Setting | undefined;
    return setting?.value;
  }

  static set(key: string, value: string): void {
    const now = new Date().toISOString();

    const existing = this.get(key);

    if (existing !== undefined) {
      db.prepare('UPDATE settings SET value = ?, updated_at = ? WHERE key = ?').run(value, now, key);
    } else {
      db.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)').run(key, value, now);
    }
  }

  static setMultiple(settings: Record<string, string>): void {
    const transaction = db.transaction(() => {
      Object.entries(settings).forEach(([key, value]) => {
        this.set(key, value);
      });
    });

    transaction();
  }

  static delete(key: string): boolean {
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
    const result = stmt.run(key);
    return result.changes > 0;
  }

  static getTaxRate(): number {
    const taxRate = this.get('tax_rate');
    return parseFloat(taxRate || '0');
  }

  static getBusinessType(): string {
    return this.get('business_type') || 'retail';
  }
}
