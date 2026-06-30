import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { generateOrderNumber, generateInvoiceNumber, parseProductImages } from "@/lib/utils";
import { clearCart, getCart } from "@/lib/cart";
import { createInvoiceForOrder } from "@/lib/invoices/invoice-service";
import type { PaymentMethod, OrderStatus } from "@prisma/client";

export interface CheckoutCustomerData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isCorporate?: boolean;
  companyTitle?: string;
  taxNumber?: string;
  taxOffice?: string;
  identityNumber?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict?: string;
  shippingPostalCode?: string;
  billingSameAsShipping: boolean;
  billingFirstName?: string;
  billingLastName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingTaxNumber?: string;
  billingTaxOffice?: string;
  billingCompanyTitle?: string;
  notes?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
}

export async function createOrderFromCart(
  customerData: CheckoutCustomerData,
  paymentMethod: PaymentMethod
): Promise<CreateOrderResult> {
  const cart = await getCart();
  if (cart.items.length === 0) {
    throw new Error("Sepetiniz boş");
  }

  const settings = await getSiteSettings();

  // Stok kontrolü
  for (const item of cart.items) {
    if (
      item.product.trackInventory &&
      item.product.stockQuantity < item.quantity &&
      !item.product.allowBackorder
    ) {
      throw new Error(`${item.product.name} için yeterli stok yok`);
    }
  }

  // Müşteri oluştur veya güncelle
  const customer = await prisma.customer.upsert({
    where: { email: customerData.email },
    create: {
      email: customerData.email,
      phone: customerData.phone,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      isCorporate: customerData.isCorporate ?? false,
      companyTitle: customerData.companyTitle,
      taxNumber: customerData.taxNumber,
      taxOffice: customerData.taxOffice,
      identityNumber: customerData.identityNumber,
    },
    update: {
      phone: customerData.phone,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      isCorporate: customerData.isCorporate,
      companyTitle: customerData.companyTitle,
      taxNumber: customerData.taxNumber,
      taxOffice: customerData.taxOffice,
      identityNumber: customerData.identityNumber,
    },
  });

  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        customerId: customer.id,
        shippingFirstName: customerData.firstName,
        shippingLastName: customerData.lastName,
        shippingPhone: customerData.phone,
        shippingAddress: customerData.shippingAddress,
        shippingCity: customerData.shippingCity,
        shippingDistrict: customerData.shippingDistrict,
        shippingPostalCode: customerData.shippingPostalCode,
        billingSameAsShipping: customerData.billingSameAsShipping,
        billingFirstName: customerData.billingFirstName,
        billingLastName: customerData.billingLastName,
        billingAddress: customerData.billingAddress,
        billingCity: customerData.billingCity,
        billingTaxNumber: customerData.billingTaxNumber ?? customerData.taxNumber,
        billingTaxOffice: customerData.billingTaxOffice ?? customerData.taxOffice,
        billingCompanyTitle: customerData.billingCompanyTitle ?? customerData.companyTitle,
        subtotal: cart.subtotal,
        shippingCost: cart.shippingCost,
        taxAmount: cart.taxAmount,
        totalAmount: cart.total,
        currency: settings.currency,
        notes: customerData.notes,
        paymentMethod,
        paymentStatus: "PENDING",
        items: {
          create: cart.items.map((item) => {
            const images = parseProductImages(item.product.images);
            return {
              productId: item.product.id,
              productName: item.product.name,
              productSku: item.product.sku,
              productImage: images[0] ?? null,
              unitPrice: item.product.price,
              quantity: item.quantity,
              taxRate: settings.taxRate,
              lineTotal: item.product.price * item.quantity,
            };
          }),
        },
        statusHistory: {
          create: { status: "PENDING", note: "Sipariş oluşturuldu" },
        },
      },
    });

    // Stok düş
    for (const item of cart.items) {
      if (item.product.trackInventory) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }
    }

    return newOrder;
  });

  await clearCart();

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
  };
}

export async function markOrderAsPaid(
  orderId: string,
  provider: string,
  providerPaymentId?: string,
  rawResponse?: unknown
): Promise<void> {
  const settings = await getSiteSettings();

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "CONFIRMED",
        note: "Ödeme alındı",
      },
    });

    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    await tx.payment.create({
      data: {
        orderId,
        provider,
        providerPaymentId,
        method: order.paymentMethod ?? "CREDIT_CARD",
        amount: order.totalAmount,
        currency: order.currency,
        status: "PAID",
        rawResponse: rawResponse ? JSON.stringify(rawResponse) : null,
        paidAt: new Date(),
      },
    });
  });

  // Otomatik e-Fatura / e-Arşiv
  if (settings.autoGenerateInvoice) {
    try {
      await createInvoiceForOrder(orderId);
    } catch (error) {
      console.error("e-Fatura oluşturma hatası:", error);
    }
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<void> {
  const updateData: Record<string, unknown> = { status };

  if (status === "SHIPPED") updateData.shippedAt = new Date();
  if (status === "DELIVERED") updateData.deliveredAt = new Date();
  if (status === "CANCELLED") {
    updateData.cancelledAt = new Date();
    updateData.cancelReason = note;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: updateData });
    await tx.orderStatusHistory.create({
      data: { orderId, status, note },
    });
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      items: true,
      payments: true,
      invoice: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: { include: { product: true } },
      payments: true,
      invoice: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
}
