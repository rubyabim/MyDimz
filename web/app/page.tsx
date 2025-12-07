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
  const [bgIndex, setBgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const backgroundImages = ["/slider/1.png", "/slider/2.jpg", "/slider/3.jpg"];

  const categories = [
    { name: 'Makanan', icon: '🍛' },
    { name: 'Minuman', icon: '🥤' },
    { name: 'Bumbu Dapur', icon: '🧂' },
    { name: 'Kebutuhan Rumah', icon: '🏠' },
  ];

  const fallbackProducts: Product[] = [
    { id: 1, name: 'Beras Premium 5kg', price: 75000, category: 'Makanan', image: 'https://via.placeholder.com/300x200?text=Beras', stock: 50 },
    { id: 2, name: 'Minyak Goreng 2L', price: 32000, category: 'Kebutuhan Rumah', image: 'https://via.placeholder.com/300x200?text=Minyak', stock: 30 },
    { id: 3, name: 'Gula Pasir 1kg', price: 15000, category: 'Makanan', image: 'https://via.placeholder.com/300x200?text=Gula', stock: 100 },
    { id: 4, name: 'Teh Celup', price: 8500, category: 'Minuman', image: 'https://via.placeholder.com/300x200?text=Teh', stock: 80 },
  ];

  // Slider otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsAnimating(false);
      }, 600);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Load products
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
      setProducts(fallbackProducts);
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

      {/* HERO SECTION */}
      <section className="relative text-white py-24 shadow-md overflow-hidden">
        {/* Background Images */}
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
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div 
          className="absolute inset-0 backdrop-blur-sm bg-black/40"
          style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
        />

        {/* Content */}
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

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === bgIndex ? 'bg-white w-10' : 'bg-white/50 hover:bg-white/75 w-2'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-10 left-10 w-56 h-56 bg-white/20 rounded-full blur-3xl z-0" />
        <div className="absolute -top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl z-0" />
      </section>

      {/* KATEGORI */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-blue-900">Kategori Produk</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((item) => (
            <div
              key={item.name}
              className="bg-white p-6 rounded-xl shadow border border-blue-200 hover:shadow-xl transition transform hover:-translate-y-2 cursor-pointer"
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* INFO WARUNG */}
            <div>
              <h3 className="text-xl font-bold mb-4">MyDimz</h3>
              <p className="text-blue-100 mb-4 text-sm leading-relaxed">
                Warung Ibuk Iyos menyediakan kebutuhan sehari-hari dengan harga terjangkau dan kualitas terbaik.
              </p>
              <div className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <span className="text-lg">📍</span>
                  <span className="text-blue-100">Warung Ibuk Iyos, Bandar Lampung</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <span className="text-blue-100">+62 812-3456-7890</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-lg">⏰</span>
                  <span className="text-blue-100">Buka Setiap Hari: 07.00 - 20.00</span>
                </p>
              </div>
            </div>

            {/* LINK CEPAT */}
            <div>
              <h3 className="text-xl font-bold mb-4">Link Cepat</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-100 hover:text-white transition">Tentang Kami</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">Produk</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">Promo</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">Hubungi Kami</a></li>
              </ul>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Ikuti Kami</h4>
                <div className="flex gap-3">
                  {/* Facebook */}
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full flex items-center justify-center transition hover:scale-110"
                    aria-label="Facebook"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/2048px-2023_Facebook_icon.svg.png"
                      alt="Facebook"
                      className="w-10 h-10 object-contain"
                    />
                  </a>

                  {/* Instagram */}
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full flex items-center justify-center transition hover:scale-110"
                    aria-label="Instagram"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png"
                      alt="Instagram"
                      className="w-10 h-10 object-contain"
                    />
                  </a>


                 
                </div>
              </div>
            </div>

            {/* GOOGLE MAPS */}
            <div>
              <h3 className="text-xl font-bold mb-4">Lokasi Kami</h3>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <div className="map-responsive">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31778.75461999549!2d105.24774783977945!3d-5.3643336106385675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40dad5c15c513d%3A0x7621a348d56c27c3!2sWarung%20Iyos!5e0!3m2!1sid!2sid!4v1764704170694!5m2!1sid!2sid"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Warung Ibuk Iyos"
                  />
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/UkLV19W9JJu7XT2i6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-blue-200 hover:text-white transition"
              >
                📍 Lihat di Google Maps →
              </a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="bg-blue-950 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-blue-200">
            &copy; 2025 MyDimz All rights reserved.
          </div>
        </div>
      </footer>

      {/* CSS untuk Responsive Map */}
      <style jsx>{`
        .map-responsive {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
        }
        .map-responsive iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}
