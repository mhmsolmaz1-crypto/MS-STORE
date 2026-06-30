// =============================================================================
// e-FATURA / e-ARŞİV OTOMATİK OLUŞTURMA SERVİSİ
// =============================================================================
// Türkiye'de yasal zorunluluk: Satış sonrası e-Arşiv veya e-Fatura kesilmeli.
// Bu servis ödeme onaylandığında otomatik fatura oluşturur.
//
// Desteklenen entegratörler (yapılandırılabilir):
//   - Paraşüt (parasut.com)
//   - Logo e-Fatura
//   - Foriba / Sovos
//   - Uyumsoft
//
// GİB (Gelir İdaresi Başkanlığı) üzerinden doğrudan entegrasyon da mümkündür
// ancak entegratör kullanmak çok daha pratiktir.
// =============================================================================

import prisma from "../prisma";
import { getSiteSettings } from "../site-settings";
import { generateInvoiceNumber } from "../utils";
import type { InvoiceType, InvoiceStatus } from "@prisma/client";

export interface InvoiceLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface InvoicePayload {
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  customer: {
    name: string;
    email: string;
    phone: string;
    taxNumber?: string;
    taxOffice?: string;
    companyTitle?: string;
    identityNumber?: string;
    address: string;
    city: string;
  };
  seller: {
    title: string;
    taxNumber: string;
    taxOffice: string;
    address: string;
    mersisNo?: string;
  };
  items: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export interface InvoiceProviderResult {
  success: boolean;
  providerInvoiceId?: string;
  ettn?: string;
  uuid?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Paraşüt entegratörü (örnek implementasyon)
// ---------------------------------------------------------------------------

async function sendToParasut(payload: InvoicePayload): Promise<InvoiceProviderResult> {
  const apiKey = process.env.EFATURA_API_KEY;
  const companyId = process.env.EFATURA_COMPANY_ID;

  if (!apiKey || !companyId) {
    // Test modunda simüle et
    if (process.env.EFATURA_TEST_MODE === "true") {
      return {
        success: true,
        providerInvoiceId: `PAR-${Date.now()}`,
        ettn: generateETTN(),
        uuid: crypto.randomUUID(),
        pdfUrl: `/api/invoices/${payload.orderId}/pdf`,
      };
    }
    return { success: false, error: "Paraşüt API yapılandırması eksik" };
  }

  try {
    const response = await fetch(
      `https://api.parasut.com/v4/${companyId}/sales_invoices`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "sales_invoices",
            attributes: {
              item_type: payload.invoiceType === "E_FATURA" ? "invoice" : "estimate",
              description: `Sipariş ${payload.orderNumber}`,
              issue_date: new Date().toISOString().split("T")[0],
              due_date: new Date().toISOString().split("T")[0],
              currency: payload.currency,
              invoice_series: payload.invoiceNumber.split("-")[0],
              invoice_id: payload.invoiceNumber,
              billing_address: payload.customer.address,
              billing_phone: payload.customer.phone,
              tax_number: payload.customer.taxNumber,
              contact_type: payload.customer.taxNumber ? "company" : "person",
            },
            relationships: {
              details: {
                data: payload.items.map((item, index) => ({
                  type: "sales_invoice_details",
                  attributes: {
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    vat_rate: item.taxRate,
                    description: item.name,
                  },
                  id: String(index),
                })),
              },
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        providerInvoiceId: data.data?.id,
        ettn: data.data?.attributes?.e_invoice_id,
        uuid: data.data?.attributes?.uuid,
      };
    }

    return {
      success: false,
      error: data.errors?.[0]?.detail ?? "Paraşüt API hatası",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bağlantı hatası",
    };
  }
}

function generateETTN(): string {
  const segments = [
    crypto.randomUUID().slice(0, 8),
    crypto.randomUUID().slice(0, 4),
    crypto.randomUUID().slice(0, 4),
    crypto.randomUUID().slice(0, 4),
    crypto.randomUUID().slice(0, 12),
  ];
  return segments.join("-").toUpperCase();
}

function determineInvoiceType(order: {
  billingTaxNumber?: string | null;
  billingCompanyTitle?: string | null;
  customer: { isCorporate: boolean; taxNumber?: string | null };
}): InvoiceType {
  const hasTaxNumber =
    order.billingTaxNumber ||
    order.billingCompanyTitle ||
    order.customer.taxNumber ||
    order.customer.isCorporate;

  return hasTaxNumber ? "E_FATURA" : "E_ARSIV";
}

async function getNextInvoiceSequence(): Promise<number> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: { startsWith: `INV-${year}` },
    },
  });
  return count + 1;
}

