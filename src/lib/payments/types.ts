// =============================================================================
// ÖDEME SAĞLAYICI ARAYÜZÜ
// =============================================================================
// Profesyonel e-ticaret sitelerinde ödeme kodu mağazaya gömülmez;
// iyzico, Stripe gibi PCI-DSS sertifikalı sağlayıcılar kullanılır.
// Bu modül tüm sağlayıcıları tek arayüzde birleştirir.
// =============================================================================

import type { PaymentMethod } from "@prisma/client";

export interface PaymentInitRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerIp?: string;
  callbackUrl: string;
  billingAddress?: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

export interface PaymentInitResponse {
  success: boolean;
  provider: string;
  paymentPageUrl?: string;
  token?: string;
  error?: string;
}

export interface PaymentVerifyRequest {
  orderId: string;
  token?: string;
  paymentId?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  providerPaymentId?: string;
  status: "PAID" | "FAILED" | "PENDING";
  rawResponse?: unknown;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
  verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse>;
  refund?(paymentId: string, amount: number): Promise<boolean>;
}

export function getEnabledProviders(settings: {
  enableIyzico: boolean;
  enableStripe: boolean;
  enableCreditCard: boolean;
  enableBankTransfer: boolean;
  enableCashOnDelivery: boolean;
}): PaymentMethod[] {
  const methods: PaymentMethod[] = [];
  if (settings.enableIyzico || settings.enableCreditCard) methods.push("IYZICO");
  if (settings.enableStripe) methods.push("STRIPE");
  if (settings.enableBankTransfer) methods.push("BANK_TRANSFER");
  if (settings.enableCashOnDelivery) methods.push("CASH_ON_DELIVERY");
  return methods;
}
