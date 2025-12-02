"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    rating?: number;
    category: string;
    image: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);

  return (
    <div
      className={`
        rounded-2xl backdrop-blur-md bg-white/70 border border-blue-200
        overflow-hidden transition-all 
        ${isHovered ? "shadow-2xl -translate-y-2" : "shadow-lg"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE */}
      <div className="relative h-52 bg-blue-100 overflow-hidden">
        <img
          src={product.image || "/default-product.svg"}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />

        {product.discountPrice && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow">
            -
            {Math.round(
              ((product.price - product.discountPrice) / product.price) * 100
            )}
            %
          </div>
        )}

        <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">
          {product.category}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="font-semibold text-blue-900 text-lg truncate">
          {product.name}
        </h3>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < (product.rating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* PRICE */}
        <div className="mb-4">
          {product.discountPrice ? (
            <>
              <p className="text-xl font-bold text-blue-600">
                {formatPrice(product.discountPrice)}
              </p>
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </p>
            </>
          ) : (
            <p className="text-xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </p>
          )}
        </div>

        {/* STOCK */}
        <p
          className={`text-sm mb-3 ${
            product.stock > 0 ? "text-blue-600" : "text-red-600"
          }`}
        >
          {product.stock > 0 ? `Stok: ${product.stock}` : "Stok Habis"}
        </p>

        {/* ADD TO CART BUTTON */}
        <button
          disabled={product.stock === 0}
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.discountPrice || product.price,
              image: product.image,
              stock: product.stock,
            })
          }
          className={`w-full py-2 rounded-xl font-semibold transition-all shadow
            ${
              product.stock > 0
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}
