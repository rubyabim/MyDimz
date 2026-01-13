// Import tipe Metadata dari Next.js

// Digunakan untuk mengatur SEO seperti title dan description

import type { Metadata } from 'next';
// Import global CSS
// Biasanya berisi reset  CSS , font, dan variabel  warna
import './globals.css';
// Import CartProvider
// Berfungsi  sebagai Context untuk 

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
