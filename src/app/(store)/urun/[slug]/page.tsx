import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { formatCurrency, parseProductImages } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/AddToCartButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const settings = await getSiteSettings();

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });

  if (!product) notFound();

  const images = parseProductImages(product.images);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Görseller */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">Görsel yok</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {images.slice(1, 5).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt="" className="aspect-square object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>

        {/* Bilgiler */}
        <div>
          {product.category && (
            <span className="text-sm text-brand font-medium">{product.category.name}</span>
          )}
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand">
              {formatCurrency(product.price, settings.currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatCurrency(product.compareAtPrice, settings.currency)}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-gray-600">{product.shortDescription}</p>
          )}

          <div className="mt-4 flex items-center gap-2 text-sm">
            {product.stockQuantity > 0 ? (
              <span className="badge bg-green-100 text-green-800">Stokta ({product.stockQuantity})</span>
            ) : (
              <span className="badge bg-red-100 text-red-800">Stokta Yok</span>
            )}
            {product.sku && <span className="text-gray-400">SKU: {product.sku}</span>}
          </div>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              disabled={product.stockQuantity <= 0 && !product.allowBackorder}
            />
          </div>

          {product.description && (
            <div className="mt-10 border-t pt-8">
              <h2 className="font-semibold mb-3">Ürün Açıklaması</h2>
              <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
