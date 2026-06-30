import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromCart, markOrderAsPaid } from "@/lib/orders/order-service";
import { initiatePayment } from "@/lib/payments";
import { getCart } from "@/lib/cart";
import { getSiteSettings } from "@/lib/site-settings";
import type { PaymentMethod } from "@prisma/client";

const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  isCorporate: z.boolean().optional(),
  companyTitle: z.string().optional(),
  taxNumber: z.string().optional(),
  taxOffice: z.string().optional(),
  identityNumber: z.string().optional(),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(1),
  shippingDistrict: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  billingSameAsShipping: z.boolean().default(true),
  notes: z.string().optional(),
  paymentMethod: z.enum([
    "CREDIT_CARD",
    "BANK_TRANSFER",
    "CASH_ON_DELIVERY",
    "IYZICO",
    "STRIPE",
  ]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);
    const settings = await getSiteSettings();
    const cart = await getCart();

    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Sepetiniz boş" }, { status: 400 });
    }

    const paymentMethod = data.paymentMethod as PaymentMethod;

    const orderResult = await createOrderFromCart(
      {
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        isCorporate: data.isCorporate,
        companyTitle: data.companyTitle,
        taxNumber: data.taxNumber,
        taxOffice: data.taxOffice,
        identityNumber: data.identityNumber,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingDistrict: data.shippingDistrict,
        shippingPostalCode: data.shippingPostalCode,
        billingSameAsShipping: data.billingSameAsShipping,
        notes: data.notes,
      },
      paymentMethod
    );

    // Havale / Kapıda ödeme — doğrudan onay sayfasına
    if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "CASH_ON_DELIVERY") {
      return NextResponse.json({
        orderNumber: orderResult.orderNumber,
        orderId: orderResult.orderId,
      });
    }

    // Online ödeme — sağlayıcıya yönlendir
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const paymentResult = await initiatePayment(paymentMethod, {
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
      amount: orderResult.totalAmount,
      currency: settings.currency,
      customerEmail: data.email,
      customerName: `${data.firstName} ${data.lastName}`,
      customerPhone: data.phone,
      callbackUrl: `${siteUrl}/api/payments/callback?orderId=${orderResult.orderId}&method=${paymentMethod}`,
      billingAddress: {
        contactName: `${data.firstName} ${data.lastName}`,
        city: data.shippingCity,
        country: "Turkey",
        address: data.shippingAddress,
      },
      basketItems: cart.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        category: "Genel",
        price: item.product.price,
        quantity: item.quantity,
      })),
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error ?? "Ödeme başlatılamadı" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      orderNumber: orderResult.orderNumber,
      orderId: orderResult.orderId,
      paymentPageUrl: paymentResult.paymentPageUrl,
      token: paymentResult.token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz form verisi", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sipariş oluşturulamadı" },
      { status: 500 }
    );
  }
}
