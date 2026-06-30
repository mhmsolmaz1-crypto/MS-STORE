"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@prisma/client";

interface DesignSettingsFormProps {
  settings: SiteSettings;
}

export function DesignSettingsForm({ settings }: DesignSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/admin/settings/design", {
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Tasarım ayarları kaydedildi. Mağazayı yenileyerek görün.
        </div>
      )}

      {/* Renkler */}
      <section className="card p-6">
        <h2 className="font-bold text-lg mb-4">Renkler & Tipografi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "primaryColor", label: "Ana Renk" },
            { name: "primaryForeground", label: "Ana Renk Yazı" },
            { name: "secondaryColor", label: "İkincil Renk" },
            { name: "accentColor", label: "Vurgu Rengi" },
            { name: "backgroundColor", label: "Arka Plan" },
            { name: "textColor", label: "Metin Rengi" },
          ].map((field) => (
            <div key={field.name}>
              <label className="label">{field.label}</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name={field.name}
                  defaultValue={String(settings[field.name as keyof SiteSettings] ?? "")}
                  className="h-10 w-12 rounded border cursor-pointer"
                />
                <input
                  name={`${field.name}_text`}
                  defaultValue={String(settings[field.name as keyof SiteSettings] ?? "")}
                  className="input flex-1 font-mono text-xs"
                  onChange={(e) => {
                    const colorInput = e.target.parentElement?.querySelector('input[type="color"]') as HTMLInputElement;
                    if (colorInput) colorInput.value = e.target.value;
                  }}
                />
              </div>
            </div>
          ))}
          <div>
            <label className="label">Başlık Fontu</label>
            <select name="fontHeading" className="input" defaultValue={settings.fontHeading}>
              {["Inter", "Roboto", "Poppins", "Montserrat", "Open Sans"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Gövde Fontu</label>
            <select name="fontBody" className="input" defaultValue={settings.fontBody}>
              {["Inter", "Roboto", "Poppins", "Montserrat", "Open Sans"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Köşe Yuvarlaklığı</label>
            <select name="borderRadius" className="input" defaultValue={settings.borderRadius}>
              <option value="0">Köşeli (0)</option>
              <option value="0.25rem">Hafif (0.25rem)</option>
              <option value="0.5rem">Normal (0.5rem)</option>
              <option value="1rem">Yuvarlak (1rem)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="card p-6">
        <h2 className="font-bold text-lg mb-4">Ana Sayfa Hero Bölümü</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Hero Başlık</label>
            <input name="heroTitle" className="input" defaultValue={settings.heroTitle ?? ""} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Hero Alt Başlık</label>
            <input name="heroSubtitle" className="input" defaultValue={settings.heroSubtitle ?? ""} />
          </div>
          <div>
            <label className="label">Hero Görsel URL</label>
            <input name="heroImageUrl" className="input" defaultValue={settings.heroImageUrl ?? ""} />
          </div>
          <div>
            <label className="label">CTA Buton Metni</label>
            <input name="heroCtaText" className="input" defaultValue={settings.heroCtaText ?? ""} />
          </div>
        </div>
      </section>

      {/* Logo & Footer */}
      <section className="card p-6">
        <h2 className="font-bold text-lg mb-4">Logo & Footer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Logo URL</label>
            <input name="logoUrl" className="input" defaultValue={settings.logoUrl ?? ""} />
          </div>
          <div>
            <label className="label">Favicon URL</label>
            <input name="faviconUrl" className="input" defaultValue={settings.faviconUrl ?? ""} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Footer Metni</label>
            <input name="footerText" className="input" defaultValue={settings.footerText ?? ""} />
          </div>
        </div>
      </section>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Kaydediliyor..." : "Tasarımı Kaydet"}
      </button>
    </form>
  );
}
