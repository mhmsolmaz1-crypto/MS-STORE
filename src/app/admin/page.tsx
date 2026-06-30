import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import {
  getDashboardStats,
  getRevenueChart,
  getTopProducts,
  getRecentOrders,
} from "@/lib/analytics/dashboard";
import { formatCurrency, formatShortDate, getOrderStatusLabel, getPaymentStatusLabel } from "@/lib/utils";
import { getSiteSettings } from "@/lib/site-settings";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  MessageSquare,
  Truck,
  CheckCircle,
} from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [stats, revenueData, topProducts, recentOrders, settings] = await Promise.all([
    getDashboardStats(),
    getRevenueChart(30),
    getTopProducts(5),
    getRecentOrders(8),
    getSiteSettings(),
  ]);

  const statCards = [
    {
      title: "Toplam Sipariş",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Bugünkü Sipariş",
      value: stats.todayOrders,
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Toplam Ciro",
      value: formatCurrency(stats.totalRevenue, settings.currency),
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100",
      isText: true,
    },
    {
      title: "Bugünkü Ciro",
      value: formatCurrency(stats.todayRevenue, settings.currency),
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
      isText: true,
    },
    {
      title: "Müşteriler",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-indigo-600 bg-indigo-100",
    },
    {
      title: "Düşük Stok",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  const orderStatusCards = [
    { label: "Bekleyen", count: stats.pendingOrders, icon: ShoppingCart, color: "border-yellow-400" },
    { label: "Hazırlanan", count: stats.processingOrders, icon: Package, color: "border-blue-400" },
    { label: "Kargoda", count: stats.shippedOrders, icon: Truck, color: "border-purple-400" },
    { label: "Teslim Edilen", count: stats.deliveredOrders, icon: CheckCircle, color: "border-green-400" },
    { label: "İptal", count: stats.cancelledOrders, icon: AlertTriangle, color: "border-red-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hoş geldiniz, {session.name}. İşte mağazanızın özeti.
        </p>
      </div>

      {/* Ana istatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sipariş durumları — kaç geldi, kaç gitti */}
      <div>
        <h2 className="font-bold text-lg mb-4">Sipariş Durumları</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {orderStatusCards.map((item) => (
            <div key={item.label} className={`card p-4 border-l-4 ${item.color}`}>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              <p className="text-3xl font-bold mt-2">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ciro grafiği */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4">Son 30 Gün Ciro</h2>
        <RevenueChart data={revenueData} currency={settings.currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son siparişler */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Son Siparişler</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz sipariş yok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Sipariş No</th>
                    <th className="pb-2">Müşteri</th>
                    <th className="pb-2">Tutar</th>
                    <th className="pb-2">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2.5 font-mono text-xs">{order.orderNumber}</td>
                      <td className="py-2.5">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="py-2.5 font-medium">
                        {formatCurrency(order.totalAmount, settings.currency)}
                      </td>
                      <td className="py-2.5">
                        <span className="badge bg-gray-100 text-gray-700">
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* En çok satan ürünler */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">En Çok Satan Ürünler</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz satış verisi yok</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">#{index + 1}</span>
                    <span className="text-sm font-medium">{product.productName}</span>
                  </div>
                  <div className="text-right text-sm">
                    <span className="font-medium">{product.totalSold} adet</span>
                    <span className="text-gray-400 ml-2">
                      {formatCurrency(product.totalRevenue, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Uyarılar */}
      {(stats.unreadMessages > 0 || stats.failedInvoices > 0 || stats.lowStockProducts > 0) && (
        <div className="card p-6 border-yellow-200 bg-yellow-50">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Dikkat Gerektiren
          </h2>
          <ul className="space-y-2 text-sm">
            {stats.unreadMessages > 0 && (
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {stats.unreadMessages} okunmamış iletişim mesajı
              </li>
            )}
            {stats.failedInvoices > 0 && (
              <li>{stats.failedInvoices} başarısız e-Fatura</li>
            )}
            {stats.lowStockProducts > 0 && (
              <li>{stats.lowStockProducts} ürün düşük stokta</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
