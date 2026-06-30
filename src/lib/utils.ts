import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "TRY",
  locale = "tr-TR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string, locale = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SIP-${datePart}-${randomPart}`;
}

export function generateInvoiceNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(6, "0")}`;
}

export function calculateTax(amount: number, taxRate: number): number {
  return Math.round((amount * taxRate) / 100 * 100) / 100;
}

export function calculateLineTotal(
  unitPrice: number,
  quantity: number,
  taxRate: number
): { subtotal: number; tax: number; total: number } {
  const subtotal = unitPrice * quantity;
  const tax = calculateTax(subtotal, taxRate);
  return { subtotal, tax, total: subtotal + tax };
}

export function parseProductImages(imagesJson: string): string[] {
  try {
    const parsed = JSON.parse(imagesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Beklemede",
    CONFIRMED: "Onaylandı",
    PROCESSING: "Hazırlanıyor",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal",
    REFUNDED: "İade Edildi",
  };
  return labels[status] ?? status;
}

export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Ödeme Bekliyor",
    PAID: "Ödendi",
    FAILED: "Başarısız",
    REFUNDED: "İade Edildi",
    PARTIALLY_REFUNDED: "Kısmi İade",
  };
  return labels[status] ?? status;
}

export function getInvoiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Taslak",
    PENDING: "İşleniyor",
    ISSUED: "Kesildi",
    SENT: "Gönderildi",
    FAILED: "Hata",
    CANCELLED: "İptal",
  };
  return labels[status] ?? status;
}
