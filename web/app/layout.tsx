// Import tipe Metadata dari Next.js

// Digunakan untuk

import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from './components/CartContext';

export const metadata: Metadata = {
  title: 'Toko Kelontong MyDimz',
  description: 'Belanja kebutuhan sehari-hari dengan mudah',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen font-poppins bg-[var(--color-bg)] overflow-y-auto overflow-x-hidden">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
