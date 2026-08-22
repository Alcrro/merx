# Dashboard — `apps/dashboard`

React SPA — interfața principală a merchantului. Nu are business logic propriu — totul trece prin API. Comunică cu `apps/api` via REST + SSE pentru AI streaming.

**Port dev:** `3000`

---

## Tech stack

| Tehnologie | Rol |
|---|---|
| React 18 + TypeScript | UI |
| Vite | Build tool + dev server |
| TanStack Query v5 | Server state (fetch, cache, mutations) |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Recharts | Grafice (revenue, analytics) |
| Zustand | Client state (auth, store context) |
| Axios | HTTP client cu interceptori JWT |
| `@measured/puck` | Page builder (theme builder feature) |
| `react-markdown` | Render mesaje AI |

---

## Comenzi

```bash
cd apps/dashboard

npm run dev          # Vite dev server pe port 3000
npm run build        # tsc + vite build → dist/
npm run type-check   # tsc --noEmit
npm run lint         # eslint
```

---

## Structura paginilor

```
src/pages/
├── auth/            → Login, Signup
├── dashboard/       → Overview (revenue, AI insights, low stock alerts)
├── products/        → List, Detail, New, Edit, Variants
├── inventory/       → StoreVariantStock: mode selector (Default/Fizic/Ambele), StockUpdateModal, status toggle
├── orders/          → List, Detail (cu discount display)
├── customers/       → List, Detail (RFM segment, spend chart, top products)
├── analytics/       → Metrici zilnice, trend-uri
├── ai/              → AI Chat (sessions, streaming, suggested actions)
├── discounts/       → List, Create form
├── marketplace/     → Feed, Listings, Stripe Connect onboarding
├── admin/           → Catalog marketplace, moderare, AI criteria
└── settings/        → Store settings (currency, locale, timezone)
```

---

## Arhitectura componentelor — Atomic Design

```
src/components/
├── ui/              → Primitive Shadcn (Button, Input, Badge, Dialog...)
├── atoms/           → Componente simple fără business logic
├── molecules/       → Combinații de atoms cu logică simplă
├── organisms/       → Componente complexe cu hooks proprii
└── templates/       → Layout-uri de pagini
```

**Reguli:**
- **`atoms/` și `molecules/`** sunt pure/dumb — primesc date prin props
- **`organisms/`** au hooks proprii (`useProducts`, `useOrders` etc.) — nu fetch direct în JSX
- **`pages/`** orchestrează organisms — nu conțin logică proprie
- **TanStack Query** pentru orice date server-side — niciodată `useState + useEffect` pentru fetch

---

## Hooks principale

```
src/hooks/
├── useAuth.ts           → login, logout, token refresh
├── useStore.ts          → store context curent (id, name, settings)
├── useAIChat.ts         → SSE streaming, session management, tool call handling
├── useNotifications.ts  → polling 30s, markRead, markAllRead (wraps Zustand store)
└── use{Domain}.ts       → câte un hook per domeniu (useProducts, useOrders, useInventory etc.)
```

---

## Convenții de cod

- Logica de business stă în hooks, nu în componente
- Componentele de tip `organism` au propriul hook — nu fetch direct
- `api.ts` — instanță Axios cu interceptori pentru JWT attach + refresh automat
- Feature flags în `config/features.ts` pentru funcționalități în lucru

---

## Status MVP

**Verdict:** Intermediate (~85%). Tier 0 rezolvat; pagini core complete.

| Tier | Feature | Status |
|---|---|---|
| 0 | Product image upload UI | ✅ `ImageUploader` wired în `ProductDetailPage` (upload/delete/drag) |
| 0 | Order refund modal | ✅ `RefundModal` în `OrderDetail` — radio full/parțial, validare, hook `useRefundOrder` |
| 0 | Shipping + Tax în StoreSettings | ✅ secțiune "Livrare & TVA" — cost fix, prag gratuit, rată TVA%, toggle inclus în preț |
| 1 | Inventory StoreVariantStock | ✅ mode selector, StockUpdateModal, MovementBadge, lastMovementType, notificări STOCK_IN/REMOVAL/ADJUSTMENT |
| 1 | Notificări in-app | ✅ bell + dropdown + pagină completă, polling 30s, resolveHref per tip |
| 1 | Search produse server-side | ⚠️ client-side pe titlu/SKU; la 100+ produse inutilizabil |
| 1 | Bulk actions produse | ❌ fără checkbox-uri sau dropdown acțiuni |
| 2 | ActionApprovalCard + ActionsPage | ❌ AI write actions UI lipsă complet |
