import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Ayarları</h1>
        <p className="text-sm text-gray-500 mt-1">İletişim, kargo, vergi ve e-Fatura yapılandırması</p>
      </div>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
