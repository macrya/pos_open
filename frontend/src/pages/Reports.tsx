import { useState, useEffect } from 'react';
import { salesAPI, productsAPI } from '../services/api';

function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      const [statsRes, topProductsRes, lowStockRes] = await Promise.all([
        salesAPI.getStats(dateRange.start, dateRange.end),
        salesAPI.getTopProducts(10, dateRange.start, dateRange.end),
        productsAPI.getLowStock(),
      ]);

      setStats(statsRes.data);
      setTopProducts(topProductsRes.data);
      setLowStock(lowStockRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
      </div>

      <div className="card">
        <h2>Date Range</h2>
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">End Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value">{stats.total_sales}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">${stats.total_revenue?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-label">Average Sale</div>
            <div className="stat-value">${stats.average_sale?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Top Selling Products</h2>
        {topProducts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product: any) => (
                <tr key={product.product_id}>
                  <td>{product.product_name}</td>
                  <td>{product.total_quantity}</td>
                  <td>${parseFloat(product.total_revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>No sales data for this period</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Low Stock Alerts</h2>
        {lowStock.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.low_stock_threshold}</td>
                  <td>
                    <span style={{ color: 'red', fontWeight: 'bold' }}>⚠ Low Stock</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p>All products are well-stocked</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
