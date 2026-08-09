export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  deliveryMode: 'AUTO' | 'MANUAL';
  stockCount: number;
  accountFormat: string;
  displayType: 'MULTI_LINE' | 'RAW';
  attributes?: Record<string, string>;
}

export interface Account {
  id: number;
  productId: number;
  accountData: string[];
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  soldAt: string | null;
}

export interface OrderTable {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  deliveryMode: 'AUTO' | 'MANUAL';
  paymentMethod: 'WALLET' | 'BANK_TRANSFER';
  createdAt: string;
  customer: {
    telegramId: number;
    username: string;
    firstName: string;
  };
}

export interface PaymentConfig {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  webhookApiKey: string;
  isDefault: boolean;
}
