 'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'md-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((cur) => {
      const index = cur.findIndex((i) => i.id === item.id);
      if (index === -1) {
        const newItem: CartItem = { ...item, quantity: Math.min(qty, item.stock) };
        return [...cur, newItem];
      }
      const newArray = [...cur];
      const existing = newArray[index];
      const newQty = Math.min(existing.quantity + qty, existing.stock);
      newArray[index] = { ...existing, quantity: newQty };
      return newArray;
    });
  };

  const updateQuantity = (id: number, qty: number) => {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, Math.min(qty, i.stock)) } : i)).filter((i) => i.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setItems((cur) => cur.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const count = items.reduce((s, it) => s + it.quantity, 0);
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
