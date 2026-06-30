export type ProductCategory = "saat" | "cuzdan" | "kemer";

export interface SeedProduct {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  originalImage: string;
}

export const MS_PRODUCTS: SeedProduct[] = [
  { id: 1, name: "Premium Gümüş Zümrüt Yeşil Kadran Saat", price: 600, category: "saat", originalImage: "1.jpeg" },
  { id: 2, name: "Aqua Minimalist Çelik Kordon Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.44.jpeg" },
  { id: 3, name: "Classic Gold-Silver Chronograph Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (1).jpeg" },
  { id: 4, name: "Golden Skeleton Premium Otomatik Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (2).jpeg" },
  { id: 5, name: "Diamond Cut Lacivert Kadran Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (3).jpeg" },
  { id: 6, name: "Sport Carbon Black Erkek Kol Saati", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (4).jpeg" },
  { id: 7, name: "Submariner Cam Göbeği Yeşil Bezel Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (5).jpeg" },
  { id: 8, name: "Executive Silver Dress Luxury Watch", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (6).jpeg" },
  { id: 9, name: "White Dial Sport Steel Özel Seri Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (7).jpeg" },
  { id: 10, name: "Deep Sea Blue Automatic Çelik Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (8).jpeg" },
  { id: 11, name: "Neon Lime Racing Edition Kol Saati", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45 (9).jpeg" },
  { id: 12, name: "Vintage Full Gold Klasik Kadran Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.45.jpeg" },
  { id: 13, name: "Prestige Jade Green Dial Mekanik Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46 (1).jpeg" },
  { id: 14, name: "Ochre Yellow Özel Tasarım Kadran Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46 (2).jpeg" },
  { id: 15, name: "Crimson Red Bold Çelik Kordon Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46 (3).jpeg" },
  { id: 16, name: "Stealth Matte Black Özel Seri Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46 (4).jpeg" },
  { id: 17, name: "Luxury Green Emerald Cuff Metal Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46 (5).jpeg" },
  { id: 18, name: "Oyster Permanent Gold-Silver Bezel Saat", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46 (6).jpeg" },
  { id: 19, name: "Hakiki Siyah Deri Lüks Kartlık Blok Seti", price: 600, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46 (7).jpeg" },
  { id: 20, name: "Master Steel Chrono Collection Kol Saati", price: 600, category: "saat", originalImage: "WhatsApp Image 2026-06-27 at 14.26.46.jpeg" },
  { id: 21, name: "Checkered Monogram Deri Cüzdan", price: 600, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (1).jpeg" },
  { id: 22, name: "Textured Leather Bi-fold İki Katlı Cüzdan", price: 600, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (2).jpeg" },
  { id: 23, name: "Slim Card Case Minimalist İmza Kartlık", price: 600, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (3).jpeg" },
  { id: 24, name: "Powder Pink Kadın Portföy Cüzdanı", price: 600, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (4).jpeg" },
  { id: 25, name: "Multi-color Renkli Bölmeli Kartlık Seti", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (5).jpeg" },
  { id: 26, name: "Magenta Velvet Kadın Çıtçıtlı Cüzdan", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (6).jpeg" },
  { id: 27, name: "Croc Embossed Timsah Desen Lüks Kartlık", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (7).jpeg" },
  { id: 28, name: "Monogram Zip Fermuarlı Bozuk Para Cüzdanı", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (8).jpeg" },
  { id: 29, name: "Matte Black El ve Seyahat Tipi Organizer", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (9).jpeg" },
  { id: 30, name: "Saffiano Deri Çok Fonksiyonlu Cüzdan Seti", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (10).jpeg" },
  { id: 31, name: "Premium Kabartma Desenli Akıllı Telefon Kılıfı", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (11).jpeg" },
  { id: 32, name: "Minimalist Tan Deri Pratik Kartlık Pouch", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (12).jpeg" },
  { id: 33, name: "White Gold Zarf Tarzı Lüks Abiye Cüzdan", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (13).jpeg" },
  { id: 34, name: "Classic Grain Business İki Kapaklı Cüzdan", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (14).jpeg" },
  { id: 35, name: "Triple Slot Kompakt Hakiki Deri Kartlık", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (15).jpeg" },
  { id: 36, name: "Carbon Fiber Mekanizmalı Kart Koruyucu", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (16).jpeg" },
  { id: 37, name: "Full Grid Matrix Cüzdan Teşhir Paneli", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (17).jpeg" },
  { id: 38, name: "Executive Lüks Cüzdan & Aksesuar Standı", price: 350, category: "cuzdan", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (18).jpeg" },
  { id: 39, name: "Classic Black Hakiki Deri Erkek Kemeri", price: 400, category: "kemer", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (19).jpeg" },
  { id: 40, name: "Automatic Buckle Otomatik Tokalı Kemer", price: 400, category: "kemer", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (20).jpeg" },
  { id: 41, name: "Reversible Saffiano Çift Taraflı Akıllı Kemer", price: 400, category: "kemer", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47 (21).jpeg" },
  { id: 42, name: "Luxury Gold Buckle Kemer & Anahtarlık Seti", price: 400, category: "kemer", originalImage: "WhatsApp Image 2026-06-27 at 14.26.47.jpeg" },
];

export const CATEGORY_CONFIG = [
  { slug: "premium-saatler", name: "Premium Saatler", productCategory: "saat" as const, sortOrder: 1 },
  { slug: "cuzdan-kartlik", name: "Cüzdan & Kartlık & Kılıf", productCategory: "cuzdan" as const, sortOrder: 2 },
  { slug: "kemer-aksesuar", name: "Kemer & Aksesuar Setleri", productCategory: "kemer" as const, sortOrder: 3 },
];

const TURKISH_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
};

export function slugifyProduct(name: string): string {
  return name
    .split("")
    .map((char) => TURKISH_MAP[char] ?? char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const WATCH_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
  "https://images.unsplash.com/photo-1547996160-81dfaaea8046?w=600",
  "https://images.unsplash.com/photo-1587836374828-4dbafa94be0d?w=600",
  "https://images.unsplash.com/photo-1614164185124-e4ec99c436d6?w=600",
  "https://images.unsplash.com/photo-1622439074429-2337a8e72222?w=600",
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600",
  "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600",
  "https://images.unsplash.com/photo-1508685096489-7aacad43f375?w=600",
  "https://images.unsplash.com/photo-1533139502658-019a674de933?w=600",
];

const WALLET_IMAGES = [
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
  "https://images.unsplash.com/photo-1606761568499-6d2451b23a66?w=600",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600",
  "https://images.unsplash.com/photo-1564422170194-896891a65826?w=600",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
];

const BELT_IMAGES = [
  "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=600",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
  "https://images.unsplash.com/photo-1594938298605-cd64d719f1c2?w=600",
  "https://images.unsplash.com/photo-1611312445858-1446963149634?w=600",
];

export function productImageUrl(id: number, category: ProductCategory): string {
  const pool =
    category === "saat" ? WATCH_IMAGES : category === "cuzdan" ? WALLET_IMAGES : BELT_IMAGES;
  return pool[(id - 1) % pool.length];
}

/** Yerel görsel yolu — scripts/copy-product-images.ps1 ile doldurulur */
export function productImagePath(id: number): string {
  return `/products/${String(id).padStart(2, "0")}.jpeg`;
}

export const PRODUCT_DESCRIPTION =
  "M.S Premium kalitesiyle özenle üretilmiş koleksiyon parçası. İnce işçilik, lüks kaplama detaylar ve yüksek dayanıklılık standartlarına sahiptir. Kutu içeriğine orijinal garanti sertifikası dahildir.";
