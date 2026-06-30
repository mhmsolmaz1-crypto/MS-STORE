"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@prisma/client";

interface SiteSettingsFormProps {
  settings: SiteSettings;
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(form.entries());
    data.maintenanceMode = form.get("maintenanceMode") === "on";
    data.autoGenerateInvoice = form.get("autoGenerateInvoice") === "on";
    data.taxRate = parseFloat(data.taxRate as string);
    data.freeShippingMin = data.freeShippingMin ? parseFloat(data.freeShippingMin as string) : null;
    data.defaultShippingFee = parseFloat(data.defaultShippingFee as string);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Ayarlar kaydedildi.
        </div>
      )}

      <section className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">Genel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Site Adı</label>
            <input name="siteName" className="input" defaultValue={settings.siteName} />
          </div>
          <div>
            <label className="label">Site Açıklaması</label>
            <input name="siteDescription" className="input" defaultValue={settings.siteDescription ?? ""} />
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} />
          <span className="text-sm">Bakım Modu (mağaza kapalı)</span>
        </label>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">İletişim Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">E-posta</label>
            <input name="contactEmail" type="email" className="input" defaultValue={settings.contactEmail ?? ""} />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input name="contactPhone" className="input" defaultValue={settings.contactPhone ?? ""} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Adres</label>
            <textarea name="contactAddress" className="input" rows={2} defaultValue={settings.contactAddress ?? ""} />
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input name="whatsappNumber" className="input" defaultValue={settings.whatsappNumber ?? ""} />
          </div>
          <div>
            <label className="label">Çalışma Saatleri</label>
            <input name="workingHours" className="input" defaultValue={settings.workingHours ?? ""} />
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">Mağaza & Kargo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">KDV Oranı (%)</label>
            <input name="taxRate" type="number" className="input" defaultValue={settings.taxRate} />
          </div>
          <div>
            <label className="label">Ücretsiz Kargo Min. (₺)</label>
            <input name="freeShippingMin" type="number" className="input" defaultValue={settings.freeShippingMin ?? ""} />
          </div>
          <div>
            <label className="label">Varsayılan Kargo Ücreti (₺)</label>
            <input name="defaultShippingFee" type="number" step="0.01" className="input" defaultValue={settings.defaultShippingFee} />
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-bold text-lg">e-Fatura / e-Arşiv Ayarları</h2>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="autoGenerateInvoice" defaultChecked={settings.autoGenerateInvoice} />
          <span className="text-sm">Ödeme sonrası otomatik e-Fatura/e-Arşiv oluştur</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Fatura Öneki</label>
            <input name="invoicePrefix" className="input" defaultValue={settings.invoicePrefix} />
          </div>
          <div>
            <label className="label">Şirket Ünvanı</label>
            <input name="companyTitle" className="input" defaultValue={settings.companyTitle ?? ""} />
          </div>
          <div>
            <label className="label">Vergi Numarası</label>
            <input name="companyTaxNumber" className="input" defaultValue={settings.companyTaxNumber ?? ""} />
          </div>
          <div>
            <label className="label">Vergi Dairesi</label>
            <input name="companyTaxOffice" className="input" defaultValue={settings.companyTaxOffice ?? ""} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Şirket Adresi</label>
            <textarea name="companyAddress" className="input" rows={2} defaultValue={settings.companyAddress ?? ""} />
          </div>
        </div>
      </section>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
      </button>
    </form>
  );
}
