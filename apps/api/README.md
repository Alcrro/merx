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
| PostgreSQL (Supabase) | Baza de date principală |
| Redis + BullMQ (Upstash) | Queue jobs + cache BI |
| OpenAI GPT-4o | LLM via `packages/llm-provider` |
| Stripe | Plăți + Connect (marketplace escrow) |
| AWS S3 SDK | Upload imagini (Cloudflare R2 compatible) |

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
| `products` | Produse, variante, prețuri, SKU, categorii |
| `inventory` | Stoc, ajustări, reorder points, mișcări |
| `orders` | Comenzi, statusuri, fulfillment, Stripe checkout |
| `customers` | Profile clienți, istoric comenzi, RFM calculator |
| `analytics` | Read models, daily metrics (store/product/customer), BullMQ jobs |
| `discounts` | Coduri promo, calculator, rezervări, release-orphans job |
| `ai` | AI Gateway, Context Engine, Tool Registry, Approval Workflow |
| `marketplace` | Listings B2B, matches, escrow, quota |
| `payments` | Stripe Connect onboarding, webhooks, escrow release |
| `catalog` | Catalog marketplace, moderare, AI generator, clasificare |
| `storefront` | API public pentru produse, variante, checkout |

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

**Verdict:** Basic+ (~70%). Fundație solidă, dar niciun Tier 0 gap nu e rezolvat.

| Tier | Feature | Status |
|---|---|---|
| 0 | Email notifications (Resend) | ❌ lipsă — zero modul |
| 0 | Product images (upload + CDN) | ❌ lipsă — fără multer, R2, tabel ProductImage |
| 1 | Shipping module | ❌ câmp `shippingTotal` există în schema, logica nu |
| 1 | Tax engine | ❌ câmp `taxTotal` există în schema, logica nu |
| 1 | Storefront search | ❌ fără ILIKE sau FTS |
| 1 | Refunds | ❌ endpoint lipsă; enum `refunded` există în schema |
| 2 | AI mutation tools | ❌ tool registry are exclusiv read tools |
| 2 | Abandoned cart job | ❌ BullMQ instalat, job lipsă |
| 2 | Merchant webhooks | ❌ lipsă complet |
