import Link from "next/link";
import { ShoppingCart, Search, Menu, Phone, Mail } from "lucide-react";
import { getSiteSettings, settingsToCssVariables } from "@/lib/site-settings";
import { getCart } from "@/lib/cart";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const cssVars = settingsToCssVariables(settings);
  const cart = await getCart();

  if (settings.maintenanceMode) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={cssVars as React.CSSProperties}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bakım Modu</h1>
          <p className="mt-2 text-gray-600">
            Sitemiz şu anda bakımda. Kısa süre içinde tekrar hizmetinizdeyiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={cssVars as React.CSSProperties} className="min-h-screen flex flex-col">
      {/* Üst bilgi çubuğu */}
      <div className="bg-gray-900 text-white text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-1 hover:text-gray-300">
                <Phone className="h-3.5 w-3.5" />
                {settings.contactPhone}
              </a>
            )}
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-1 hover:text-gray-300">
                <Mail className="h-3.5 w-3.5" />
                {settings.contactEmail}
              </a>
            )}
          </div>
          {settings.workingHours && (
            <span className="hidden md:block text-gray-400">{settings.workingHours}</span>
          )}
        </div>
      </div>

      {/* Ana header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt={settings.siteName} className="h-8" />
              ) : (
                <span className="text-xl font-bold text-brand">{settings.siteName}</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-brand transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/urunler" className="text-sm font-medium hover:text-brand transition-colors">
                Ürünler
              </Link>
              <Link href="/iletisim" className="text-sm font-medium hover:text-brand transition-colors">
                İletişim
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/urunler" className="btn-ghost p-2">
                <Search className="h-5 w-5" />
              </Link>
              <Link href="/sepet" className="btn-ghost p-2 relative">
                <ShoppingCart className="h-5 w-5" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-white">
                    {cart.itemCount}
                  </span>
                )}
              </Link>
              <button className="btn-ghost p-2 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">{settings.siteName}</h3>
              <p className="text-sm text-gray-600">{settings.siteDescription}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Hızlı Linkler</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/urunler" className="hover:text-brand">Ürünler</Link></li>
                <li><Link href="/sepet" className="hover:text-brand">Sepetim</Link></li>
                <li><Link href="/iletisim" className="hover:text-brand">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">İletişim</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {settings.contactAddress && <li>{settings.contactAddress}</li>}
                {settings.contactPhone && <li>{settings.contactPhone}</li>}
                {settings.contactEmail && <li>{settings.contactEmail}</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Güvenli Alışveriş</h4>
              <p className="text-sm text-gray-600">
                256-bit SSL şifreleme ile güvenli ödeme. e-Fatura / e-Arşiv otomatik kesilir.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
            {settings.footerText ?? `© ${new Date().getFullYear()} ${settings.siteName}. Tüm hakları saklıdır.`}
          </div>
        </div>
      </footer>
    </div>
  );
}
