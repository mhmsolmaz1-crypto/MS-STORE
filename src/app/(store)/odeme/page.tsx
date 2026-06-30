import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getSiteSettings } from "@/lib/site-settings";
import { getEnabledProviders } from "@/lib/payments/types";
import { formatCurrency } from "@/lib/utils";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import prisma from "@/lib/prisma";

export default async function CheckoutPage() {
  const cart = await getCart();
  const settings = await getSiteSettings();

  if (cart.items.length === 0) {
    redirect("/sepet");
  }

  const enabledMethods = getEnabledProviders(settings);
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm
            cartTotal={cart.total}
            currency={settings.currency}
            currencySymbol={settings.currencySymbol}
            taxRate={settings.taxRate}
            enabledMethods={enabledMethods}
            bankAccounts={bankAccounts}
          />
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-bold mb-4">Sipariş Özeti</h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.product.name} x{item.quantity}
                </span>
                <span>{formatCurrency(item.product.price * item.quantity, settings.currency)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span>{formatCurrency(cart.subtotal, settings.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>KDV</span>
              <span>{formatCurrency(cart.taxAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kargo</span>
              <span>
                {cart.shippingCost === 0 ? "Ücretsiz" : formatCurrency(cart.shippingCost, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Toplam</span>
              <span className="text-brand">{formatCurrency(cart.total, settings.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
