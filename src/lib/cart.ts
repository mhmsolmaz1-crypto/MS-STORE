import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";
import { getSiteSettings } from "./site-settings";
import { calculateTax } from "./utils";
import type { Product } from "@prisma/client";

const CART_COOKIE = "cart_session_id";
const CART_EXPIRY_DAYS = 30;

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
}

async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = uuidv4();
    try {
      // Çerezi set ediyoruz, hata olursa try-catch ile yakalıyoruz
      cookieStore.set(CART_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * CART_EXPIRY_DAYS,
        path: "/",
      });
    } catch (e) {
      // Sayfa yüklenirken çerez set edilemezse hata vermemesi için
      console.warn("Session çerezi bu aşamada yazılamadı, normaldir.");
    }
  }

  return sessionId;
}

async function getOrCreateCart(sessionId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS);

  let cart = await prisma.cartSession.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!cart || cart.expiresAt < new Date()) {
    if (cart) {
      await prisma.cartSession.delete({ where: { id: cart.id } });
    }
    cart = await prisma.cartSession.create({
      data: { sessionId, expiresAt },
      include: { items: true },
    });
  }

  return cart;
}

export async function getCart(): Promise<CartSummary> {
  const sessionId = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);
  const settings = await getSiteSettings();

  const productIds = cart.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const items = cart.items
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product,
      };
    })
    .filter((i): i is CartItemWithProduct => i !== null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const taxAmount = calculateTax(subtotal, settings.taxRate);
  const shippingCost =
    settings.freeShippingMin && subtotal >= settings.freeShippingMin
      ? 0
      : settings.defaultShippingFee;
  const total = subtotal + taxAmount + shippingCost;

  return {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    taxAmount,
    shippingCost,
    total,
  };
}

export async function addToCart(
  productId: string,
  quantity: number
): Promise<CartSummary> {
  const sessionId = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });
  if (!product) throw new Error("Ürün bulunamadı");

  if (product.trackInventory && product.stockQuantity < quantity) {
    throw new Error("Yeterli stok yok");
  }

  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return getCart();
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number
): Promise<CartSummary> {
  const sessionId = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);
  const item = cart.items.find((i) => i.productId === productId);

  if (!item) throw new Error("Sepet öğesi bulunamadı");

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  return getCart();
}

export async function removeFromCart(productId: string): Promise<CartSummary> {
  const sessionId = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);
  const item = cart.items.find((i) => i.productId === productId);

  if (item) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  }

  return getCart();
}

export async function clearCart(): Promise<void> {
  const sessionId = await getOrCreateSessionId();
  const cart = await prisma.cartSession.findUnique({ where: { sessionId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}

export async function getCartSessionId(): Promise<string> {
  return getOrCreateSessionId();
}