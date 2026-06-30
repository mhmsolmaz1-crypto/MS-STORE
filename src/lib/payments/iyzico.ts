import type {
  PaymentProvider,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "./types";

// =============================================================================
// iyzico ÖDEME ENTEGRASYONU (Türkiye)
// =============================================================================
// Sandbox: https://sandbox-api.iyzipay.com
// Canlı: https://api.iyzipay.com
// Dokümantasyon: https://dev.iyzipay.com
// =============================================================================

function generateIyzicoAuthHeader(
  apiKey: string,
  secretKey: string,
  requestBody: string
): string {
  const crypto = require("crypto");
  const randomString = crypto.randomBytes(16).toString("hex");
  const hashString = apiKey + randomString + secretKey + requestBody;
  const hash = crypto
    .createHash("sha256")
    .update(hashString, "utf8")
    .digest("base64");
  return `IYZWS ${apiKey}:${hash}`;
}

export class IyzicoProvider implements PaymentProvider {
  name = "iyzico";
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.IYZICO_API_KEY ?? "";
    this.secretKey = process.env.IYZICO_SECRET_KEY ?? "";
    this.baseUrl =
      process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
  }

  async initPayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    if (!this.apiKey || !this.secretKey) {
      return {
        success: false,
        provider: this.name,
        error: "iyzico API anahtarları yapılandırılmamış",
      };
    }

    const body = {
      locale: "tr",
      conversationId: request.orderId,
      price: request.amount.toFixed(2),
      paidPrice: request.amount.toFixed(2),
      currency: request.currency,
      basketId: request.orderNumber,
      paymentGroup: "PRODUCT",
      callbackUrl: request.callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: request.orderId,
        name: request.customerName.split(" ")[0] ?? request.customerName,
        surname: request.customerName.split(" ").slice(1).join(" ") || "-",
        gsmNumber: request.customerPhone,
        email: request.customerEmail,
        identityNumber: "11111111111",
        registrationAddress: request.billingAddress?.address ?? "Adres",
        ip: request.customerIp ?? "85.34.78.112",
        city: request.billingAddress?.city ?? "Istanbul",
        country: "Turkey",
      },
      shippingAddress: {
        contactName: request.customerName,
        city: request.billingAddress?.city ?? "Istanbul",
        country: "Turkey",
        address: request.billingAddress?.address ?? "Adres",
      },
      billingAddress: {
        contactName: request.customerName,
        city: request.billingAddress?.city ?? "Istanbul",
        country: "Turkey",
        address: request.billingAddress?.address ?? "Adres",
      },
      basketItems: request.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category,
        itemType: "PHYSICAL",
        price: (item.price * item.quantity).toFixed(2),
      })),
    };

    const bodyStr = JSON.stringify(body);

    try {
      const response = await fetch(`${this.baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: generateIyzicoAuthHeader(
            this.apiKey,
            this.secretKey,
            bodyStr
          ),
          "x-iyzi-rnd": require("crypto").randomBytes(16).toString("hex"),
        },
        body: bodyStr,
      });

      const data = await response.json();

      if (data.status === "success") {
        return {
          success: true,
          provider: this.name,
          paymentPageUrl: data.paymentPageUrl,
          token: data.token,
        };
      }

      return {
        success: false,
        provider: this.name,
        error: data.errorMessage ?? "Ödeme başlatılamadı",
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
      return { success: false, status: "FAILED", error: "Token eksik" };
    }

    const body = {
      locale: "tr",
      conversationId: request.orderId,
      token: request.token,
    };
    const bodyStr = JSON.stringify(body);

    try {
      const response = await fetch(
        `${this.baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: generateIyzicoAuthHeader(
              this.apiKey,
              this.secretKey,
              bodyStr
            ),
          },
          body: bodyStr,
        }
      );

      const data = await response.json();

      if (data.status === "success" && data.paymentStatus === "SUCCESS") {
        return {
          success: true,
          status: "PAID",
          providerPaymentId: data.paymentId,
          rawResponse: data,
        };
      }

      return {
        success: false,
        status: "FAILED",
        error: data.errorMessage ?? "Ödeme doğrulanamadı",
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

export const iyzicoProvider = new IyzicoProvider();
