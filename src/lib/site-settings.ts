import prisma from "./prisma";
import type { SiteSettings } from "@prisma/client";

const DEFAULT_SETTINGS: Omit<SiteSettings, "updatedAt"> = {
  id: "singleton",
  siteName: "Mağazam",
  siteDescription: "Profesyonel online alışveriş deneyimi",
  logoUrl: null,
  faviconUrl: null,
  contactEmail: "info@magazam.com",
  contactPhone: "+90 555 000 00 00",
  contactAddress: "İstanbul, Türkiye",
  whatsappNumber: null,
  workingHours: "Pazartesi - Cumartesi: 09:00 - 18:00",
  instagramUrl: null,
  facebookUrl: null,
  twitterUrl: null,
  youtubeUrl: null,
  primaryColor: "#2563eb",
  primaryForeground: "#ffffff",
  secondaryColor: "#64748b",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  fontHeading: "Inter",
  fontBody: "Inter",
  borderRadius: "0.5rem",
  heroTitle: "Kaliteli Ürünler, Hızlı Teslimat",
  heroSubtitle: "Binlerce ürün arasından size en uygun olanı seçin",
  heroImageUrl: null,
  heroCtaText: "Alışverişe Başla",
  footerText: "© 2026 Mağazam. Tüm hakları saklıdır.",
  currency: "TRY",
  currencySymbol: "₺",
  taxRate: 20,
  freeShippingMin: 500,
  defaultShippingFee: 49.9,
  maintenanceMode: false,
  enableCreditCard: true,
  enableBankTransfer: true,
  enableCashOnDelivery: false,
  enableIyzico: true,
  enableStripe: false,
  autoGenerateInvoice: true,
  invoicePrefix: "INV",
  companyTitle: null,
  companyTaxNumber: null,
  companyTaxOffice: null,
  companyAddress: null,
  companyMersisNo: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: DEFAULT_SETTINGS,
    });
  }

  return settings;
}

export function settingsToCssVariables(settings: SiteSettings): Record<string, string> {
  return {
    "--color-primary": settings.primaryColor,
    "--color-primary-foreground": settings.primaryForeground,
    "--color-primary-muted": `${settings.primaryColor}20`,
    "--color-secondary": settings.secondaryColor,
    "--color-accent": settings.accentColor,
    "--color-surface": settings.backgroundColor,
    "--color-surface-elevated": adjustBrightness(settings.backgroundColor, 5),
    "--color-text": settings.textColor,
    "--font-heading": `"${settings.fontHeading}", system-ui, sans-serif`,
    "--font-body": `"${settings.fontBody}", system-ui, sans-serif`,
    "--radius": settings.borderRadius,
  };
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export async function updateSiteSettings(
  data: Partial<Omit<SiteSettings, "id" | "updatedAt">>
): Promise<SiteSettings> {
  return prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { ...DEFAULT_SETTINGS, ...data },
    update: data,
  });
}
