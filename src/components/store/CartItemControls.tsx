"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface CartItemControlsProps {
  productId: string;
  quantity: number;
}

export function CartItemControls({ productId, quantity }: CartItemControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateQuantity(newQty: number) {
    setLoading(true);
    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQty }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={() => updateQuantity(quantity - 1)}
        disabled={loading || quantity <= 1}
        className="w-7 h-7 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        -
      </button>
      <span className="text-sm w-8 text-center">{quantity}</span>
      <button
        onClick={() => updateQuantity(quantity + 1)}
        disabled={loading}
        className="w-7 h-7 border rounded text-sm hover:bg-gray-100"
      >
        +
      </button>
      <button
        onClick={remove}
        disabled={loading}
        className="ml-2 text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
