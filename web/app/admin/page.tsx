"use client";

import Header from '../../app/components/Header';
import { useEffect, useState } from 'react';
import { getAuthToken } from '../../lib/clientAuth';
import { fetchAdminProducts, authFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  stock: number;
};

export default function AdminDashboard() {
  // Menyimpan daftar barang yang ditarik dari database
  const [products, setProducts] = useState<Product[]>([]);
  // Status loading untuk nampilin spinner saat ambil data
  const [loading, setLoading] = useState(true);
  // Menyimpan teks pencarian kalau admin mau cari barang tertentu
  const [search, setSearch] = useState('');
  // Memastikan komponen sudah menempel di layar (cegah error hydration)
  const [mounted, setMounted] = useState(false);
  // Menyimpan kunci akses (token) untuk otorisasi ke server
  const [token, setToken] = useState<string | null>(null);
  // Alat navigasi untuk pindah-pindah halaman (misal ke form tambah produk)
  const router = useRouter();

  // Get token on client side only to avoid hydration mismatch
  useEffect(() => {
    // Ambil "kunci" (token) yang tersimpan di memori HP/Browser
    const clientToken = getAuthToken();
    // Simpan token tersebut ke dalam state agar bisa dipakai komponen lain
    setToken(clientToken);
    // Tandai bahwa aplikasi sudah sepenuhnya siap di sisi user (Client)
    setMounted(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!token) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchAdminProducts(token, { search: search || undefined });
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray(data.products)) setProducts(data.products);
      } catch (error) {
        console.error('Failed to fetch admin products', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, search]);

  // Show nothing during hydration
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Admin dashboard</h2>
            <div className="text-sm text-gray-600">You must be logged in as admin to see this page. Please <Link href="/login" className="text-primary-600 underline">login</Link>.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link href="/products/new" className="btn-primary">+ New Product</Link>
        </div>
        <div className="mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded-md px-4 py-2" placeholder="Search products..." />
        </div>

        {loading ? (
          <div>Loading admin products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center gap-4">
                  <img src={p.image || '/default-product.svg'} alt={p.name} className="w-24 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-slate-600">Stock: {p.stock}</div>
                    <div className="text-sm text-primary-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.price)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/products/${p.id}`} className="btn-ghost">Edit</Link>
                    <button
                      className="btn-ghost"
                      onClick={async () => {
                        if (!confirm(`Delete product ${p.name}?`)) return;
                        const res = await authFetch(`/products/${p.id}`, { method: 'DELETE' }, token || undefined);
                        if (!res || !res.ok) {
                          alert('Failed to delete product');
                          return;
                        }
                        // Refresh list
                        setProducts((prev) => prev.filter((x) => x.id !== p.id));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
