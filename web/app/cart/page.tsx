"use client";

import Header from '../components/Header';
import { useCart } from '../components/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Keranjang Belanja</h1>

        {items.length === 0 ? (
          <div className="p-6 text-center bg-white border border-blue-200 rounded-xl shadow">
            <p className="text-blue-600 font-medium">Keranjang kosong.</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* LIST ITEM */}
            {items.map((it) => (
              <div
                key={it.id}
                className="p-4 bg-white border border-blue-200 rounded-xl shadow flex items-center gap-4"
              >
                <img
                  src={it.image}
                  className="w-28 h-20 object-cover rounded-md border border-blue-100"
                  alt={it.name}
                />

                <div className="flex-1">
                  <div className="font-semibold text-blue-800">{it.name}</div>
                  <div className="text-sm text-blue-500">
                    Harga:{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(it.price)}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-100"
                    onClick={() => updateQuantity(it.id, it.quantity - 1)}
                  >
                    -
                  </button>

                  <div className="px-3 py-1 border border-blue-300 text-blue-700 rounded bg-blue-50">
                    {it.quantity}
                  </div>

                  <button
                    className="px-2 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-100"
                    onClick={() => updateQuantity(it.id, it.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Total per item */}
                <div className="text-right">
                  <div className="font-semibold text-blue-700">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(it.price * it.quantity)}
                  </div>

                  <button
                    className="mt-2 text-sm text-red-500 hover:text-red-600"
                    onClick={() => removeFromCart(it.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}

            {/* TOTAL */}
            <div className="p-4 bg-white border border-blue-200 rounded-xl shadow flex items-center justify-between">
              <div className="text-blue-600 font-medium">Total:</div>
              <div className="text-xl font-bold text-blue-700">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(total)}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-100"
                onClick={() => clearCart()}
              >
                Kosongkan
              </button>

              <button
                className="px-6 py-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700"
              >
                Checkout (dummy)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
