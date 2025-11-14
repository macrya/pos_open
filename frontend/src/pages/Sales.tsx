import { useState, useEffect } from 'react';
import { salesAPI, Sale } from '../services/api';

function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await salesAPI.getAll(100);
      setSales(response.data);
    } catch (error) {
      console.error('Failed to load sales:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales History</h1>
      </div>

      <div className="card">
        <h2>Recent Transactions</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Transaction #</th>
              <th>Date</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.transaction_number}</td>
                <td>{formatDate(sale.created_at)}</td>
                <td>{sale.items.length}</td>
                <td>${sale.subtotal.toFixed(2)}</td>
                <td>${sale.tax_amount.toFixed(2)}</td>
                <td>${sale.total.toFixed(2)}</td>
                <td>{sale.payment_method}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedSale(sale)}
                    style={{ padding: '5px 10px' }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sales.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>No sales yet</p>
          </div>
        )}
      </div>

      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Sale Details</div>

            <div>
              <p>
                <strong>Transaction #:</strong> {selectedSale.transaction_number}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedSale.created_at)}
              </p>
              <p>
                <strong>Payment Method:</strong> {selectedSale.payment_method}
              </p>
            </div>

            <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Items</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unit_price.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <p>
                <strong>Subtotal:</strong> ${selectedSale.subtotal.toFixed(2)}
              </p>
              <p>
                <strong>Tax:</strong> ${selectedSale.tax_amount.toFixed(2)}
              </p>
              {selectedSale.discount_amount > 0 && (
                <p>
                  <strong>Discount:</strong> -${selectedSale.discount_amount.toFixed(2)}
                </p>
              )}
              <p style={{ fontSize: '20px', marginTop: '10px' }}>
                <strong>Total:</strong> ${selectedSale.total.toFixed(2)}
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSale(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;
