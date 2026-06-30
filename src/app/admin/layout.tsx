import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Palette,
  Settings,
  MessageSquare,
  CreditCard,
  LogOut,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/musteriler", label: "Müşteriler", icon: Users },
  { href: "/admin/faturalar", label: "e-Faturalar", icon: FileText },
  { href: "/admin/ciro", label: "Ciro Raporu", icon: BarChart3 },
  { href: "/admin/iletisim", label: "Mesajlar", icon: MessageSquare },
  { href: "/admin/tasarim", label: "Tasarım", icon: Palette },
  { href: "/admin/odeme", label: "Ödeme Ayarları", icon: CreditCard },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Login sayfası layout dışında
  return (
    <div className="min-h-screen bg-gray-100">
      {session ? (
        <div className="flex">
          {/* Sidebar — sadece siz görürsünüz */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r hidden lg:block">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/admin" className="font-bold text-brand text-lg">
                Yönetim Paneli
              </Link>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-sidebar-link"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <div className="text-xs text-gray-500 mb-2 px-3">
                {session.name} ({session.email})
              </div>
              <form action="/api/admin/logout" method="POST">
                <button type="submit" className="admin-sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700">
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </form>
              <Link href="/" className="admin-sidebar-link mt-1 text-xs">
                ← Mağazaya Git
              </Link>
            </div>
          </aside>

          <main className="flex-1 lg:ml-64">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
