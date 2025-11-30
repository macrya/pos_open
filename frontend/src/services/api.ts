import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  category?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  tax_applicable: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface SaleItem {
  product_id: string;
  quantity: number;
  discount_amount?: number;
}

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
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
  }>;
}

export interface Settings {
  business_name: string;
  business_type: string;
  currency: string;
  tax_rate: string;
  receipt_footer: string;
  low_stock_alerts: string;
  loyalty_enabled: string;
  [key: string]: string;
}

// Products API - Routes through API Gateway to Inventory Service
export const productsAPI = {
  getAll: (includeInactive = false) =>
    api.get<Product[]>(`/inventory/products?include_inactive=${includeInactive}`),
  getById: (id: string) => api.get<Product>(`/inventory/products/${id}`),
  search: (query: string) => api.get<Product[]>(`/inventory/products/search/${query}`),
  getByCategory: (category: string) => api.get<Product[]>(`/inventory/products/category/${category}`),
  getLowStock: () => api.get<Product[]>(`/inventory/alerts/low-stock`),
  create: (product: Partial<Product>) => api.post<Product>('/inventory/products', product),
  update: (id: string, updates: Partial<Product>) => api.put<Product>(`/inventory/products/${id}`, updates),
  updateStock: (id: string, quantity: number) =>
    api.post<Product>(`/inventory/stock/adjust`, {
      productId: id,
      quantity,
      type: 'set',
      reason: 'Manual adjustment',
    }),
  delete: (id: string) => api.delete(`/inventory/products/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: (limit = 100) => api.get<Sale[]>(`/sales?limit=${limit}`),
  getById: (id: string) => api.get<Sale>(`/sales/${id}`),
  getByDateRange: (startDate: string, endDate: string) =>
    api.get<Sale[]>(`/sales/range/${startDate}/${endDate}`),
  getStats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return api.get(`/sales/stats/summary?${params}`);
  },
  getTopProducts: (limit = 10, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return api.get(`/sales/stats/top-products?${params}`);
  },
  create: (saleData: {
    items: SaleItem[];
    customer_id?: string;
    employee_id?: string;
    payment_method: string;
    notes?: string;
    applied_discount?: number;
  }) => api.post<Sale>('/sales', saleData),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  search: (query: string) => api.get<Customer[]>(`/customers/search/${query}`),
  create: (customer: Partial<Customer>) => api.post<Customer>('/customers', customer),
  update: (id: string, updates: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, updates),
  addLoyaltyPoints: (id: string, points: number) =>
    api.patch<Customer>(`/customers/${id}/loyalty`, { points }),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get<Settings>('/settings'),
  get: (key: string) => api.get<{ key: string; value: string }>(`/settings/${key}`),
  set: (key: string, value: string) => api.put(`/settings/${key}`, { value }),
  setMultiple: (settings: Record<string, string>) => api.post('/settings/bulk', settings),
  delete: (key: string) => api.delete(`/settings/${key}`),
};

export default api;
