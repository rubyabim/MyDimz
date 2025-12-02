"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { fetchPublicProducts } from "../../lib/api";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();

  // Initialize search from query param
  useEffect(() => {
    const qSearch = searchParams?.get("search") || "";
    if (qSearch !== search) setSearch(qSearch);
    void loadProducts();
  }, [filter, search, searchParams]);

  const loadProducts = async () => {
    try {
      const searchFilter = filter === "all" ? undefined : filter;
      const data = await fetchPublicProducts({
        category: searchFilter,
        search: search || undefined,
      });

      if (Array.isArray(data)) setProducts(data as any);
      else if (data && Array.isArray(data.products)) setProducts(data.products);
      else setProducts([]);
    } catch (error) {
      // Dummy data saat API error
      const dummyProducts: Product[] = [
        {
          id: 1,
          name: "Beras Premium 5kg",
          price: 75000,
          category: "Makanan",
          image: "https://via.placeholder.com/300x200?text=Beras",
          stock: 50,
        },
        {
          id: 2,
          name: "Minyak Goreng 2L",
          price: 32000,
          category: "Kebutuhan Rumah",
          image: "https://via.placeholder.com/300x200?text=Minyak",
          stock: 30,
        },
        {
          id: 3,
          name: "Gula Pasir 1kg",
          price: 15000,
          category: "Makanan",
          image: "https://via.placeholder.com/300x200?text=Gula",
          stock: 100,
        },
        {
          id: 4,
          name: "Teh Celup",
          price: 8500,
          category: "Minuman",
          image: "https://via.placeholder.com/300x200?text=Teh",
          stock: 80,
        },
      ];

      if (filter === "all") setProducts(dummyProducts);
      else setProducts(dummyProducts.filter((p) => p.category === filter));
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-10">
        {/* PAGE TITLE */}
        <h1 className="text-4xl font-extrabold mb-10 text-blue-700 drop-shadow-sm">
          Semua Produk
        </h1>

        {/* FILTER SECTION */}
        <div className="mb-10 flex gap-4 flex-wrap">
          {/* Search Box */}
          <div className="flex-1 min-w-[250px]">
            <input
              className="w-full border border-blue-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          {[
            "all",
            "Makanan",
            "Minuman",
            "Bumbu Dapur",
            "Kebutuhan Rumah",
          ].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all border shadow-sm ${
                filter === category
                  ? "bg-blue-500 text-white border-blue-600 shadow-md"
                  : "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
              }`}
            >
              {category === "all" ? "Semua" : category}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-blue-700 mt-10 font-semibold">
            Produk tidak ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
