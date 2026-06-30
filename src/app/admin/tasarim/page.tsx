import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { DesignSettingsForm } from "@/components/admin/DesignSettingsForm";

export default async function AdminDesignPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasarım Ayarları</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mağaza görünümünü kod yazmadan buradan yönetin. Renkler, fontlar, hero bölümü ve logo.
        </p>
      </div>
      <DesignSettingsForm settings={settings} />
    </div>
  );
}
