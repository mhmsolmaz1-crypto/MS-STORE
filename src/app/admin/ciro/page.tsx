import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getRevenueChart, getTopProducts, getDashboardStats } from "@/lib/analytics/dashboard";
import { getSiteSettings } from "@/lib/site-settings";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/RevenueChart";

export default async function AdminRevenuePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [stats, revenue30, revenue7, topProducts, settings] = await Promise.all([
    getDashboardStats(),
    getRevenueChart(30),
    getRevenueChart(7),
    getTopProducts(10),
    getSiteSettings(),
  ]);

  const weekRevenue = revenue7.reduce((sum, d) => sum + d.revenue, 0);
  const monthRevenue = revenue30.reduce((sum, d) => sum + d.revenue, 0);
  const weekOrders = revenue7.reduce((sum, d) => sum + d.orderCount, 0);
  const monthOrders = revenue30.reduce((sum, d) => sum + d.orderCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Ciro Raporu</h1>
        <p className="text-sm text-gray-500">Detaylı gelir analizi — sadece siz görebilirsiniz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Ciro", value: formatCurrency(stats.totalRevenue, settings.currency) },
          { label: "Bugünkü Ciro", value: formatCurrency(stats.todayRevenue, settings.currency) },
          { label: "Bu Hafta", value: formatCurrency(weekRevenue, settings.currency) },
          { label: "Bu Ay (30 gün)", value: formatCurrency(monthRevenue, settings.currency) },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold mt-1 text-brand">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Bu Hafta Sipariş</p>
          <p className="text-3xl font-bold">{weekOrders}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Bu Ay Sipariş (30 gün)</p>
          <p className="text-3xl font-bold">{monthOrders}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4">30 Günlük Ciro Grafiği</h2>
        <RevenueChart data={revenue30} currency={settings.currency} />
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4">Ürün Bazlı Ciro Tablosu</h2>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-gray-500">
              <th className="pb-2">#</th>
              <th className="pb-2">Ürün</th>
              <th className="pb-2">Satış Adedi</th>
              <th className="pb-2">Toplam Ciro</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={p.productId} className="border-b">
                <td className="py-3 text-gray-400">{i + 1}</td>
                <td className="py-3 font-medium">{p.productName}</td>
                <td className="py-3">{p.totalSold}</td>
                <td className="py-3 font-bold text-brand">
                  {formatCurrency(p.totalRevenue, settings.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