export async function createInvoiceForOrder(orderId: string): Promise<void> {
  const settings = await getSiteSettings();

  if (!settings.companyTitle || !settings.companyTaxNumber) {
    console.warn("e-Fatura: Şirket bilgileri eksik, fatura oluşturulamadı");
    return;
  }

  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing && existing.status !== "FAILED") return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: true },
  });

  if (!order) throw new Error("Sipariş bulunamadı");

  const sequence = await getNextInvoiceSequence();
  const invoiceNumber = generateInvoiceNumber(settings.invoicePrefix, sequence);
  const invoiceType = determineInvoiceType(order);

  const payload: InvoicePayload = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    invoiceNumber,
    invoiceType,
    customer: {
      name: `${order.shippingFirstName} ${order.shippingLastName}`,
      email: order.customer.email,
      phone: order.shippingPhone,
      taxNumber: order.billingTaxNumber ?? order.customer.taxNumber ?? undefined,
      taxOffice: order.billingTaxOffice ?? order.customer.taxOffice ?? undefined,
      companyTitle: order.billingCompanyTitle ?? order.customer.companyTitle ?? undefined,
      identityNumber: order.customer.identityNumber ?? undefined,
      address: order.shippingAddress,
      city: order.shippingCity,
    },
    seller: {
      title: settings.companyTitle,
      taxNumber: settings.companyTaxNumber,
      taxOffice: settings.companyTaxOffice ?? "",
      address: settings.companyAddress ?? "",
      mersisNo: settings.companyMersisNo ?? undefined,
    },
    items: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      lineTotal: item.lineTotal,
    })),
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    currency: order.currency,
  };

  const invoice = await prisma.invoice.upsert({
    where: { orderId },
    create: {
      orderId,
      invoiceNumber,
      invoiceType,
      status: "PENDING",
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      provider: process.env.EFATURA_PROVIDER ?? "parasut",
    },
    update: {
      status: "PENDING",
      errorMessage: null,
    },
  });

  const provider = process.env.EFATURA_PROVIDER ?? "parasut";
  let result: InvoiceProviderResult;

  switch (provider) {
    case "parasut":
      result = await sendToParasut(payload);
      break;
    default:
      if (process.env.EFATURA_TEST_MODE === "true") {
        result = {
          success: true,
          providerInvoiceId: `TEST-${Date.now()}`,
          ettn: generateETTN(),
          uuid: crypto.randomUUID(),
          pdfUrl: `/api/invoices/${orderId}/pdf`,
        };
      } else {
        result = { success: false, error: `Bilinmeyen sağlayıcı: ${provider}` };
      }
  }

  const status: InvoiceStatus = result.success ? "ISSUED" : "FAILED";

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status,
      providerInvoiceId: result.providerInvoiceId,
      ettn: result.ettn,
      uuid: result.uuid,
      pdfUrl: result.pdfUrl,
      xmlUrl: result.xmlUrl,
      issuedAt: result.success ? new Date() : null,
      errorMessage: result.error,
    },
  });
}

export async function getInvoiceByOrderId(orderId: string) {
  return prisma.invoice.findUnique({ where: { orderId } });
}

export async function retryFailedInvoice(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.status !== "FAILED") return;
  await createInvoiceForOrder(invoice.orderId);
}
