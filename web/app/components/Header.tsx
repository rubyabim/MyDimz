'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, clearAuthToken } from '../../lib/clientAuth';
import { useCart } from './CartContext';

export default function Header() {
  const { count } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setIsAdmin(Boolean(getAuthToken()));
  }, []);

  return (
    <header className="
      sticky top-0 z-50 
      bg-blue-100/80 
      backdrop-blur-xl 
      border-b border-blue-200 
      shadow-md 
      transition-all
    ">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* LOGO BARU (Foto) */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/warung.png"     // Pastikan nama file sesuai yang di folder public
              width={48}
              height={48}
              alt="Logo Warung"
              className="rounded-xl shadow-lg border border-blue-300 object-cover"
            />

            <span className="text-2xl font-extrabold text-blue-800 tracking-tight">
              MyDimz
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              onKeyDown={(e) => {
                if (e.key === 'Enter')
                  router.push(`/products?search=${encodeURIComponent(query)}`);
              }}
              className="
                w-full px-4 py-2 rounded-l-xl 
                border border-blue-300
                bg-white text-blue-900
                focus:ring-2 focus:ring-blue-400
                transition-all outline-none
              "
            />
            <button
              onClick={() => router.push(`/products?search=${encodeURIComponent(query)}`)}
              className="
                px-6 py-2 rounded-r-xl 
                bg-blue-600 hover:bg-blue-700 
                text-white transition shadow-md
              "
            >
              🔍
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">

            {/* Login / Logout */}
            {isAdmin ? (
              <button
                className="
                  text-blue-800 
                  hover:text-blue-600 
                  transition
                "
                onClick={() => {
                  clearAuthToken();
                  window.location.reload();
                }}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="
                  text-blue-800 
                  hover:text-blue-600 
                  transition
                "
              >
                Login
              </Link>
            )}

            {/* Produk */}
            <Link
              href="/products"
              className="
                text-blue-800 
                hover:text-blue-600 
                transition
              "
            >
              Produk
            </Link>

            {/* Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="
                  text-blue-800 
                  hover:text-blue-600 
                  transition
                "
              >
                Admin
              </Link>
            )}

            {/* Cart */}
            <button
              className="relative"
              onClick={() => (window.location.href = '/cart')}
            >
              <span className="text-2xl text-blue-800">🛒</span>

              {count > 0 && (
                <span
                  className="
                    absolute -top-2 -right-2 
                    bg-red-500 text-white 
                    text-xs rounded-full w-5 h-5 
                    flex items-center justify-center
                    shadow-md
                  "
                >
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
