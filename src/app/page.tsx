"use client";

import { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. Fetch Products
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success) setProducts(data.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Handle Create / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      setEditingId(null);
    } else {
      // Create
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
    }

    setForm({ name: "", price: "", description: "" });
    fetchProducts();
  };

  // 3. Edit Click
  const handleEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({ name: p.name, price: p.price.toString(), description: p.description });
  };

  // 4. Delete
  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus produk ini?")) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">CRUD Product Next.js + MongoDB</h1>

      {/* Form Create / Edit */}
      <form onSubmit={handleSubmit} className="bg-slate-100 p-4 rounded-xl space-y-3 mb-8">
        <h2 className="font-semibold text-lg">{editingId ? "Edit Produk" : "Tambah Produk"}</h2>
        <input
          type="text"
          placeholder="Nama Produk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Harga"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Deskripsi"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? "Update Produk" : "Simpan Produk"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", price: "", description: "" });
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* List Product */}
      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-4 rounded-xl flex justify-between items-center bg-white shadow-sm">
            <div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-gray-500 text-sm">{p.description}</p>
              <p className="text-emerald-600 font-semibold mt-1">
                Rp {p.price.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="bg-amber-500 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}