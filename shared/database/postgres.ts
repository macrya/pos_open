// Shared PostgreSQL database connection utility
import { Pool, PoolConfig } from 'pg';
import { createLogger } from '../utils/logger';

export class DatabaseConnection {
  private pool: Pool;
  private logger = createLogger('Database');

  constructor(serviceName: string) {
    const config: PoolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || serviceName.toLowerCase().replace(/-/g, '_'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_POOL_SIZE || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);
    this.logger.info(`Database pool created for ${serviceName}`);

    // Handle pool errors
    this.pool.on('error', (err) => {
      this.logger.error('Unexpected database error', err);
    });
  }

  getPool(): Pool {
    return this.pool;
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      this.logger.debug('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      this.logger.error('Query error', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    this.logger.info('Database pool closed');
  }
}

export const createDatabaseConnection = (serviceName: string): DatabaseConnection => {
  return new DatabaseConnection(serviceName);
};
