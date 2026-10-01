# Merx

> "Tell us what you sell. We'll run the store."

**Categorie: Agentic Commerce.**

Merx nu este o platformă de e-commerce. Este un **commerce operator** — AI-ul conduce magazinul, merchantul dă direcția. Nu un chatbot peste un dashboard, ci un agent care analizează businessul, propune acțiuni și le poate executa cu aprobare.

**Poziționare:**
```
Shopify:  Merchant → Tools → Business   (tu operezi)
Merx:     Merchant → AI Agent → Business (AI operează)
```

Merchantul mic nu vrea să înțeleagă analytics, CRO, inventory management. Vrea să întrebe *"de ce au scăzut vânzările?"* și să primească un răspuns acționabil — sau să aprobe o acțiune pe care AI-ul a generat-o deja.

**Nu e "Shopify mai bun".** Shopify dă unelte. Merx ia decizii.

---

## Problema rezolvată

Merchantul mic petrece prea mult timp operând manual un business de ecommerce — analizând date, luând decizii repetitive, gestionând stocuri. Instrumentele existente (Shopify, WooCommerce) oferă tool-uri, nu decizii.

**ICP:** Small ecommerce businesses, 10–1.000 produse, 1–3 persoane, cunoștințe tehnice și de marketing limitate.

---

## Faze de dezvoltare

| Fază | Descriere | Status |
|---|---|---|
| Phase 1 — AI înțelege businessul | Commerce de bază + AI conversațional read-only | În progres |
| Phase 2 — AI operează businessul | Mutation tools + approval workflow + audit log | Planificat |
| Phase 3 — AI detectează proactiv | Insight Engine: anomalii, investigare automată, recomandări | Planificat |
| Phase 4 — Integrări externe | Meta Ads, Google Ads, email providers, shipping providers | Planificat |

---

## Arhitectura sistemului

```
       MERCHANT                          CUSTOMER
          │                                 │
          ▼                                 ▼
┌──────────────────────┐       ┌────────────────────────┐
│    Dashboard SPA     │       │    Storefront (Next.js) │
│  React + Vite        │       │  {slug}.merx.com        │
│  Vercel (CDN)        │       │  Vercel                 │
└──────────┬───────────┘       └────────────┬───────────┘
           │ REST /api/v1/                  │ REST /api/v1/storefront/
           │ (JWT required)                 │ (public, no auth)
           └────────────────┬───────────────┘
                            ▼
              ┌────────────────────────┐
              │   API — Node.js/Express│
              │   Auth Middleware      │
              │   Fly.io               │
              └────────┬───────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  Commerce         Analytics       AI Domain
  Domain           Domain          ├── Context Engine
  ├── stores       read models     ├── Tool Registry
  ├── products     daily metrics   ├── Tool Executor
  ├── orders       insights        ├── Permission System
  ├── inventory                    └── Approval Workflow
  └── customers
                       │
              PostgreSQL (Supabase)
              Redis + BullMQ (Upstash)
```

### Flux AI Agent

```
Merchant trimite mesaj
  → Context Builder (store summary, metrici 30d, top products)
  → LLM (OpenAI GPT-4o) cu tool definitions
  → Tool Selection → Permission Check
       ├── READ / LOW_RISK   → execuție automată
       ├── MEDIUM / HIGH     → AIAction(PROPOSED) → merchant aprobă → executor
       └── FORBIDDEN         → refuz explicit
  → Audit Log (before/after state)
  → Răspuns cu explicație
```

**Boundary critic:** AI-ul nu accesează niciodată direct DB-ul — `LLM → Tool → Application Service → Repository → SQL`.

---

## Monorepo

```
apps/
  api/          — Node.js + Express — backend (port 3001)
  dashboard/    — React SPA (Vite) — interfața merchant (port 3000)
  storefront/   — Next.js App Router — magazinul public (port 3002)
  www/          — Next.js — site marketing (port 3003)
packages/
  types/        — TypeScript types shared între apps
  api-client/   — HTTP client typed pentru dashboard
  llm-provider/ — LLMProvider interface + implementare OpenAI
```

