"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { authFetch, fetchProductById } from "@/lib/api";
import { getAuthToken } from "@/lib/clientAuth";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  barcode?: string;
  image?: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const isAdmin = typeof window !== "undefined" && Boolean(getAuthToken());

  // Load product data
  useEffect(() => {
    if (!id) return;
    void fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetchProductById(String(id));
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        setError(msg?.error || "Failed to load product");
        return;
      }
      setProduct(await res.json());
    } catch {
      setError("Unexpected error while loading product");
    } finally {
      setLoading(false);
    }
  };

  /** UPLOAD IMAGE */
  const handleUpload = async () => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await authFetch(
        "/uploads",
        { method: "POST", body: fd },
        getAuthToken()
      );

      if (!res || !res.ok) {
        const b = await res?.json().catch(() => null);
        return setError(b?.error || "Failed to upload file");
      }

      const data = await res.json();
      setProduct({ ...product!, image: data.url });
    } catch {
      setError("Failed to upload file");
    }
  };

  /** UPDATE PRODUCT */
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isAdmin) return router.push("/login");
    if (!product) return;

    try {
      setSubmitting(true);

      const res = await authFetch(
        `/products/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        },
        getAuthToken()
      );

      if (!res.ok) {
        const b = await res.json().catch(() => null);
        setError(b?.error || "Failed to update product");
        return;
      }

      setSuccess("Produk berhasil diperbarui!");
      router.push("/products");
    } catch {
      setError("Unexpected error while updating");
    } finally {
      setSubmitting(false);
    }
  };

  // LOADING SKELETON
  if (loading) {
    return (
      <div className="mt-10 mx-auto max-w-md p-6 bg-white rounded-2xl shadow border border-blue-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-blue-200/50 rounded-full" />
          <div className="h-32 bg-blue-200/50 rounded-xl" />
          <div className="h-10 bg-blue-200/50 rounded-lg" />
          <div className="h-10 bg-blue-200/50 rounded-lg" />
        </div>
      </div>
    );
  }

  // PRODUCT NOT FOUND
  if (!product) {
    return (
      <div className="mt-10 mx-auto max-w-md text-center p-6 rounded-xl border border-blue-200 bg-blue-50">
        <p className="text-blue-600 font-medium">Produk tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-xl p-6 bg-white rounded-2xl shadow-md border border-blue-100">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Edit Produk</h1>

      {/* IMAGE PREVIEW */}
      <div className="mb-4 flex h-40 items-center justify-center bg-blue-50 border border-blue-200 rounded-xl">
        <Image
          src={product.image || "/default-product.svg"}
          alt={product.name}
          width={220}
          height={120}
          className="rounded-md transition hover:scale-105"
          // If image is stored at a dev backend (localhost:500), we allow
          // Next to use it but skip the image optimizer in dev to avoid issues
          // with optimization service and ports. Remove `unoptimized` in prod
          // when a proper CDN or allowed domains are added.
          unoptimized={product.image ? true : false}
        />
      </div>

      {/* UPLOAD IMAGE */}
      <div className="mb-4">
        <label className="font-medium text-blue-700 text-sm mb-1 block">
          Image URL
        </label>

        <div className="flex gap-2">
          <input
            value={product.image || ""}
            onChange={(e) =>
              setProduct({ ...product, image: e.target.value })
            }
            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
            placeholder="https://example.com/img.jpg"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />

          <button
            type="button"
            onClick={handleUpload}
            className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 shadow"
          >
            Upload
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="mb-3 p-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 text-sm rounded-lg bg-green-50 border border-green-200 text-green-700">
          {success}
        </div>
      )}

      {/* FORM */}
      <form className="space-y-4" onSubmit={handleUpdate}>
        {/* NAME */}
        <div>
          <label className="text-sm font-medium text-blue-700 mb-1 block">
            Nama Produk
          </label>
          <input
            value={product.name}
            onChange={(e) =>
              setProduct({ ...product, name: e.target.value })
            }
            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* PRICE & STOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-blue-700 mb-1 block">
              Harga
            </label>
            <input
              type="number"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: Number(e.target.value) })
              }
              className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-blue-700 mb-1 block">
              Stok
            </label>
            <input
              type="number"
              value={product.stock}
              onChange={(e) =>
                setProduct({ ...product, stock: Number(e.target.value) })
              }
              className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="text-sm font-medium text-blue-700 mb-1 block">
            Kategori
          </label>
          <input
            value={product.category || ""}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium text-blue-700 mb-1 block">
            Deskripsi
          </label>
          <textarea
            rows={3}
            value={product.description || ""}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* BARCODE */}
        <div>
          <label className="text-sm font-medium text-blue-700 mb-1 block">
            Barcode
          </label>
          <input
            value={product.barcode || ""}
            onChange={(e) =>
              setProduct({ ...product, barcode: e.target.value })
            }
            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="px-4 py-2 rounded-full border border-blue-300 text-blue-600 font-medium hover:bg-blue-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium shadow hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? "Saving..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
