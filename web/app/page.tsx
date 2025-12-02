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

  // === SLIDER BACKGROUND dengan ANIMASI GESER ===
  const backgroundImages = [
    "/slider/1.png",
    "/slider/2.jpg",
    "/slider/3.jpg",
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Slider otomatis dengan animasi geser
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsAnimating(false);
      }, 600); // durasi animasi slide
      
    }, 5000); // ganti slide setiap 5 detik

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // ===========================

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

      // fallback data
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

  const handleDotClick = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setBgIndex(index);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      {/* HERO SECTION dengan SLIDER GESER OTOMATIS */}
      <section className="relative text-white py-24 shadow-md overflow-hidden">
        {/* Container untuk semua gambar background */}
        <div className="absolute inset-0">
          {backgroundImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
                index === bgIndex 
                  ? 'translate-x-0 opacity-100' 
                  : index < bgIndex
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
              }`}
              style={{
                backgroundImage: `url(${img})`,
              }}
            />
          ))}
        </div>

        {/* Overlay dengan blur dan darkening */}
        <div 
          className="absolute inset-0 backdrop-blur-sm bg-black/40"
          style={{
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg">
              Selamat Datang di Warung Ibuk Iyos
            </h1>

            <p className="text-lg mb-8 text-white/95 drop-shadow">
              Belanja kebutuhan sehari-hari kini lebih mudah, cepat, dan murah!
            </p>
          </div>
        </div>

        {/* Indikator Slider */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === bgIndex 
                  ? 'bg-white w-10' 
                  : 'bg-white/50 hover:bg-white/75 w-2'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Decorative Blur Effect */}
        <div className="absolute -bottom-10 left-10 w-56 h-56 bg-white/20 rounded-full blur-3xl z-0" />
        <div className="absolute -top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl z-0" />
      </section>

      {/* KATEGORI */}
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

      {/* PRODUK */}
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
          <div className="font-bold text-lg">MyDimz</div>
          <div className="text-sm text-white/80">
            Belanja kebutuhan sehari-hari dengan mudah
          </div>

          <div className="text-sm text-white/70">
            &copy; 2025 MyDimz — All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
