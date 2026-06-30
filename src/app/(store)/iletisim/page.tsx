import { getSiteSettings } from "@/lib/site-settings";
import { ContactForm } from "@/components/store/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">İletişim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <ContactForm />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">İletişim Bilgileri</h2>
            <ul className="space-y-4">
              {settings.contactEmail && (
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">E-posta</p>
                    <a href={`mailto:${settings.contactEmail}`} className="text-brand hover:underline">
                      {settings.contactEmail}
                    </a>
                  </div>
                </li>
              )}
              {settings.contactPhone && (
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Telefon</p>
                    <a href={`tel:${settings.contactPhone}`} className="text-brand hover:underline">
                      {settings.contactPhone}
                    </a>
                  </div>
                </li>
              )}
              {settings.contactAddress && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Adres</p>
                    <p className="text-gray-600 text-sm">{settings.contactAddress}</p>
                  </div>
                </li>
              )}
              {settings.workingHours && (
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Çalışma Saatleri</p>
                    <p className="text-gray-600 text-sm">{settings.workingHours}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
