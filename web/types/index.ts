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
}