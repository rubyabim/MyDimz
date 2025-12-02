'use client';

import { useEffect, useState } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import { fetchPublicProducts } from '../lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchPublicProducts();

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data?.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);

      setProducts([
        {
          id: 1,
          name: 'Beras Premium 5kg',
          price: 75000,
          category: 'Makanan',
          image: 'https://via.placeholder.com/300x200?text=Beras',
          stock: 50,
        },
        {
          id: 2,
          name: 'Minyak Goreng 2L',
          price: 32000,
          category: 'Kebutuhan Rumah',
          image: 'https://via.placeholder.com/300x200?text=Minyak',
          stock: 30,
        },
        {
          id: 3,
          name: 'Gula Pasir 1kg',
          price: 15000,
          category: 'Makanan',
          image: 'https://via.placeholder.com/300x200?text=Gula',
          stock: 100,
        },
        {
          id: 4,
          name: 'Teh Celup',
          price: 8500,
          category: 'Minuman',
          image: 'https://via.placeholder.com/300x200?text=Teh',
          stock: 80,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-r from-blue-300 to-blue-400 text-white py-24 shadow-md">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow">
              Selamat Datang di Warung Ibuk Iyos
            </h1>

            <p className="text-lg mb-8 text-white/95">
              Belanja kebutuhan sehari-hari kini lebih mudah, cepat, dan murah!
            </p>

            <div className="flex items-center justify-center gap-4">
              <button className="px-8 py-3 rounded-full bg-white text-blue-600 font-semibold shadow hover:shadow-lg transition">
                Mulai Belanja
              </button>

              <button className="px-6 py-3 rounded-full border border-white text-white font-semibold hover:bg-white/20 transition">
                Lihat Produk
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute -bottom-10 left-10 w-56 h-56 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
      </section>

      {/* KATEGORI PRODUK */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-blue-900">Kategori Produk</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Makanan', icon: '🍛' },
            { name: 'Minuman', icon: '🥤' },
            { name: 'Bumbu Dapur', icon: '🧂' },
            { name: 'Kebutuhan Rumah', icon: '🏠' },
          ].map((item) => (
            <div
              key={item.name}
              className="
                bg-white p-6 rounded-xl shadow border border-blue-200
                hover:shadow-xl transition transform hover:-translate-y-2 cursor-pointer
              "
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-blue-700">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUK TERBARU */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-blue-900">Produk Terbaru</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-700 text-white py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col items-center text-center gap-2">
          <div>
            <div className="font-bold text-lg">MyDimz</div>
            <div className="text-sm text-white/80">
              Belanja kebutuhan sehari-hari dengan mudah
            </div>
          </div>

          <div className="text-sm text-white/70">
            &copy; 2025 MyDimz — All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
