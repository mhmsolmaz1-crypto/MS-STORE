import { iyzicoProvider } from "./iyzico";
import { stripeProvider } from "./stripe";
import type { PaymentProvider, PaymentInitRequest, PaymentVerifyRequest } from "./types";
import type { PaymentMethod } from "@prisma/client";

const providers: Record<string, PaymentProvider> = {
  IYZICO: iyzicoProvider,
  STRIPE: stripeProvider,
  CREDIT_CARD: iyzicoProvider,
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider | null {
  return providers[method] ?? null;
}

export async function initiatePayment(
  method: PaymentMethod,
  request: PaymentInitRequest
) {
  const provider = getPaymentProvider(method);
  if (!provider) {
    return {
      success: false,
      provider: "manual",
      error: "Bu ödeme yöntemi desteklenmiyor",
    };
  }
  return provider.initPayment(request);
}

export async function verifyPayment(
  method: PaymentMethod,
  request: PaymentVerifyRequest
) {
  const provider = getPaymentProvider(method);
  if (!provider) {
    return { success: false, status: "FAILED" as const, error: "Sağlayıcı bulunamadı" };
  }
  return provider.verifyPayment(request);
}
