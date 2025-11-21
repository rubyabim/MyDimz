export interface User {
    id: number;
    username: string;
    role: string;
    createdAt: string;
    updatedAt: string;
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
    createdAt: string;
    updatedAt: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Sale {
    id: number;
    date: string;
    total: number;
    cashier: string;
    items: SaleItem[];
    createdAt: string;
    updatedAt: string;
}

export interface SaleItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: Product;
}