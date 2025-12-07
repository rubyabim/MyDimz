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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsAdmin(Boolean(getAuthToken()));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAdmin(false);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg border-b-4 border-blue-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-blue-600 text-xl shadow-lg">
              🛍️
            </div>
            <span className="text-2xl font-black text-white hidden sm:inline-block">MyDimz</span>
          </Link>

          {/* Search Bar - Hidden on Mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Cari produk..."
                className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none text-blue-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-r-lg hover:bg-blue-800 transition-colors"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-white font-semibold hover:text-blue-100 transition-colors">
              📦 Produk
            </Link>

            {isAdmin && (
              <>
                <Link href="/admin" className="text-white font-semibold hover:text-blue-100 transition-colors">
                  ⚙️ Admin
                </Link>
                <Link href="/sales" className="text-white font-semibold hover:text-blue-100 transition-colors">
                  📊 Penjualan
                </Link>
              </>
            )}

            {/* Cart Button */}
            <Link href="/cart" className="relative group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {count}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 animate-in fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="flex-1 px-3 py-2 rounded-lg focus:outline-none text-blue-900 text-sm"
                />
                <button type="submit" className="px-3 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800">
                  🔍
                </button>
              </div>
            </form>

            {/* Mobile Links */}
            <div className="space-y-2">
              <Link
                href="/products"
                className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                📦 Produk
              </Link>

              <Link
                href="/cart"
                className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-center relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                🛒 Keranjang {count > 0 && <span className="ml-2 bg-red-500 px-2 rounded-full">{count}</span>}
              </Link>

              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ⚙️ Admin
                  </Link>
                  <Link
                    href="/sales"
                    className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Penjualan
                  </Link>
                </>
              )}

              {isAdmin ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
