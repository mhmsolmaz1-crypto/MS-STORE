import Link from "next/link";
import { getOrderByNumber } from "@/lib/orders/order-service";
import { getSiteSettings } from "@/lib/site-settings";
import { formatCurrency, formatDate, getOrderStatusLabel, getPaymentStatusLabel } from "@/lib/utils";
import { CheckCircle, Package } from "lucide-react";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  const settings = await getSiteSettings();

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sipariş Bulunamadı</h1>
        <Link href="/" className="text-brand hover:underline mt-4 inline-block">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold mt-4">Siparişiniz Alındı!</h1>
        <p className="text-gray-600 mt-2">
          Sipariş numaranız: <strong className="text-brand">{order.orderNumber}</strong>
        </p>
      </div>

      <div className="card p-6 mt-8 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4" />
          <span>Durum: <strong>{getOrderStatusLabel(order.status)}</strong></span>
        </div>
        <div className="text-sm">
          Ödeme: <strong>{getPaymentStatusLabel(order.paymentStatus)}</strong>
        </div>
        <div className="text-sm text-gray-500">
          Tarih: {formatDate(order.createdAt)}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Ürünler</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>{item.productName} x{item.quantity}</span>
              <span>{formatCurrency(item.lineTotal, settings.currency)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex justify-between font-bold">
          <span>Toplam</span>
          <span className="text-brand">{formatCurrency(order.totalAmount, settings.currency)}</span>
        </div>

        {order.invoice && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            e-Fatura/e-Arşiv oluşturuldu: {order.invoice.invoiceNumber}
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <Link href="/urunler" className="btn-primary">Alışverişe Devam Et</Link>
      </div>
    </div>
  );
}
