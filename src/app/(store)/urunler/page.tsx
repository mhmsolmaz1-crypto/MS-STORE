import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { parseProductImages } from "@/lib/utils";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductFilters } from "@/components/store/ProductFilters";

interface PageProps {
  searchParams: Promise<{ q?: string; kategori?: string; siralama?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();

  const where: Record<string, unknown> = { isActive: true };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }

  if (params.kategori) {
    where.category = { slug: params.kategori };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params.siralama === "fiyat-artan") orderBy = { price: "asc" };
  if (params.siralama === "fiyat-azalan") orderBy = { price: "desc" };
  if (params.siralama === "isim") orderBy = { name: "asc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tüm Ürünler</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <ProductFilters categories={categories} currentCategory={params.kategori} />
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>Aramanızla eşleşen ürün bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, images: parseProductImages(product.images) }}
                  currency={settings.currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
