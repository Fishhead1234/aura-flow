# Aura Flow — Boutique Fitness & Workshop Booking Engine

A mobile-first, high-conversion booking engine and studio management platform designed for independent fitness coaches, yoga instructors, and boutique studios (1–2 rooms / reformer setups).

## 🌟 Value Proposition
1. **$29.00/month flat subscription** with 0% platform transaction take-rate.
2. **Direct-to-instructor payouts** via Stripe Connect (supporting Apple Pay & card rails).
3. **Class-pack credit auto-decrementing** (e.g. 5-pack, 10-pack bundles).
4. **Automated 30-minute single-spot waitlist waterfall** to guarantee 100% fill rates (Standard Free Queue vs. VIP $0 Pre-auth Hold).
5. **First-class internationalization (i18n)** supporting English (`en`), Traditional Chinese (`zh-TW`), Simplified Chinese (`zh-CN`), and Japanese (`ja`), built with an extensible schema for future languages.

---

## 🚀 Getting Started

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### Production Build
```bash
npm run build
```

---

## 📂 Project Structure
```
aura-flow/
├── prisma/
│   └── schema.prisma         # PostgreSQL schema (Studio, Sessions, Packs, Bookings, Waitlist, Ledger)
├── supabase/
│   └── schema.sql            # SQL schema with atomic book_class_spot() and SELECT FOR UPDATE
├── src/
│   ├── components/
│   │   ├── Navbar.tsx        # Brand navigation, language & currency selector, pass wallet pill
│   │   ├── ClientScheduleView.tsx # Client mobile schedule (linen palette, horizontal date strip)
│   │   ├── BookingDrawer.tsx # Native <dialog> bottom sheet (Pass credit vs Pay, 0% fee ledger)
│   │   ├── WaitlistModal.tsx # Standard vs VIP Pre-auth waitlist modal
│   │   └── AdminPortal.tsx   # Dark luxury bronze tablet dashboard (Stripe Direct Payouts, meters)
│   ├── i18n/
│   │   └── auraI18n.ts       # Type-safe i18n with native Intl formatters
│   ├── locales/              # en, zh-TW, zh-CN, ja locale files
│   ├── store/
│   │   └── auraStore.ts      # Zustand state store with waitlist waterfall engine
│   ├── types/
│   │   └── aura.ts           # Domain models
│   ├── App.tsx               # Root app with Client/Admin view modes
│   └── index.css             # Tailwind CSS & pure CSS scroll containment
├── vercel.json               # Vercel deployment & SPA routing config
└── README.md
```

---

## ☁️ Deploying to Vercel

### Option 1: Via Vercel CLI
```bash
npx vercel
```
Follow the interactive prompts to link or deploy to your Vercel account.

### Option 2: Via GitHub + Vercel Dashboard
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/Fishhead1234/aura-flow.git
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new), select your `aura-flow` repository, and click **Deploy**. Vercel will auto-detect Vite and use `vercel.json` for routing.

