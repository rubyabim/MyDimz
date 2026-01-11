"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/clientAuth";

export default function NewProductPage() {
  const router = useRouter();
  const isAdmin =
    typeof window !== "undefined" && Boolean(getAuthToken());

  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("general");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAdmin) {
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);

      const res = await authFetch(
        "/products",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            price: Number(price),
            stock: Number(stock),
            category,
            image,
          }),
        },
        getAuthToken()
      );

      if (!res.ok) {
        const b = await res.json().catch(() => null);
        const message =
          res.status === 0
            ? `Unable to reach API at ${
                process.env.NEXT_PUBLIC_API_BASE_URL ||
                "http://localhost:500/api"
              }`
            : b?.error || "Failed to create product";
        setError(message);
        setSubmitting(false);
        return;
      }

      router.push("/products");
    } catch (e) {
      setError("Unexpected error while creating product");
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const token = getAuthToken();
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await authFetch('/uploads', { method: 'POST', body: fd }, token);
      if (!res || !res.ok) {
        const b = await res?.json().catch(() => null);
        setError(b?.error || 'Failed to upload file');
        return;
      }
      const data = await res.json();
      setImage(data.url);
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">
        Create Product
      </h1>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        className="space-y-3"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Price
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Stock
            </label>
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stock"
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Category
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Image URL
          </label>
          <div className="flex gap-2">
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... (image url)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="button" className="btn-ghost" onClick={handleUpload}>Upload</button>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            onClick={() => router.push("/products")}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/40 transition hover:bg-blue-700 hover:shadow-blue-500/60 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
