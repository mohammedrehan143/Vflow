# VFlow — Parking Spaces & EV Charging Marketplace

> **"Find parking. Charge your EV. Explore what's nearby."**

VFlow is a production-oriented, full-stack mobility web platform and installable Progressive Web App (PWA). It functions as an Airbnb-style marketplace for parking bays, commercial spaces, and high-speed EV charging infrastructure across India, complete with automated **next-day host payouts**, **Razorpay checkout**, **Leaflet map exploration**, and **nearby hangout discovery**.

---

## 🌟 Key Capabilities & Architectural Highlights

### 1. Dual Booking Marketplace (Parking + EV Charging)
- **Airbnb-Style Parking Reservations:** Real-time search, interactive map/list toggles, hourly/daily pricing, covered/uncovered status, and digital PIN barrier access codes.
- **EV Fast Charging Infrastructure:** Type 2 AC (3.3 – 22 kW), CCS-2 DC Fast (up to 150 kW), CHAdeMO, and 15A domestic wallbox reservation.
- **Shared Resource Concurrency Control:** Shared parking + charger bays cannot be double-booked simultaneously through atomic MongoDB validation.

### 2. Single Canonical Host Profile (Section 5)
- Every host maintains **one single canonical provider record** in the `providers` collection, regardless of whether they list 10 parking slots, 4 EV charging ports, or both.
- Provider dashboard presents real-time aggregate reporting:
  - Total parking bookings vs. completed EV charging sessions
  - Gross revenue, platform commission deductions, and net earnings
  - Pending next-day settlement queue and completed payout records.

### 3. Next-Day Host Settlement Engine (Section 9)
- **Business Rule:** `Customer pays → Booking completes → Earnings calculated → Queued for next-day payout → Payout disbursed → Host tracks settlement status`.
- **Integer Paise Arithmetic:** All financial transactions, commissions (10%), GST (18%), and net shares are calculated in integer paise to eliminate floating-point precision loss.
- **Cutoff Timing:** Daily cutoff at 18:30 UTC (00:00 IST midnight) ensures eligible earnings are transferred to verified host bank accounts (NEFT/IMPS) or UPI VPAs on the immediate next calendar day.
- Detailed date-wise financial ledger in `financialLedger` tracks each transaction with status transitions (`pending` → `eligible` → `paid`).

### 4. Razorpay Secure Payment & Verification (Section 10)
- Server-side order generation (`/api/v1/payments/create-order`).
- Cryptographic HMAC-SHA256 signature verification (`/api/v1/payments/verify`).
- Webhook signature validation and idempotent event processing (`/api/v1/webhooks/razorpay`).
- Zero card data storage on frontend or backend (PCI-DSS compliant).

### 5. Nearby Hangout Engine (Section 11)
- Discovers cafes, bakeries, restaurants, shopping malls, gaming arcades, and parks within walking distance of any parking bay or EV charger.
- Computes Haversine distance in meters, estimates walking minutes (at 4.5 km/h) and driving minutes (at 25 km/h), and generates direct Google Maps navigation links.

### 6. Valet Mobility — Strictly "Coming Soon" (Section 12)
- Prominently featured in navigation and landing pages with clear **Coming Soon** badges.
- Features an exclusive priority waitlist form with explicit user consent.
- **Zero fake drivers or pretended booking buttons** in compliance with MVP platform rules.

### 7. Installable Progressive Web App (PWA) (Section 16)
- Web App Manifest with emerald mobility theme (`#059669`).
- Service Worker registration with Workbox runtime caching for icons, fonts, and images.
- Custom browser install trigger and device-by-device installation guide for Android, iOS Safari, and Desktop Chrome/Edge.
- Dedicated branded offline fallback screen (`offline.html`).

---

## 🏗️ Monorepo Architecture

```
vflow/
├── apps/
│   ├── api/                     # Node.js + Express + TypeScript Backend
│   │   ├── src/
│   │   │   ├── config/          # Database, Razorpay, Supabase configs
│   │   │   ├── middleware/      # Auth JWT/Supabase & Error handlers
│   │   │   ├── models/          # Mongoose collections (Provider, Booking, Ledger...)
│   │   │   ├── routes/          # Versioned REST endpoints (/api/v1/*)
│   │   │   ├── scripts/         # Realistic demo database seeder
│   │   │   ├── services/        # Business logic (Settlement, Payment, Nearby...)
│   │   │   └── __tests__/       # Vitest automated test suite
│   │   └── vitest.config.ts
│   └── web/                     # React 18 + Vite + Tailwind CSS + PWA
│       ├── public/              # Favicon, PWA manifest, offline.html
│       ├── src/
│       │   ├── components/      # Navbar, Footer, ListingCard, Leaflet Map
│       │   ├── context/         # AuthContext & 1-click Demo Role Switcher
│       │   ├── pages/           # 25+ application pages & dashboards
│       │   └── services/        # Typed API client
│       └── vite.config.ts       # Vite PWA & Workbox configuration
├── packages/
│   └── shared/                  # Shared TypeScript types, Zod schemas & constants
├── .env.example                 # Environment configuration template
└── package.json                 # Monorepo workspaces configuration
```

---

## ⚡ Quick Start & Running Locally

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### 2. Install Dependencies
```bash
npm install
```

### 3. Build All Workspaces
```bash
npm run build
```

### 4. Run Automated Test Suite
```bash
npm run test
```

### 5. Start Development Servers
```bash
# Start both backend API (port 5000) and frontend Web (port 3000) concurrently:
npm run dev

# Or start individually:
npm run dev:api    # Express backend
npm run dev:web    # Vite React PWA
```

---

## 🧪 Evaluator & Demo Accounts

When visiting the app at `http://localhost:3000`, the top banner includes **1-Click Demo Role Switchers** to test all perspectives:

| Role | Demo Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Driver** | `driver@vflow.in` | `VFlow@123` | Search, map explore, reserve spaces, Razorpay checkout, access PIN pass, cancel with refunds |
| **Host** | `provider@vflow.in` | `VFlow@123` | Canonical host dashboard, resource breakdown, publish spaces, next-day payout settlement ledger |
| **Admin** | `admin@vflow.in` | `VFlow@123` | Master governance, provider KYC approvals/rejections, transaction metrics, audit logs |

---

## 🔒 Security & Data Integrity
- Passwords hashed with `bcryptjs`.
- JWT session tokens and Supabase Auth session validation.
- Razorpay HMAC-SHA256 signature verification.
- Sensitive credentials isolated to backend environment variables.
- Zero mock reviews, zero fake live chargers, and zero fake valet drivers.
>>>>>>> 444ba02 (feat(vflow): complete VFlow parking & EV charging full-stack platform with PWA, next-day settlements, and Razorpay)
