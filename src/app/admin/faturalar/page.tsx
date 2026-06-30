import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate, getInvoiceStatusLabel } from "@/lib/utils";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminInvoicesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [invoices, settings] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { order: { include: { customer: true } } },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">e-Faturalar / e-Arşiv</h1>
        <p className="text-sm text-gray-500">Ödeme sonrası otomatik oluşturulan faturalar</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Fatura No</th>
              <th className="text-left p-4">Sipariş</th>
              <th className="text-left p-4">Müşteri</th>
              <th className="text-left p-4">Tip</th>
              <th className="text-left p-4">Tutar</th>
              <th className="text-left p-4">Durum</th>
              <th className="text-left p-4">ETTN</th>
              <th className="text-left p-4">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{inv.invoiceNumber}</td>
                <td className="p-4 font-mono text-xs">{inv.order.orderNumber}</td>
                <td className="p-4">{inv.order.customer.email}</td>
                <td className="p-4">
                  <span className="badge bg-blue-100 text-blue-800">
                    {inv.invoiceType === "E_FATURA" ? "e-Fatura" : "e-Arşiv"}
                  </span>
                </td>
                <td className="p-4 font-medium">
                  {formatCurrency(inv.totalAmount, settings.currency)}
                </td>
                <td className="p-4">
                  <span className={`badge ${
                    inv.status === "ISSUED" || inv.status === "SENT"
                      ? "bg-green-100 text-green-800"
                      : inv.status === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {getInvoiceStatusLabel(inv.status)}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-gray-400">{inv.ettn ?? "—"}</td>
                <td className="p-4 text-xs text-gray-500">{formatDate(inv.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
