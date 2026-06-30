"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, Truck } from "lucide-react";

interface CheckoutFormProps {
  cartTotal: number;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  enabledMethods: string[];
  bankAccounts: Array<{ id: string; bankName: string; accountHolder: string; iban: string }>;
}

export function CheckoutForm({
  cartTotal,
  currency,
  enabledMethods,
  bankAccounts,
}: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCorporate, setIsCorporate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(
    enabledMethods[0] ?? "BANK_TRANSFER"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          isCorporate,
          paymentMethod,
          billingSameAsShipping: data.billingSameAsShipping === "on",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "Sipariş oluşturulamadı");
        return;
      }

      if (result.paymentPageUrl) {
        window.location.href = result.paymentPageUrl;
      } else {
        router.push(`/siparis-onay/${result.orderNumber}`);
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Kişisel Bilgiler */}
      <section className="card p-6">
        <h2 className="font-bold text-lg mb-4">İletişim Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Ad *</label>
            <input name="firstName" className="input" required />
          </div>
          <div>
            <label className="label">Soyad *</label>
            <input name="lastName" className="input" required />
          </div>
          <div>
            <label className="label">E-posta *</label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label className="label">Telefon *</label>
            <input name="phone" type="tel" className="input" placeholder="05XX XXX XX XX" required />
          </div>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isCorporate}
            onChange={(e) => setIsCorporate(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Kurumsal fatura istiyorum (e-Fatura)</span>
        </label>

        {isCorporate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="md:col-span-2">
              <label className="label">Firma Ünvanı *</label>
              <input name="companyTitle" className="input" required={isCorporate} />
            </div>
            <div>
              <label className="label">Vergi Numarası *</label>
              <input name="taxNumber" className="input" required={isCorporate} />
            </div>
            <div>
              <label className="label">Vergi Dairesi *</label>
              <input name="taxOffice" className="input" required={isCorporate} />
            </div>
          </div>
        )}

        {!isCorporate && (
          <div className="mt-4">
            <label className="label">TC Kimlik No (e-Arşiv için)</label>
            <input name="identityNumber" className="input" maxLength={11} pattern="[0-9]{11}" />
          </div>
        )}
      </section>

      {/* Teslimat Adresi */}
      <section className="card p-6">
        <h2 className="font-bold text-lg mb-4">Teslimat Adresi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Adres *</label>
            <textarea name="shippingAddress" className="input" rows={3} required />
          </div>
          <div>
            <label className="label">İl *</label>
            <input name="shippingCity" className="input" required />
          </div>
          <div>
            <label className="label">İlçe</label>
            <input name="shippingDistrict" className="input" />
          </div>
          <div>
            <label className="label">Posta Kodu</label>
            <input name="shippingPostalCode" className="input" />
          </div>
        </div>
      </section>

      {/* Ödeme Yöntemi */}
      <section className="card p-6">
        <h2 className="font-bold text-lg mb-4">Ödeme Yöntemi</h2>
        <div className="space-y-3">
          {enabledMethods.includes("IYZICO") && (
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand/5">
              <input
                type="radio"
                name="paymentMethodRadio"
                value="IYZICO"
                checked={paymentMethod === "IYZICO"}
                onChange={() => setPaymentMethod("IYZICO")}
              />
              <CreditCard className="h-5 w-5 text-brand" />
              <div>
                <span className="font-medium">Kredi / Banka Kartı</span>
                <p className="text-xs text-gray-500">iyzico güvenli ödeme altyapısı</p>
              </div>
            </label>
          )}

          {enabledMethods.includes("STRIPE") && (
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand/5">
              <input
                type="radio"
                value="STRIPE"
                checked={paymentMethod === "STRIPE"}
                onChange={() => setPaymentMethod("STRIPE")}
              />
              <CreditCard className="h-5 w-5 text-brand" />
              <span className="font-medium">Uluslararası Kart (Stripe)</span>
            </label>
          )}

          {enabledMethods.includes("BANK_TRANSFER") && (
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand/5">
              <input
                type="radio"
                value="BANK_TRANSFER"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
              />
              <Building2 className="h-5 w-5 text-brand" />
              <div>
                <span className="font-medium">Havale / EFT</span>
                <p className="text-xs text-gray-500">Banka hesabına transfer</p>
              </div>
            </label>
          )}

          {enabledMethods.includes("CASH_ON_DELIVERY") && (
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand/5">
              <input
                type="radio"
                value="CASH_ON_DELIVERY"
                checked={paymentMethod === "CASH_ON_DELIVERY"}
                onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
              />
              <Truck className="h-5 w-5 text-brand" />
              <span className="font-medium">Kapıda Ödeme</span>
            </label>
          )}
        </div>

        {paymentMethod === "BANK_TRANSFER" && bankAccounts.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm space-y-2">
            <p className="font-medium text-blue-900">Banka Hesap Bilgileri:</p>
            {bankAccounts.map((acc) => (
              <div key={acc.id} className="text-blue-800">
                <p>{acc.bankName} — {acc.accountHolder}</p>
                <p className="font-mono text-xs">{acc.iban}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notlar */}
      <section className="card p-6">
        <label className="label">Sipariş Notu (opsiyonel)</label>
        <textarea name="notes" className="input" rows={2} placeholder="Teslimat ile ilgili notlarınız..." />
      </section>

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
        {loading ? "İşleniyor..." : `Siparişi Tamamla — ${cartTotal.toFixed(2)} ${currency}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Siparişinizi tamamlayarak KVKK Aydınlatma Metni&apos;ni kabul etmiş olursunuz.
        Ödeme sonrası e-Arşiv/e-Fatura otomatik oluşturulur.
      </p>
    </form>
  );
}
