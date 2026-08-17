# Storefront — `apps/storefront`

Next.js App Router — magazinul public al unui merchant Merx. Fiecare merchant are propriul subdomain `{slug}.merx.com`. Slug-ul e citit din hostname la boot via middleware, fără auth — toate requesturile sunt publice.

**Port dev:** `3002`

---

## Tech stack

| Tehnologie | Rol |
|---|---|
| Next.js 15 + TypeScript | Framework (App Router) |
| React 18 | UI |
| Tailwind CSS | Styling |
| `fetch` nativ | HTTP calls către API (`/api/v1/storefront/*`) |

Nu are TanStack Query sau Axios — folosește `fetch` + React Server Components unde e posibil.

---

## Comenzi

```bash
cd apps/storefront

npm run dev          # Next.js dev pe port 3002
npm run build        # next build
npm run start        # next start --port 3002 (producție)
npm run type-check   # tsc --noEmit
npm run lint         # next lint
```

---

## Routing

Structura `app/` urmează Next.js App Router:

```
app/
├── layout.tsx            → root layout (StorefrontHeader, StoreContext, CartContext)
├── not-found.tsx         → 404 custom
├── page.tsx              → Home (hero + new arrivals grid)
├── products/
│   ├── page.tsx          → Products listing (CategoryFilter, Pagination, ProductGrid)
│   └── [productId]/
│       └── page.tsx      → Product detail (variant selector, stock, related products)
│                           → generateMetadata() cu schema.org JSON-LD
├── cart/
│   └── page.tsx          → Cart (item list, subtotal, empty state)
├── checkout/
│   └── page.tsx          → Checkout form (discount code input, Stripe redirect)
└── order-confirmation/
    └── page.tsx          → Confirmare comandă post-Stripe
```

---

## Context

```
src/context/
├── StoreContext.tsx   → date magazin (slug, name, currency) — încărcate la boot din hostname
└── CartContext.tsx    → coș cumpărături (adaugă, elimină, cantitate, total)
```

---

## Middleware

`middleware.ts` — citește `host` header, extrage slug-ul (`{slug}.merx.com`), îl injectează în request headers pentru RSC și layout.

---

## Convenții

- Server Components unde datele nu depind de interacțiune client
- Client Components (`'use client'`) **doar** unde e nevoie de state / event handlers (variant selector, cart actions, checkout form)
- `generateMetadata()` pe fiecare pagină cu conținut variabil (product detail, products listing)
- API calls direct din Server Components via `fetch` cu `cache: 'no-store'` unde datele trebuie fresh

---

## Status MVP

**Verdict:** Basic+ (~70%). Fluxul complet funcționează (browse → cart → checkout → confirmare).

| Feature | Status |
|---|---|
| 404 page, empty state cart, footer | ✅ |
| SEO meta + schema.org JSON-LD pe product detail | ✅ |
| Discount code la checkout | ✅ |
| Shipping display real (cost din store settings) | ❌ afișat „calculat de Stripe", nu suma reală |
| Tax display la checkout | ❌ lipsă |
| Empty state products listing (categorie goală) | ❌ lipsă |
| Search bar | ❌ lipsă |
| Order tracking page `/orders/[orderId]` | ❌ lipsă |
| Product images | ❌ depinde de API product images endpoint |
| Loading skeletons generalizate | ❌ skeleton pe products page, dar nu component generic |
