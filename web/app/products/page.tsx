"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { fetchPublicProducts } from "../../lib/api";
import { getUserProfile, isAdmin as checkIsAdmin } from "../../lib/clientAuth";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  count: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [isAdmin, setIsAdmin] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from query params
  useEffect(() => {
    const qSearch = searchParams?.get("search") || "";
    const qCategory = searchParams?.get("category") || "all";
    setSearch(qSearch);
    setFilter(qCategory);
  }, [searchParams]);

  // Load products when filters change
  useEffect(() => {
    void loadProducts();
  }, [filter, search, sortBy]);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Check user role
  const checkUserRole = async () => {
    try {
      const user = await getUserProfile();
      console.log('User profile:', user);
      const adminStatus = user ? checkIsAdmin(user) : false;
      console.log('Is admin:', adminStatus);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkUserRole();
  }, []);

  const loadCategories = async () => {
    try {
      const categorySet = new Set<string>();
      const data = await fetchPublicProducts({});
      const allProducts = Array.isArray(data) ? data : data?.products || [];
      
      allProducts.forEach((p: any) => {
        if (p.category) categorySet.add(p.category);
      });

      const cats: Category[] = Array.from(categorySet).map((name, idx) => ({
        id: idx,
        name,
        count: allProducts.filter((p: any) => p.category === name).length,
      }));

      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchFilter = filter === "all" ? undefined : filter;
      const data = await fetchPublicProducts({
        category: searchFilter,
        search: search || undefined,
      });

      let productList = Array.isArray(data) ? data : data?.products || [];

      // Sort products
      if (sortBy === "price-low") {
        productList = productList.sort((a: any, b: any) => a.price - b.price);
      } else if (sortBy === "price-high") {
        productList = productList.sort((a: any, b: any) => b.price - a.price);
      } else if (sortBy === "name") {
        productList = productList.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }

      setProducts(productList);
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    if (filter !== "all") params.set("category", filter);
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryFilter = (category: string) => {
    setFilter(category);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">
            Produk Kami
          </h1>
          <p className="text-blue-600 text-lg">
            Temukan produk berkualitas dengan harga terbaik
          </p>
        </div>

        {/* Search Bar - Sticky di atas */}
        <div className="mb-8 sticky top-0 z-40 bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Cari produk..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-blue-300 focus:outline-none focus:border-blue-600 text-blue-900 placeholder-blue-400 transition-colors"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border-2 border-blue-300 focus:outline-none focus:border-blue-600 text-blue-900 bg-white transition-colors"
            >
              <option value="latest">Terbaru</option>
              <option value="price-low">Harga: Termurah</option>
              <option value="price-high">Harga: Termahal</option>
              <option value="name">Nama: A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Filter - Horizontal scroll yang responsive */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-3 min-w-max">
            <button
              onClick={() => handleCategoryFilter("all")}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all transform hover:scale-105 ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-blue-600 border-2 border-blue-300 hover:bg-blue-100"
              }`}
            >
              Semua Produk
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.name)}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all transform hover:scale-105 ${
                  filter === cat.name
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-blue-600 border-2 border-blue-300 hover:bg-blue-100"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 text-blue-600 font-semibold text-lg">
          Ditemukan <span className="text-blue-800">{products.length}</span> produk
          {search && ` untuk "${search}"`}
          {filter !== "all" && ` di kategori ${filter}`}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-blue-600 font-semibold">Memuat produk...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-xl shadow-lg p-12 text-center border-2 border-red-300">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-xl text-red-600 font-semibold mb-2">{error}</p>
            <button
              onClick={() => loadProducts()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-blue-600 font-semibold mb-2">Produk tidak ditemukan</p>
            <p className="text-blue-500">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fadeIn">
            {products.map((product) => (
              <div key={product.id} className="h-full transform transition-transform hover:scale-105">
                <ProductCard product={product} isAdmin={isAdmin} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
