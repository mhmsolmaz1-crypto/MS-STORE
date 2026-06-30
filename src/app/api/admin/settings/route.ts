import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { updateSiteSettings } from "@/lib/site-settings";

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await request.json();

    const settings = await updateSiteSettings(data);
    await logAdminAction(session.adminId, "UPDATE", "SiteSettings", "singleton");

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    return NextResponse.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}
