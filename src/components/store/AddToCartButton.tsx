"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) router.push("/sepet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border rounded-theme">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-2.5 hover:bg-gray-100"
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 font-medium min-w-[3rem] text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="p-2.5 hover:bg-gray-100"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={disabled || loading}
        className="btn-primary flex-1 py-3"
      >
        <ShoppingCart className="h-5 w-5" />
        {loading ? "Ekleniyor..." : "Sepete Ekle"}
      </button>
    </div>
  );
}
