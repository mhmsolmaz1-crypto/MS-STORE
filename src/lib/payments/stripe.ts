import type {
  PaymentProvider,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "./types";

// =============================================================================
// STRIPE ÖDEME ENTEGRASYONU (Uluslararası)
// =============================================================================

export class StripeProvider implements PaymentProvider {
  name = "stripe";
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.secretKey) {
      return {
        success: false,
        provider: this.name,
        error: "Stripe API anahtarı yapılandırılmamış",
      };
    }

    try {
      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", `${request.callbackUrl}?session_id={CHECKOUT_SESSION_ID}`);
      params.append("cancel_url", `${request.callbackUrl}?cancelled=true`);
      params.append("customer_email", request.customerEmail);
      params.append("line_items[0][price_data][currency]", request.currency.toLowerCase());
      params.append("line_items[0][price_data][product_data][name]", `Sipariş ${request.orderNumber}`);
      params.append("line_items[0][price_data][unit_amount]", String(Math.round(request.amount * 100)));
      params.append("line_items[0][quantity]", "1");
      params.append("metadata[order_id]", request.orderId);
      params.append("metadata[order_number]", request.orderNumber);

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.url) {
        return {
          success: true,
          provider: this.name,
          paymentPageUrl: data.url,
          token: data.id,
        };
      }

      return {
        success: false,
        provider: this.name,
        error: data.error?.message ?? "Stripe oturumu oluşturulamadı",
      };
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : "Bağlantı hatası",
      };
    }
  }

  async verifyPayment(
    request: PaymentVerifyRequest
  ): Promise<PaymentVerifyResponse> {
    if (!request.token) {
      return { success: false, status: "FAILED", error: "Session ID eksik" };
    }

    try {
      const response = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${request.token}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
        }
      );

      const data = await response.json();

      if (data.payment_status === "paid") {
        return {
          success: true,
          status: "PAID",
          providerPaymentId: data.payment_intent,
          rawResponse: data,
        };
      }

      return {
        success: false,
        status: data.payment_status === "unpaid" ? "PENDING" : "FAILED",
        rawResponse: data,
      };
    } catch (error) {
      return {
        success: false,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Doğrulama hatası",
      };
    }
  }
}

export const stripeProvider = new StripeProvider();
