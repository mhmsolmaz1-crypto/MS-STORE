import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { getOrders } from "@/lib/analytics/dashboard";
import { getSiteSettings } from "@/lib/site-settings";
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const { orders, total, totalPages } = await getOrders({
    status: params.status,
    search: params.search,
    page,
    limit: 20,
  });

  const settings = await getSiteSettings();

  const statusFilters = [
    { value: "", label: "Tümü" },
    { value: "PENDING", label: "Bekleyen" },
    { value: "CONFIRMED", label: "Onaylı" },
    { value: "PROCESSING", label: "Hazırlanan" },
    { value: "SHIPPED", label: "Kargoda" },
    { value: "DELIVERED", label: "Teslim" },
    { value: "CANCELLED", label: "İptal" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Siparişler</h1>
          <p className="text-sm text-gray-500">Toplam {total} sipariş</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/siparisler${filter.value ? `?status=${filter.value}` : ""}`}
            className={`badge px-3 py-1.5 ${
              (params.status ?? "") === filter.value
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-500">Sipariş No</th>
                <th className="text-left p-4 font-medium text-gray-500">Müşteri</th>
                <th className="text-left p-4 font-medium text-gray-500">Tutar</th>
                <th className="text-left p-4 font-medium text-gray-500">Ödeme</th>
                <th className="text-left p-4 font-medium text-gray-500">Durum</th>
                <th className="text-left p-4 font-medium text-gray-500">Fatura</th>
                <th className="text-left p-4 font-medium text-gray-500">Tarih</th>
                <th className="text-left p-4 font-medium text-gray-500">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Link href={`/admin/siparisler/${order.id}`} className="font-mono text-xs text-brand hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div>{order.shippingFirstName} {order.shippingLastName}</div>
                    <div className="text-xs text-gray-400">{order.customer.email}</div>
                  </td>
                  <td className="p-4 font-medium">
                    {formatCurrency(order.totalAmount, settings.currency)}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${
                      order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="badge bg-gray-100">{getOrderStatusLabel(order.status)}</span>
                  </td>
                  <td className="p-4 text-xs">
                    {order.invoice ? order.invoice.invoiceNumber : "—"}
                  </td>
                  <td className="p-4 text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="p-4">
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/siparisler?page=${p}${params.status ? `&status=${params.status}` : ""}`}
                className={`px-3 py-1 rounded text-sm ${
                  p === page ? "bg-brand text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
