"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  currentCategory?: string;
}

export function ProductFilters({ categories, currentCategory }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/urunler?${params.toString()}`);
  }

  return (
    <div className="card p-4 space-y-6">
      <div>
        <label className="label">Ara</label>
        <input
          type="search"
          className="input"
          placeholder="Ürün ara..."
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">Kategoriler</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilter("kategori", "")}
              className={`text-sm w-full text-left px-2 py-1.5 rounded ${!currentCategory ? "text-brand font-medium" : "text-gray-600 hover:text-brand"}`}
            >
              Tümü
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilter("kategori", cat.slug)}
                className={`text-sm w-full text-left px-2 py-1.5 rounded ${currentCategory === cat.slug ? "text-brand font-medium" : "text-gray-600 hover:text-brand"}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">Sıralama</h3>
        <select
          className="input"
          defaultValue={searchParams.get("siralama") ?? ""}
          onChange={(e) => updateFilter("siralama", e.target.value)}
        >
          <option value="">En Yeni</option>
          <option value="fiyat-artan">Fiyat: Düşükten Yükseğe</option>
          <option value="fiyat-azalan">Fiyat: Yüksekten Düşüğe</option>
          <option value="isim">İsme Göre</option>
        </select>
      </div>
    </div>
  );
}
