import Link from "next/link";
import { getCart } from "@/lib/cart";
import { getSiteSettings } from "@/lib/site-settings";
import { formatCurrency, parseProductImages } from "@/lib/utils";
import { CartItemControls } from "@/components/store/CartItemControls";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default async function CartPage() {
  const cart = await getCart();
  const settings = await getSiteSettings();

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300" />
        <h1 className="text-2xl font-bold mt-4">Sepetiniz Boş</h1>
        <p className="text-gray-500 mt-2">Alışverişe başlamak için ürünlerimize göz atın.</p>
        <Link href="/urunler" className="btn-primary mt-6 inline-flex">
          Ürünlere Git
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sepetim ({cart.itemCount} ürün)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const images = parseProductImages(item.product.images);
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <Link href={`/urun/${item.product.slug}`} className="font-medium hover:text-brand">
                    {item.product.name}
                  </Link>
                  <p className="text-brand font-bold mt-1">
                    {formatCurrency(item.product.price, settings.currency)}
                  </p>
                  <CartItemControls productId={item.productId} quantity={item.quantity} />
                </div>
                <div className="text-right font-bold">
                  {formatCurrency(item.product.price * item.quantity, settings.currency)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">Sipariş Özeti</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ara Toplam</span>
              <span>{formatCurrency(cart.subtotal, settings.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">KDV (%{settings.taxRate})</span>
              <span>{formatCurrency(cart.taxAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kargo</span>
              <span>
                {cart.shippingCost === 0
                  ? "Ücretsiz"
                  : formatCurrency(cart.shippingCost, settings.currency)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Toplam</span>
              <span className="text-brand">{formatCurrency(cart.total, settings.currency)}</span>
            </div>
          </div>
          <Link href="/odeme" className="btn-primary w-full mt-6 py-3">
            Ödemeye Geç
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
