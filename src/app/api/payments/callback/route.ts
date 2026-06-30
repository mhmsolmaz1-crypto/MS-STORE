import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/payments";
import { markOrderAsPaid, getOrderById } from "@/lib/orders/order-service";
import type { PaymentMethod } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method") as PaymentMethod;
  const token = searchParams.get("token") ?? searchParams.get("session_id");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!orderId || !method) {
    return NextResponse.redirect(`${siteUrl}/sepet?error=invalid_callback`);
  }

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.redirect(`${siteUrl}/sepet?error=order_not_found`);
    }

    const result = await verifyPayment(method, { orderId, token: token ?? undefined });

    if (result.success && result.status === "PAID") {
      await markOrderAsPaid(orderId, method, result.providerPaymentId, result.rawResponse);
      return NextResponse.redirect(`${siteUrl}/siparis-onay/${order.orderNumber}`);
    }

    return NextResponse.redirect(`${siteUrl}/sepet?error=payment_failed`);
  } catch {
    return NextResponse.redirect(`${siteUrl}/sepet?error=payment_error`);
  }
}

export async function POST(request: NextRequest) {
  // iyzico POST callback
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method") as PaymentMethod;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!orderId) {
    return NextResponse.redirect(`${siteUrl}/sepet?error=invalid_callback`);
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.redirect(`${siteUrl}/sepet?error=order_not_found`);
  }

  const result = await verifyPayment(method ?? "IYZICO", { orderId, token });

  if (result.success && result.status === "PAID") {
    await markOrderAsPaid(orderId, method ?? "IYZICO", result.providerPaymentId, result.rawResponse);
    return NextResponse.redirect(`${siteUrl}/siparis-onay/${order.orderNumber}`);
  }

  return NextResponse.redirect(`${siteUrl}/sepet?error=payment_failed`);
}
