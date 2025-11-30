import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../database/schema';
import { publishEvent } from '../events/eventBus';

const router = Router();

// Get all products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const pool = getPool();

    const query = includeInactive
      ? 'SELECT * FROM products ORDER BY created_at DESC'
      : 'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC';

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search products
router.get('/products/search/:query', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const searchQuery = `%${req.params.query}%`;

    const result = await pool.query(
      `SELECT * FROM products
       WHERE (name ILIKE $1 OR sku ILIKE $1 OR barcode ILIKE $1)
       AND is_active = true
       ORDER BY name`,
      [searchQuery]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Search products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products
router.get('/alerts/low-stock', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT * FROM products
       WHERE stock_quantity <= low_stock_threshold
       AND is_active = true
       ORDER BY stock_quantity ASC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/products', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      sku,
      barcode,
      price,
      cost,
      wholesalePrice,
      categoryId,
      stockQuantity,
      lowStockThreshold,
      taxApplicable,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO products (
        name, description, sku, barcode, price, cost, wholesale_price,
        category_id, stock_quantity, low_stock_threshold, tax_applicable
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        description,
        sku,
        barcode,
        price,
        cost || 0,
        wholesalePrice,
        categoryId,
        stockQuantity || 0,
        lowStockThreshold || 10,
        taxApplicable !== false,
      ]
    );

    const product = result.rows[0];

    // Publish product.created event
    await publishEvent({
      id: uuidv4(),
      type: 'product.created',
      data: product,
      timestamp: new Date().toISOString(),
      source: 'inventory-service',
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'SKU or barcode already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update product
router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const pool = getPool();

    // Build dynamic update query
    const fields = Object.keys(updates).filter((key) => key !== 'id');
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const values = [id, ...fields.map((field) => updates[field])];
    const query = `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];

    // Publish product.updated event
    await publishEvent({
      id: uuidv4(),
      type: 'product.updated',
      data: product,
      timestamp: new Date().toISOString(),
      source: 'inventory-service',
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Adjust stock
router.post('/stock/adjust', async (req: Request, res: Response) => {
  try {
    const { productId, quantity, type, reason, userId } = req.body;

    if (!productId || !quantity || !type) {
      return res.status(400).json({ error: 'productId, quantity, and type are required' });
    }

    if (!['increase', 'decrease', 'set'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be increase, decrease, or set' });
    }

    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current stock
      const productResult = await client.query(
        'SELECT stock_quantity, low_stock_threshold, name FROM products WHERE id = $1',
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const currentStock = productResult.rows[0].stock_quantity;
      const threshold = productResult.rows[0].low_stock_threshold;
      const productName = productResult.rows[0].name;

      let newStock = currentStock;
      if (type === 'increase') {
        newStock = currentStock + quantity;
      } else if (type === 'decrease') {
        newStock = currentStock - quantity;
      } else {
        newStock = quantity;
      }

      if (newStock < 0) {
        throw new Error('Stock cannot be negative');
      }

      // Update stock
      await client.query(
        'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStock, productId]
      );

      // Record adjustment
      const adjustmentResult = await client.query(
        'INSERT INTO stock_adjustments (product_id, quantity, type, reason, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [productId, quantity, type, reason, userId]
      );

      await client.query('COMMIT');

      const adjustment = adjustmentResult.rows[0];

      // Publish stock.adjusted event
      await publishEvent({
        id: uuidv4(),
        type: 'stock.adjusted',
        data: adjustment,
        timestamp: new Date().toISOString(),
        source: 'inventory-service',
      });

      // Check if stock is low and publish event
      if (newStock <= threshold) {
        await publishEvent({
          id: uuidv4(),
          type: 'stock.low',
          data: {
            productId,
            productName,
            currentStock: newStock,
            threshold,
          },
          timestamp: new Date().toISOString(),
          source: 'inventory-service',
        });
      }

      res.json({
        success: true,
        data: {
          adjustment,
          newStock,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Stock adjustment error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get stock for a product
router.get('/stock/:productId', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT stock_quantity, low_stock_threshold FROM products WHERE id = $1',
      [req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
