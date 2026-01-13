"use client";

import { useState } from "react";
import Header from "../components/Header";
import { useCart } from "../components/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  // Mengambil fungsi & data keranjang dari "Context" global (useCart)
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  // State untuk mengontrol status loading saat proses bayar/checkout
  const [processing, setProcessing] = useState(false);
  // State untuk memilih cara bayar (default: tunai)
  const [paymentMethod, setPaymentMethod] = useState("cash");
  // Alat untuk berpindah halaman (misal: ke halaman sukses setelah bayar)
  const router = useRouter();

  const handleCheckout = async () => {
    // Mengecek apakah ada barang di dalam keranjang
    if (items.length === 0) {
      // Tampilkan peringatan instan kepada pengguna
      alert("Keranjang kosong!");
      // Berhenti di sini (Early Return)
      // Jangan biarkan kode pembayaran di bawahnya berjalan
      return;
    }

    try {
      // Aktifkan status "sedang diproses"
      setProcessing(true);

      // Simpan transaksi ke API
      const response = await fetch(
        // Mengambil alamat server dari variabel lingkungan atau default ke localhost
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:500/api"}/sales`,
        {
          // Menggunakan POST karena kita mengirim data baru untuk disimpan
          method: "POST",
          headers: {
            // Memberitahu server bahwa data yang dikirim berbentuk JSON
            "Content-Type": "application/json",
          },
          // Body: Data pesanan yang sudah dikonversi menjadi teks (string)
          body: JSON.stringify({
            customerId: 0, // Identitas pelanggan (0 berarti pelanggan anonim/umum)
            items: items.map((item) => ({ 
              productId: item.id, // Hanya mengirimkan ID produk
              quantity: item.quantity, // Hanya mengirimkan ID produk
            })),
            // Metode pembayaran yang dipilih 
            paymentMethod,
            notes: `Online order via web`,
          }),
        }
      );

      // Mengecek apakah status respon dari server berada di luar rentang sukses (200-299)
      if (!response.ok) {
        throw new Error("Checkout gagal");
      }

      // Clear cart dan redirect
      clearCart();
      alert("Pembelian berhasil! Terima kasih telah berbelanja.");
      router.push("/");
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal melakukan checkout. Silakan coba lagi.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-blue-900">🛒 Keranjang Belanja</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-xl text-blue-600 font-semibold mb-6">Keranjang Anda kosong</p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Lanjut Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daftar Produk */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4 items-start">
                    {/* Gambar */}
                    <img
                      src={item.image || "https://via.placeholder.com/100"}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    {/* Detail Produk */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-900">{item.name}</h3>
                      <p className="text-sm text-blue-600 mb-2">{item.category}</p>
                      <p className="text-xl font-bold text-blue-700">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 bg-blue-50 text-blue-900 font-semibold rounded">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-900">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm mt-2"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                {/* Order Summary */}
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Ringkasan Pesanan</h2>

                <div className="space-y-3 mb-6 border-b border-blue-200 pb-6">
                  <div className="flex justify-between text-blue-700">
                    <span>Subtotal ({items.length} item):</span>
                    <span>Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Pajak (10%):</span>
                    <span>Rp {(total * 0.1).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Pengiriman:</span>
                    <span className="text-green-600 font-semibold">Gratis</span>
                  </div>
                </div>

                <div className="flex justify-between text-2xl font-bold text-blue-900 mb-6 bg-blue-100 p-3 rounded-lg">
                  <span>Total:</span>
                  <span>Rp {(total * 1.1).toLocaleString("id-ID")}</span>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="cash">💰 Tunai</option>
                    <option value="transfer">💳 Transfer Bank</option>
                    <option value="eWallet">📱 E-Wallet</option>
                  </select>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={processing || items.length === 0}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    processing || items.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {processing ? "Memproses..." : "✓ Checkout"}
                </button>

                <button
                  onClick={() => clearCart()}
                  className="w-full mt-2 py-2 rounded-lg font-semibold text-red-600 border-2 border-red-300 hover:bg-red-50 transition-colors"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
