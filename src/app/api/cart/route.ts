import { NextRequest, NextResponse } from "next/server";
import { getCart, addToCart, updateCartItemQuantity, removeFromCart } from "@/lib/cart";

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sepet yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }
    const cart = await addToCart(productId, quantity);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sepete eklenemedi" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();
    const cart = await updateCartItemQuantity(productId, quantity);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Güncellenemedi" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();
    const cart = await removeFromCart(productId);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Silinemedi" },
      { status: 400 }
    );
  }
}
