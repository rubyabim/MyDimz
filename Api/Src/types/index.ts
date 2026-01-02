// src/types/index.ts

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  description?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
  createdAt: Date;
}

export interface Sale {
  id: number;
  customerId: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  items: SaleItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface ProductRequest {
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  description?: string;
  barcode?: string;
}

export interface SaleRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  cashier: string;
}

export interface PublicProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Category {
  name: string;
  count: number;
}

// Extend Express Request supaya ada req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}

// WAJIB: export {} supaya file ini dianggap sebagai module
export {};