Fiecare app are propriul `README.md` cu detalii de stack, comenzi și convenții.

---

## Structura backend — DDD pe module

Fiecare domeniu de business urmează 4 layere obligatorii:

```
src/modules/{domain}/
├── domain/          → entități, value objects, interface Repository
├── application/     → use cases (business logic)
├── infrastructure/  → implementare Repository, queries SQL
└── presentation/    → route handlers, DTOs, validare Zod
```

Module existente: `auth`, `stores`, `products`, `inventory`, `orders`, `customers`, `analytics`, `discounts`, `notifications`, `ai`, `ai-tool-criteria`, `marketplace`, `payments`, `catalog`, `product-requests`, `storefront`, `storefront-theme`.

---

## Structura frontend — Atomic Design

```
src/components/
├── ui/          → Primitive (Button, Input, Badge — Shadcn)
├── atoms/       → Componente simple, fără business logic
├── molecules/   → Combinații de atoms cu logică simplă
├── organisms/   → Componente complexe cu hooks proprii
└── templates/   → Layout-uri de pagini
```

- `organisms/` au hooks proprii — `molecules/` și `atoms/` sunt pure/dumb
- `pages/` orchestrează, nu conțin logică proprie
- TanStack Query pentru orice date server-side — niciodată `useState + useEffect` pentru fetch

---

## Setup local

```bash
# 1. Instalează dependențele
npm install

# 2. Configurează environment
cp .env.example .env
# Completează: DATABASE_URL, REDIS_URL, JWT_SECRET, OPENAI_API_KEY, STRIPE_*

# 3. Rulează migrations
cd apps/api && npx prisma migrate dev && cd ../..

# 4. Pornește toate serviciile (Turborepo)
npm run dev
```

| App | URL |
|---|---|
| Dashboard (merchant) | http://localhost:3000 |
| API | http://localhost:3001 |
| Storefront | http://localhost:3002 |
| WWW (marketing) | http://localhost:3003 |

```bash
npm run build        # build toate apps
npm run type-check   # tsc --noEmit pe tot monorepo
npm run lint         # eslint pe tot
```

---

## Hosting & Infrastructure

| Componentă | Service |
|---|---|
| Dashboard + Storefront + WWW | Vercel (CDN global, preview URLs automate) |
| API (Node.js) | Fly.io (persistent server, SSE/WebSockets) |
| Database | Supabase — PostgreSQL managed, backups automate |
| Redis | Upstash — serverless, BullMQ compatible |
| LLM | OpenAI API (GPT-4o) |
| Monitoring | Sentry (errors + performance) |
| CI/CD | GitHub Actions → Vercel + flyctl |

**Branch strategy:** `main` → producție · `dev` → staging · feature branches → preview URLs Vercel.

---

## Tech stack

| Nivel | Tehnologie |
|---|---|
| Dashboard frontend | React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, Recharts, Zustand |
| Storefront / WWW | Next.js 15, TypeScript, Tailwind CSS |
| API backend | Node.js, TypeScript, Express, Prisma ORM, Zod |
| Database | PostgreSQL (Supabase), Redis (Upstash) |
| AI | OpenAI GPT-4o via `packages/llm-provider` abstraction |
| Payments | Stripe Connect (escrow, webhooks) |
| Hosting | Vercel (frontend) + Fly.io (API) + Supabase (DB) |

---

## Status MVP

| App | Verdict | Blocante principale |
|---|---|---|
| API | Basic+ (~78%) | Shipping/tax engine la checkout, storefront search, inventory auto-notificări |
| Dashboard | Intermediate (~85%) | Search server-side, bulk actions, AI write actions UI |
| Storefront | Basic+ (~70%) | Shipping/tax display la checkout, search, order tracking |
| WWW | Alpha+ (~55%) | Footer, Privacy/Terms (GDPR), social proof, SEO meta |

**Tier 0 rezolvat:** email order confirmation, image upload, refund modal, shipping/tax settings. Următorul focus: Tier 1 (shipping/tax engine la checkout, search).
