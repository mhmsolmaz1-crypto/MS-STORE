import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CATEGORY_CONFIG,
  MS_PRODUCTS,
  PRODUCT_DESCRIPTION,
  productImagePath,
  productImageUrl,
  slugifyProduct,
} from "./products-data";

const prisma = new PrismaClient();

async function main() {
  console.log("M.S Premium veritabanı seed başlıyor...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@magazam.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";

  await prisma.admin.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "Site Yöneticisi",
      role: "OWNER",
    },
    update: {},
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      siteName: "M.S Premium",
      siteDescription: "M.S Software Premium Aksesuar Ekosistemi — Saat, cüzdan ve kemer koleksiyonu",
      contactEmail: "info@mspremium.com",
      contactPhone: "+90 212 555 00 00",
      contactAddress: "Türkiye",
      workingHours: "Pazartesi - Cumartesi: 09:00 - 19:00",
      heroTitle: "Lüks ve Detayın Mükemmel Uyumu",
      heroSubtitle: "42 benzersiz premium saat, cüzdan ve kemer koleksiyonu",
      heroCtaText: "Koleksiyonu Keşfet",
      primaryColor: "#06b6d4",
      accentColor: "#8b5cf6",
      taxRate: 20,
      freeShippingMin: 500,
      defaultShippingFee: 49.9,
      autoGenerateInvoice: true,
      companyTitle: "M.S Software Premium",
      companyTaxNumber: "1234567890",
      companyTaxOffice: "İstanbul",
      companyAddress: "İstanbul, Türkiye",
    },
    update: {
      siteName: "M.S Premium",
      siteDescription: "M.S Software Premium Aksesuar Ekosistemi — Saat, cüzdan ve kemer koleksiyonu",
      heroTitle: "Lüks ve Detayın Mükemmel Uyumu",
      heroSubtitle: "42 benzersiz premium saat, cüzdan ve kemer koleksiyonu",
      freeShippingMin: 500,
    },
  });

  const categoryMap = new Map<string, string>();

  for (const cat of CATEGORY_CONFIG) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        sortOrder: cat.sortOrder,
        description: `${cat.name} koleksiyonu`,
      },
      update: {
        name: cat.name,
        sortOrder: cat.sortOrder,
      },
    });
    categoryMap.set(cat.productCategory, category.id);
  }

  for (const product of MS_PRODUCTS) {
    const slug = slugifyProduct(product.name);
    const categoryId = categoryMap.get(product.category);
    const categoryLabel =
      product.category === "saat"
        ? "Premium Saat"
        : product.category === "cuzdan"
          ? "Cüzdan & Aksesuar"
          : "Kemer & Set";

    await prisma.product.upsert({
      where: { slug },
      create: {
        name: product.name,
        slug,
        shortDescription: `${categoryLabel} — M.S Premium koleksiyon`,
        description: PRODUCT_DESCRIPTION,
        sku: `MS-${String(product.id).padStart(3, "0")}`,
        price: product.price,
        compareAtPrice: product.price === 600 ? 750 : product.price === 400 ? 550 : 450,
        costPrice: Math.round(product.price * 0.45),
        stockQuantity: 100,
        categoryId,
        isFeatured: product.id <= 8,
        isActive: true,
        images: JSON.stringify([productImageUrl(product.id, product.category), productImagePath(product.id)]),
      },
      update: {
        name: product.name,
        shortDescription: `${categoryLabel} — M.S Premium koleksiyon`,
        description: PRODUCT_DESCRIPTION,
        sku: `MS-${String(product.id).padStart(3, "0")}`,
        price: product.price,
        compareAtPrice: product.price === 600 ? 750 : product.price === 400 ? 550 : 450,
        costPrice: Math.round(product.price * 0.45),
        stockQuantity: 100,
        categoryId,
        isFeatured: product.id <= 8,
        isActive: true,
        images: JSON.stringify([productImageUrl(product.id, product.category), productImagePath(product.id)]),
      },
    });
  }

  await prisma.bankAccount.upsert({
    where: { id: "default-bank" },
    create: {
      id: "default-bank",
      bankName: "Ziraat Bankası",
      accountHolder: "M.S Software Premium",
      iban: "TR00 0000 0000 0000 0000 0000 00",
      isActive: true,
    },
    update: {},
  });

  console.log(`Seed tamamlandı! ${MS_PRODUCTS.length} ürün eklendi.`);
  console.log(`Admin giriş: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
