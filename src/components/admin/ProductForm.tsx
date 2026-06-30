"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

interface ProductFormProps {
  categories: Array<{ id: string; name: string }>;
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    sku: string | null;
    price: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    stockQuantity: number;
    categoryId: string | null;
    isActive: boolean;
    isFeatured: boolean;
    images: string;
  };
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(product?.name ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      slug: form.get("slug") || slugify(name),
      description: form.get("description"),
      shortDescription: form.get("shortDescription"),
      sku: form.get("sku"),
      price: parseFloat(form.get("price") as string),
      compareAtPrice: form.get("compareAtPrice") ? parseFloat(form.get("compareAtPrice") as string) : null,
      costPrice: form.get("costPrice") ? parseFloat(form.get("costPrice") as string) : null,
      stockQuantity: parseInt(form.get("stockQuantity") as string, 10),
      categoryId: form.get("categoryId") || null,
      isActive: form.get("isActive") === "on",
      isFeatured: form.get("isFeatured") === "on",
      images: JSON.stringify(
        (form.get("images") as string).split("\n").map((s) => s.trim()).filter(Boolean)
      ),
    };

    try {
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Kayıt başarısız");
        return;
      }

      router.push("/admin/urunler");
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  const existingImages = product?.images
    ? (() => { try { return JSON.parse(product.images); } catch { return []; } })()
    : [];

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-3xl">
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Ürün Adı *</label>
          <input
            name="name"
            className="input"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">URL Slug</label>
          <input name="slug" className="input" defaultValue={product?.slug ?? slugify(name)} />
        </div>
        <div>
          <label className="label">SKU</label>
          <input name="sku" className="input" defaultValue={product?.sku ?? ""} />
        </div>
        <div>
          <label className="label">Fiyat (₺) *</label>
          <input name="price" type="number" step="0.01" className="input" required defaultValue={product?.price} />
        </div>
        <div>
          <label className="label">Karşılaştırma Fiyatı</label>
          <input name="compareAtPrice" type="number" step="0.01" className="input" defaultValue={product?.compareAtPrice ?? ""} />
        </div>
        <div>
          <label className="label">Maliyet Fiyatı</label>
          <input name="costPrice" type="number" step="0.01" className="input" defaultValue={product?.costPrice ?? ""} />
        </div>
        <div>
          <label className="label">Stok Adedi *</label>
          <input name="stockQuantity" type="number" className="input" required defaultValue={product?.stockQuantity ?? 0} />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select name="categoryId" className="input" defaultValue={product?.categoryId ?? ""}>
            <option value="">Kategori Seçin</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Kısa Açıklama</label>
        <input name="shortDescription" className="input" defaultValue={product?.shortDescription ?? ""} />
      </div>

      <div>
        <label className="label">Detaylı Açıklama</label>
        <textarea name="description" className="input" rows={6} defaultValue={product?.description ?? ""} />
      </div>

      <div>
        <label className="label">Görsel URL&apos;leri (her satıra bir URL)</label>
        <textarea
          name="images"
          className="input font-mono text-xs"
          rows={3}
          defaultValue={existingImages.join("\n")}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
          <span className="text-sm">Aktif</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
          <span className="text-sm">Öne Çıkan</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Kaydediliyor..." : product ? "Güncelle" : "Ürün Ekle"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          İptal
        </button>
      </div>
    </form>
  );
}
