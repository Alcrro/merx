# API — `apps/api`

Backend monolitic modular pentru Merx. Expune două suprafețe REST:
- `/api/v1/*` — rute autentificate (JWT), folosite de dashboard
- `/api/v1/storefront/*` — rute publice, folosite de storefront

**Port dev:** `3001`

---

## Tech stack

| Tehnologie | Rol |
|---|---|
| Node.js 20 + TypeScript | Runtime |
| Express | HTTP server |
| Prisma ORM | Acces DB + migrations |
| Zod | Validare request/response |
| PostgreSQL (Neon) | Baza de date principală |
| Redis + BullMQ (Upstash) | Queue jobs + cache BI |
| OpenAI GPT-4o | LLM via `packages/llm-provider` |
| Stripe | Plăți + Connect (marketplace escrow) |
| Supabase Storage (S3) | Upload imagini (bucket `merx`) |

---

## Comenzi

```bash
cd apps/api

npm run dev          # tsx watch — hot reload
npm run build        # tsc → dist/
npm run type-check   # tsc --noEmit

npm run db:generate  # prisma generate (după modificări schema)
npm run db:migrate   # prisma migrate dev (creare migrație)
npm run db:push      # prisma db push (sync fără migrație, dev only)
npm run db:studio    # Prisma Studio UI pe http://localhost:5555
```

---

## Arhitectura modulară (DDD)

Fiecare domeniu de business este un modul independent cu **4 layere obligatorii:**

```
src/modules/{domain}/
├── domain/          → entități, value objects, interface Repository
├── application/     → use cases (business logic)
├── infrastructure/  → implementare Repository, queries SQL
└── presentation/    → route handlers, DTOs, validare Zod
```

**Reguli de boundary:**
- Business logic stă **exclusiv** în `application/` — niciodată în route handlers
- Route handlers validează input (Zod) și apelează application service — nimic altceva
- Nu importa din `infrastructure/` al altui modul — comunică prin `application/` services
- `shared/` este singurul cod cross-module (db, redis, auth, errors)

### Module existente

| Modul | Descriere |
|---|---|
| `auth` | JWT access/refresh, bcrypt, multi-store |
| `stores` | CRUD magazin, settings (currency, locale, timezone) |
| `products` | Produse proprii, variante, prețuri, SKU, categorii, imagini |
| `inventory` | Stoc InventoryItem (owned) + StoreVariantStock (marketplace), notificări |
| `orders` | Comenzi, statusuri, fulfillment, Stripe checkout |
| `customers` | Profile clienți, istoric comenzi, analytics per client |
| `analytics` | Overview, revenue chart, top products, recalculate |
| `discounts` | Coduri promo, calculator, validare storefront |
| `notifications` | Notificări in-app per store (13 tipuri, polling, markRead) |
| `ai` | AI Gateway, Context Engine, Tool Registry, Insights, SSE stream |
| `ai-tool-criteria` | Criterii custom per tool AI (admin only) |
| `marketplace` | Listings B2B, earnings preview, quota per vendor |
| `payments` | Stripe Connect onboarding, escrow, refund, webhooks |
| `catalog` | Catalog marketplace, moderare, AI generator, archive criteria |
| `product-requests` | Cereri adăugare produse noi în catalog, aprobare admin |
| `storefront` | API public: produse, categorii, checkout, theme, discount validate |
| `storefront-theme` | Draft/publish/rollback temă vizuală, validare WCAG contrast |

---

## AI Domain — detalii

```
src/modules/ai/
├── domain/
│   ├── AIAction.ts     → entitate acțiune (PROPOSED → APPROVED → COMPLETED)
│   ├── AISession.ts    → sesiune conversație per merchant
│   └── AIInsight.ts    → insight generat de background jobs
├── application/
│   └── agent.service.ts → ProcessMessage, ExecuteTool, streaming SSE
├── infrastructure/
│   ├── tool-registry.ts → lista tool-urilor disponibile + risk level
│   └── tools/           → implementări individuale (read-only acum)
└── presentation/
    └── ai.controller.ts
```

**Permission system:** `READ | LOW_RISK | MEDIUM_RISK | HIGH_RISK` per tool. LOW = auto-execuție. MEDIUM/HIGH = `AIAction(PROPOSED)` → merchant aprobă → executor.

**Tool registry actual:** exclusiv read tools (`get_analytics_overview`, `get_top_products`, `get_inventory_status`, `get_recent_orders`, `get_order_details`, `get_customer_summary`). Mutation tools — în plan Tier 2.

---

## Environment variables

```bash
# Database
DATABASE_URL=
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# LLM
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096

# App
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
DASHBOARD_URL=http://localhost:3000
STOREFRONT_URL=http://localhost:3002

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Monitoring
SENTRY_DSN=
```

---

## Status MVP

**Verdict:** Basic+ (~78%). Tier 0 rezolvat; blocantele rămase sunt Tier 1+.

| Tier | Feature | Status |
|---|---|---|
| 0 | Email order confirmation (Resend) | ✅ `src/modules/email/` — fire-and-forget, skip dacă `RESEND_API_KEY` lipsă |
| 0 | Product images (owned products) | ✅ upload/delete/reorder pe `/products/:id/images` (Supabase Storage) |
| 0 | Refunds | ✅ `POST /orders/:id/refund` — Stripe refund via session→payment_intent, partial/total |
| 0 | Shipping/Tax settings | ✅ `settings.shipping` + `settings.tax` în Store JSON; merge în service |
| 1 | Shipping/Tax engine la checkout | ❌ câmpuri există în schema, calcul la checkout lipsă |
| 1 | Storefront search | ❌ fără ILIKE sau FTS în storefront module |
| 1 | Inventory notificări manuale | ✅ STOCK_IN/STOCK_REMOVAL/STOCK_ADJUSTMENT cu lastMovementType |
| 1 | Inventory notificări automate | ❌ STOCK_LOW/STOCK_OUT neconectate la fulfillment (release() lipsă) |
| 2 | AI mutation tools | ❌ tool registry exclusiv read tools |
| 2 | Abandoned cart job | ❌ BullMQ instalat, job lipsă |
| 2 | Merchant webhooks | ❌ lipsă complet |
