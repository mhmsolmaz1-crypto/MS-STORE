"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Mesaj gönderilemedi");
        return;
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card p-6 text-center">
        <div className="text-green-500 text-4xl mb-2">✓</div>
        <h3 className="font-bold">Mesajınız Gönderildi</h3>
        <p className="text-sm text-gray-600 mt-1">En kısa sürede size dönüş yapacağız.</p>
        <button onClick={() => setSuccess(false)} className="text-brand text-sm mt-4 hover:underline">
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Ad Soyad *</label>
          <input name="name" className="input" required />
        </div>
        <div>
          <label className="label">E-posta *</label>
          <input name="email" type="email" className="input" required />
        </div>
      </div>
      <div>
        <label className="label">Telefon</label>
        <input name="phone" type="tel" className="input" />
      </div>
      <div>
        <label className="label">Konu</label>
        <input name="subject" className="input" />
      </div>
      <div>
        <label className="label">Mesaj *</label>
        <textarea name="message" className="input" rows={5} required />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        <Send className="h-4 w-4" />
        {loading ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}
