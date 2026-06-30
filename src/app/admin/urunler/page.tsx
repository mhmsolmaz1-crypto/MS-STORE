import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, parseProductImages } from "@/lib/utils";
import { getSiteSettings } from "@/lib/site-settings";
import { Plus, Pencil } from "lucide-react";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="text-sm text-gray-500">{products.length} ürün — Panelden ekleyin, kod yazmayın</p>
        </div>
        <Link href="/admin/urunler/yeni" className="btn-primary">
          <Plus className="h-4 w-4" />
          Yeni Ürün
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Ürün</th>
              <th className="text-left p-4">Kategori</th>
              <th className="text-left p-4">Fiyat</th>
              <th className="text-left p-4">Stok</th>
              <th className="text-left p-4">Durum</th>
              <th className="text-left p-4">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const images = parseProductImages(product.images);
              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                        {images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.category?.name ?? "—"}</td>
                  <td className="p-4 font-medium">{formatCurrency(product.price, settings.currency)}</td>
                  <td className="p-4">
                    <span className={product.stockQuantity <= 5 ? "text-red-600 font-medium" : ""}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
                      {product.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/urunler/${product.id}`} className="text-brand hover:underline flex items-center gap-1">
                      <Pencil className="h-3.5 w-3.5" /> Düzenle
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
