import { useState, useEffect } from 'react';
import { productsAPI, Product } from '../services/api';

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: 0,
    cost: 0,
    category: '',
    stock_quantity: 0,
    low_stock_threshold: 10,
    is_active: true,
    tax_applicable: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll(true);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
        alert('Product updated successfully!');
      } else {
        await productsAPI.create(formData);
        alert('Product created successfully!');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.delete(id);
      alert('Product deleted successfully!');
      loadProducts();
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      barcode: '',
      price: 0,
      cost: 0,
      category: '',
      stock_quantity: 0,
      low_stock_threshold: 10,
      is_active: true,
      tax_applicable: true,
    });
  };

  const handleAdd = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
      </div>

      <div className="card">
        <div className="action-bar">
          <h2>Product Inventory</h2>
          <button className="btn btn-primary" onClick={handleAdd}>
            Add Product
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku || '-'}</td>
                <td>{product.category || '-'}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  {product.stock_quantity}
                  {product.stock_quantity <= product.low_stock_threshold && (
                    <span style={{ color: 'red', marginLeft: '5px' }}>⚠ Low</span>
                  )}
                </td>
                <td>{product.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(product)}
                    style={{ marginRight: '5px', padding: '5px 10px' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(product.id)}
                    style={{ padding: '5px 10px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>No products yet. Add your first product!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Name *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label">SKU</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Barcode</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="label">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Category</label>
                <input
                  type="text"
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="input"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="label">Low Stock Threshold</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.low_stock_threshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        low_stock_threshold: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    style={{ marginRight: '8px' }}
                  />
                  Active
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.tax_applicable}
                    onChange={(e) =>
                      setFormData({ ...formData, tax_applicable: e.target.checked })
                    }
                    style={{ marginRight: '8px' }}
                  />
                  Tax Applicable
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
