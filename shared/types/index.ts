// Shared types across all microservices

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  wholesalePrice?: number;
  category: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  taxApplicable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  creditLimit?: number;
  outstandingBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  transactionNumber: string;
  customerId?: string;
  employeeId?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  items: SaleItem[];
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  saleId: string;
  amount: number;
  method: 'cash' | 'mpesa' | 'card' | 'credit';
  status: 'pending' | 'completed' | 'failed';
  mpesaReference?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  quantity: number;
  type: 'increase' | 'decrease' | 'set';
  reason: string;
  userId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  type: 'sms' | 'email' | 'in_app';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

// Event types for event bus
export interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface ProductCreatedEvent extends Event {
  type: 'product.created';
  data: Product;
}

export interface ProductUpdatedEvent extends Event {
  type: 'product.updated';
  data: Product;
}

export interface StockLowEvent extends Event {
  type: 'stock.low';
  data: {
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
  };
}

export interface StockAdjustedEvent extends Event {
  type: 'stock.adjusted';
  data: StockAdjustment;
}

export interface SaleCompletedEvent extends Event {
  type: 'sale.completed';
  data: Sale;
}

export interface SaleRefundedEvent extends Event {
  type: 'sale.refunded';
  data: {
    saleId: string;
    amount: number;
    reason: string;
  };
}

export interface PaymentInitiatedEvent extends Event {
  type: 'payment.initiated';
  data: Payment;
}

export interface PaymentConfirmedEvent extends Event {
  type: 'payment.confirmed';
  data: Payment;
}

export interface PaymentFailedEvent extends Event {
  type: 'payment.failed';
  data: Payment;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
