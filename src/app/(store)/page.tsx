import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { formatCurrency, parseProductImages } from "@/lib/utils";
import { ProductCard } from "@/components/store/ProductCard";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const settings = await getSiteSettings();

  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const latestProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : latestProducts;

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: settings.heroImageUrl
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${settings.heroImageUrl}) center/cover`
            : "linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%)",
        }}
      >
        <div className="container mx-auto px-4 py-24 md:py-32 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {settings.heroTitle ?? "Kaliteli Ürünler, Hızlı Teslimat"}
            </h1>
            <p className="mt-4 text-lg text-white/80">
              {settings.heroSubtitle ?? "Binlerce ürün arasından size en uygun olanı seçin"}
            </p>
            <Link href="/urunler" className="btn mt-8 bg-white text-gray-900 hover:bg-gray-100 inline-flex">
              {settings.heroCtaText ?? "Alışverişe Başla"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ücretsiz kargo banner */}
      {settings.freeShippingMin && (
        <section className="bg-brand/5 border-y border-brand/10">
          <div className="container mx-auto px-4 py-4 text-center text-sm">
            <span className="font-medium text-brand">
              {formatCurrency(settings.freeShippingMin, settings.currency)} ve üzeri siparişlerde ücretsiz kargo!
            </span>
          </div>
        </section>
      )}

      {/* Ürünler */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Öne Çıkan Ürünler</h2>
          <Link href="/urunler" className="text-sm text-brand hover:underline flex items-center gap-1">
            Tümünü Gör <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>Henüz ürün eklenmemiş. Yönetici panelinden ürün ekleyebilirsiniz.</p>
            <Link href="/admin" className="text-brand hover:underline mt-2 inline-block">
              Yönetici Paneli →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  images: parseProductImages(product.images),
                }}
                currency={settings.currency}
              />
            ))}
          </div>
        )}
      </section>

      {/* Güven rozetleri */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold">Güvenli Ödeme</h3>
              <p className="text-sm text-gray-600 mt-1">256-bit SSL ile korunan ödeme altyapısı</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-semibold">Hızlı Kargo</h3>
              <p className="text-sm text-gray-600 mt-1">Siparişleriniz aynı gün kargoya verilir</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🧾</div>
              <h3 className="font-semibold">Otomatik e-Fatura</h3>
              <p className="text-sm text-gray-600 mt-1">Ödeme sonrası e-Arşiv/e-Fatura otomatik kesilir</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
