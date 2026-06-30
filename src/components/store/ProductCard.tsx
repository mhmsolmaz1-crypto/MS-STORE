"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    shortDescription?: string | null;
    stockQuantity: number;
  };
  currency: string;
}

export function ProductCard({ product, currency }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const imageUrl = product.images[0] ?? "/placeholder-product.svg";
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link href={`/urun/${product.slug}`} className="card group overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Görsel yok
          </div>
        )}
        {discount && (
          <span className="absolute top-2 left-2 badge bg-red-500 text-white">
            -%{discount}
          </span>
        )}
        {product.stockQuantity <= 0 && (
          <span className="absolute top-2 right-2 badge bg-gray-800 text-white">
            Tükendi
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand transition-colors">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.shortDescription}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-brand">
              {formatCurrency(product.price, currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 text-xs text-gray-400 line-through">
                {formatCurrency(product.compareAtPrice, currency)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stockQuantity <= 0}
            className="btn-primary p-2 rounded-full"
            title="Sepete Ekle"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
