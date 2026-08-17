# WWW — `apps/www`

Next.js — site-ul de marketing al Merx. Audiența: merchants potențiali și investitori. CTA-urile duc la `apps/dashboard` (signup/login). Nu are niciun apel la API.

**Port dev:** `3003`

---

## Tech stack

| Tehnologie | Rol |
|---|---|
| Next.js 15 + TypeScript | Framework (App Router) |
| React 19 | UI |
| Tailwind CSS | Styling |
| next-themes | Dark mode |

---

## Comenzi

```bash
cd apps/www

npm run dev          # Next.js dev pe port 3003
npm run build        # next build
npm run start        # next start --port 3003
npm run type-check   # tsc --noEmit
npm run lint         # next lint
```

---

## Pagini existente

```
app/
├── layout.tsx        → root layout (Navbar, next-themes ThemeProvider)
├── page.tsx          → Home — hero + 4 feature sections (AI Agent, Analytics, Inventory, Storefront)
├── pricing/
│   └── page.tsx      → Pricing — 4 planuri în grid, comparison features, FAQ accordion
└── marketplace/
    └── page.tsx      → Marketplace B2B — how it works, stats, feature cards
```

---

## Config

`src/config/pricing.config.ts` — definițiile planurilor (Free / Starter / Pro / Enterprise): features, prețuri, badge-uri. Importat în pagina Pricing — **modifică planurile doar din config, nu direct în pagina**.

---

## Variabile de environment

```bash
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000   # URL dashboard pentru CTA-uri
```

CTA-urile (butoane „Încearcă gratis", „Start free") citesc `NEXT_PUBLIC_DASHBOARD_URL` și duc la `/signup`.

---

## Convenții

- Conținut static — fără `fetch` sau server actions
- Dark mode via `next-themes` + clase Tailwind (`dark:`)
- Orice secțiune nouă de marketing merge în `page.tsx` ca component local sau în `src/components/sections/`
- Nu adăuga dependențe de UI library fără motiv solid — pagini de marketing nu au nevoie de Radix/Shadcn

---

## Status MVP

**Verdict:** Alpha+ (~55%).

| Feature | Status |
|---|---|
| CTA conectat la dashboard/signup | ✅ |
| Feature sections pe Home (4 categorii cu vizuale) | ✅ |
| Pricing page (4 planuri, comparison, FAQ) | ✅ |
| Marketplace page (how it works, stats, features) | ✅ |
| Footer | ❌ lipsă complet |
| Privacy Policy + Terms (GDPR obligatoriu) | ❌ lipsă |
| Social proof (testimoniale, user count) | ❌ lipsă |
| SEO meta tags (`og:image`, description) | ❌ neimplementat |
