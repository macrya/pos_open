import { useState, useEffect } from 'react';
import { productsAPI, salesAPI, Product, SaleItem } from '../services/api';

interface CartItem extends SaleItem {
  product: Product;
}

function POSView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          quantity: 1,
          discount_amount: 0,
          product,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateTax = () => {
    // Tax will be calculated on backend, but we can estimate here
    const subtotal = calculateSubtotal();
    return subtotal * 0.08; // Default 8% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          discount_amount: item.discount_amount,
        })),
        payment_method: paymentMethod,
      };

      await salesAPI.create(saleData);
      alert('Sale completed successfully!');
      setCart([]);
      loadProducts(); // Refresh to update stock
    } catch (error: any) {
      console.error('Checkout failed:', error);
      alert(error.response?.data?.error || 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    if (confirm('Clear cart?')) {
      setCart([]);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Point of Sale</h1>
      </div>

      <div className="pos-container">
        <div>
          <div className="search-box">
            <input
              type="text"
              className="input"
              placeholder="Search products by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => addToCart(product)}
                >
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div className="product-stock">Stock: {product.stock_quantity}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cart-panel">
          <div className="cart-header">Current Sale</div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛒</div>
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-details">
                      ${item.product.price.toFixed(2)} × {item.quantity} = $
                      {(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeFromCart(item.product_id)}
                      style={{ marginLeft: '10px', padding: '5px 10px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="label">Payment Method</label>
              <select
                className="input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Payment</option>
              </select>
            </div>

            <div className="btn-group" style={{ marginTop: '15px' }}>
              <button className="btn btn-secondary" onClick={clearCart}>
                Clear
              </button>
              <button
                className="btn btn-success"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                style={{ flex: 1 }}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POSView;
