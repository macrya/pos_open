import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pos_auth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
});

export const getPool = () => pool;

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
        is_active BOOLEAN DEFAULT true,
        store_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        refresh_token VARCHAR(500),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(token)
      )
    `);

    // Roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default roles if not exists
    await client.query(`
      INSERT INTO roles (name, permissions)
      VALUES
        ('admin', '["all"]'),
        ('manager', '["sales", "inventory", "reports", "customers"]'),
        ('cashier', '["sales", "customers"]')
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert default admin user if not exists (password: admin123)
    await client.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@pos.com', '$2a$10$ZK5xhGYgWGX0hQXJ0ZX9/.dGQfWZ.dXK3yQxZgQXhZK5xhGYgWGX0h', 'Admin User', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✓ Auth database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}
