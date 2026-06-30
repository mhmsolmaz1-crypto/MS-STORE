import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { updateSiteSettings } from "@/lib/site-settings";

const designFields = [
  "primaryColor", "primaryForeground", "secondaryColor", "accentColor",
  "backgroundColor", "textColor", "fontHeading", "fontBody", "borderRadius",
  "heroTitle", "heroSubtitle", "heroImageUrl", "heroCtaText",
  "logoUrl", "faviconUrl", "footerText",
];

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await request.json();

    const designData: Record<string, string> = {};
    for (const field of designFields) {
      if (data[field] !== undefined) {
        designData[field] = data[field];
      }
      // Renk alanları için _text suffix'li inputları da kontrol et
      const textField = `${field}_text`;
      if (data[textField] !== undefined && field.includes("Color")) {
        designData[field] = data[textField];
      }
    }

    const settings = await updateSiteSettings(designData);
    await logAdminAction(session.adminId, "UPDATE", "DesignSettings", "singleton");

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    return NextResponse.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}
