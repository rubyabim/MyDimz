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


export interface Sale {
  id: number;
  date: Date;
  total: number;
  cashier: string;
  items: SaleItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}


export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}