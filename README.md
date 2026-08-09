# Panduan Pembuatan Aplikasi CRUD Product (Next.js & MongoDB)

Dokumen ini berisi panduan langkah demi langkah untuk membangun aplikasi CRUD (Create, Read, Update, Delete) sederhana mengelola data produk menggunakan Next.js (App Router), TypeScript, Mongoose, dan MongoDB Atlas, mulai dari persiapannya hingga tahap deployment ke Vercel.

## Daftar Isi

1. [Persyaratan System](#1-persyaratan-system)
2. [Konfigurasi MongoDB Atlas](#2-konfigurasi-mongodb-atlas)
3. [Inisialisasi Project Next.js](#3-inisialisasi-project-nextjs)
4. [Koneksi Database](#4-koneksi-database)
5. [Pembuatan Model Database](#5-pembuatan-model-database)
6. [Pembuatan API Routes](#6-pembuatan-api-routes)
7. [Pembuatan Halaman Utama UI](#7-pembuatan-halaman-utama-ui)
8. [Pengujian Lokal](#8-pengujian-lokal)
9. [Deployment ke Production (Vercel)](#9-deployment-ke-production-vercel)

---

## 1. Persyaratan System

Sebelum memulai, pastikan perangkat Anda telah terinstall:

- Node.js versi 18.x atau yang terbaru
- npm, pnpm, atau yarn
- Akun MongoDB Atlas
- Akun Vercel / GitHub

---

## 2. Konfigurasi MongoDB Atlas

1. Login ke MongoDB Atlas.
2. Buat **Project** baru dan buat **Cluster** (opsi M0 Free Tier).
3. Buat **Database User** di menu **Database Access**:
   - Simpan Username dan Password.
4. Atur **Network Access** di menu **Network Access**:
   - Klik **Add IP Address**.
   - Pilih **Allow Access from Anywhere (0.0.0.0/0)** agar aplikasi dapat terhubung dari server development lokal maupun production.
5. Dapatkan **String Koneksi**:
   - Klik **Database** -> **Connect** -> **Drivers**.
   - Salin URI koneksi yang disediakan. Formatnya seperti berikut:

---

## 3. Inisialisasi Project Next.js

Buka terminal dan jalankan perintah berikut untuk membuat project baru:

```bash
npx create-next-app@latest nextjs_mongodb_crud
```

Opsi rekomendasi konfigurasi CLI:

- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- App Router: **Yes**
- Import alias (`@/*`): **Yes**

Masuk ke direktori project dan install dependency Mongoose:

```bash
cd nextjs_mongodb_crud
npm install mongoose
```

---

## 4. Koneksi Database

### A. Environment Variable

Buat file `.env` di root folder project:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/product_db?retryWrites=true&w=majority
```

Ganti `<username>` dan `<password>` sesuai kredensial Database User Anda.

### B. Helper Koneksi Database

Buat file `lib/db.ts`:

```typescript
import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("Successfully connect to mongodb");
    } catch (error) {
        console.log("Error" + error);
        process.exit(1);
    }
}

export default connectDb;

```

---

## 5. Pembuatan Model Database

Buat file `models/Product.ts` untuk mendefinisikan skema data:

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    price: number;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
```

---

## 6. Pembuatan API Routes

### A. Route GET & POST (`src/app/api/products/route.ts`)

```typescript
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
    try {
        await connectDb();
        const products = await Product.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: products }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDb();
        const body = await req.json();
        const product = await Product.create(body);
        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
```

### B. Route PUT & DELETE (`src/app/api/products/[id]/route.ts`)

```typescript
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDb();
        const body = await req.json();
        const product = await Product.findByIdAndUpdate(params.id, body, { new: true });

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDb();
        const product = await Product.findByIdAndDelete(params.id);

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
```

---

## 7. Pembuatan Halaman Utama UI

Ganti seluruh isi file `src/app/page.tsx` dengan kode berikut:

```typescript
"use client";

import { useEffect, useState } from "react";

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [form, setForm] = useState({ name: "", price: "", description: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (data.success) setProducts(data.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name: form.name,
            price: Number(form.price),
            description: form.description,
        };

        try {
            if (editingId) {
                await fetch(`/api/products/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                setEditingId(null);
            } else {
                await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            setForm({ name: "", price: "", description: "" });
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (p: Product) => {
        setEditingId(p._id);
        setForm({
            name: p.name,
            price: p.price.toString(),
            description: p.description,
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            try {
                await fetch(`/api/products/${id}`, { method: "DELETE" });
                fetchProducts();
            } catch (error) {
                console.error("Failed to delete product", error);
            }
        }
    };

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Sistem Manajemen Produk</h1>

            <form onSubmit={handleSubmit} className="bg-gray-50 border p-4 rounded-lg space-y-4 mb-8">
                <h2 className="font-semibold text-lg text-gray-700">
                    {editingId ? "Edit Produk" : "Tambah Produk"}
                </h2>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nama Produk</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full p-2 border rounded-md text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Harga</label>
                    <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="w-full p-2 border rounded-md text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full p-2 border rounded-md text-sm"
                        rows={3}
                        required
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Proses..." : editingId ? "Update Produk" : "Simpan Produk"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setForm({ name: "", price: "", description: "" });
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>

            <div className="grid gap-4">
                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">Belum ada data produk.</p>
                ) : (
                    products.map((p) => (
                        <div key={p._id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
                            <div>
                                <h3 className="font-bold text-gray-800">{p.name}</h3>
                                <p className="text-gray-600 text-sm mt-1">{p.description}</p>
                                <p className="text-emerald-600 font-semibold text-sm mt-2">
                                    Rp {p.price.toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(p)}
                                    className="bg-amber-500 text-white px-3 py-1 rounded text-xs hover:bg-amber-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(p._id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
```

---

## 8. Pengujian Lokal

Jalankan server pengembangan lokal:

```bash
npm run dev
```

Buka browser dan akses alamat `http://localhost:3000`.

Uji fungsi Create, Read, Update, dan Delete data produk.

---

## 9. Deployment ke Production (Vercel)

1. Upload seluruh kode project ke repository GitHub milik Anda.
2. Login ke Vercel menggunakan akun GitHub.
3. Klik **Add New** -> **Project** -> Impor repository GitHub project ini.
4. Pada bagian **Environment Variables**:
   - Key: `MONGO_URI`
   - Value: Masukkan String Koneksi MongoDB Atlas Anda.
5. Klik **Deploy**.
6. Setelah proses deployment selesai, pastikan aplikasi beroperasi dengan baik pada URL domain publik yang diberikan oleh Vercel.