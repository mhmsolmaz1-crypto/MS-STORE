# Pro E-Commerce — Profesyonel E-Ticaret Platformu

Tam kapsamlı, iki katmanlı (vitrin + yönetim paneli) e-ticaret sistemi.

## Mimari: Neden İki Ayrı Dünya?

Profesyonel e-ticaret siteleri **asla** ürünleri koda gömülü eklemez. İki ayrı sistem vardır:

```
┌─────────────────────────────────────────────────────────────┐
│                    MÜŞTERİ VİTRİNİ (Storefront)              │
│  Ana sayfa · Ürünler · Sepet · Ödeme · Sipariş onayı        │
│  Herkes görebilir — tasarım panelden yönetilir              │
└──────────────────────────┬──────────────────────────────────┘
                           │ API
┌──────────────────────────▼──────────────────────────────────┐
│                    YÖNETİM PANELİ (Admin)                      │
│  Dashboard · Siparişler · Ciro · Ürünler · e-Fatura · Tasarım │
│  SADECE SİZ görebilir — JWT ile korunur                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    VERİTABANI (Prisma + SQLite/PostgreSQL)   │
│  Ürünler · Siparişler · Müşteriler · Faturalar · Ayarlar    │
└─────────────────────────────────────────────────────────────┘
```

### Ödeme Akışı

1. Müşteri sepete ürün ekler
2. Ödeme sayfasında iletişim + fatura bilgilerini girer
3. iyzico / Stripe / Havale / Kapıda ödeme seçer
4. Online ödemede sağlayıcıya yönlendirilir
5. Ödeme onaylanınca **otomatik e-Fatura/e-Arşiv** kesilir
6. Siz panelden siparişi görür, kargoya verirsiniz

## Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

```bash
# 1. Proje klasörüne git
cd C:\Users\mhmso\Projects\pro-ecommerce

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
copy .env.example .env

# 4. Veritabanını oluştur
npx prisma db push

# 5. Örnek verileri yükle (admin + ürünler)
npm run db:seed

# 6. Geliştirme sunucusunu başlat
npm run dev
```

### Erişim

| Adres | Açıklama |
|-------|----------|
| http://localhost:3000 | Mağaza (müşteri vitrini) |
| http://localhost:3000/admin | Yönetim paneli |
| http://localhost:3000/admin/login | Admin giriş |

**Varsayılan admin:** `admin@magazam.com` / `Admin123!`

## Yönetim Paneli Özellikleri

| Modül | Ne yaparsınız? |
|-------|----------------|
| **Dashboard** | Kaç sipariş geldi/gitti, bugünkü ciro, düşük stok uyarıları |
| **Siparişler** | Tüm siparişler, durum güncelleme (hazırla → kargola → teslim) |
| **Ürünler** | Kod yazmadan ürün ekle/düzenle, stok yönet |
| **Ciro Raporu** | 30 günlük grafik, ürün bazlı ciro tablosu |
| **e-Faturalar** | Otomatik kesilen faturalar, ETTN takibi |
| **Tasarım** | Renkler, fontlar, hero, logo — kod yok |
| **Site Ayarları** | İletişim, kargo, KDV, e-Fatura şirket bilgileri |
| **Mesajlar** | İletişim formundan gelen mesajlar |
| **Müşteriler** | Tüm müşteri listesi ve sipariş geçmişi |

## Ödeme Entegrasyonları

### iyzico (Türkiye — önerilen)

`.env` dosyasına ekleyin:
```
IYZICO_API_KEY=sandbox-xxx
IYZICO_SECRET_KEY=sandbox-xxx
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### Stripe (Uluslararası)

```
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## e-Fatura / e-Arşiv

Ödeme onaylandığında otomatik fatura kesilir:

- **Bireysel müşteri** → e-Arşiv (TC Kimlik veya e-posta yeterli)
- **Kurumsal müşteri** → e-Fatura (VKN + Vergi Dairesi zorunlu)

Entegratör yapılandırması (Paraşüt örneği):
```
EFATURA_PROVIDER=parasut
EFATURA_API_KEY=xxx
EFATURA_COMPANY_ID=xxx
EFATURA_TEST_MODE=true
```

Test modunda faturalar simüle edilir, gerçek GİB gönderimi yapılmaz.

## Proje Yapısı

```
src/
├── app/
│   ├── (store)/          # Müşteri vitrini
│   │   ├── page.tsx      # Ana sayfa
│   │   ├── urunler/      # Ürün listesi
│   │   ├── urun/[slug]/  # Ürün detay
│   │   ├── sepet/        # Sepet
│   │   ├── odeme/        # Ödeme
│   │   └── iletisim/     # İletişim
│   ├── admin/            # Yönetim paneli (korumalı)
│   └── api/              # Backend API
├── components/
│   ├── store/            # Vitrin bileşenleri
│   └── admin/            # Panel bileşenleri
└── lib/
    ├── auth.ts           # Admin oturum yönetimi
    ├── cart.ts           # Sepet servisi
    ├── orders/           # Sipariş servisi
    ├── payments/         # iyzico + Stripe
    ├── invoices/         # e-Fatura servisi
    └── analytics/        # Dashboard istatistikleri
```

## Üretime Alma

1. `DATABASE_URL` → PostgreSQL bağlantısı
2. `JWT_SECRET` → Güçlü rastgele değer (min 32 karakter)
3. `ADMIN_PASSWORD` → Güçlü şifre
4. iyzico canlı API anahtarları
5. e-Fatura entegratör canlı modu
6. `npm run build && npm start`

## Lisans

MIT — Ticari kullanıma uygundur.
