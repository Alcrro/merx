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

## Positioning & Messaging

Merx se încadrează în categoria **Agentic Commerce** — nu e-commerce platform, ci commerce operator.

**Frame de bază:**
- Shopify = platformă cu unelte. Tu operezi.
- Merx = AI care operează. Tu dai direcția.

**Tagline (neschimbat):** *"Tell us what you sell. We'll run the store."*

**Nu folosi în copy:** "Shopify mai bun", "alternativă la Shopify", "Shopify clone". Shopify apare doar ca referință de context, nu ca rival de features.

---

## TODO — www content (Agentic Commerce narrative)

### Hero
- [ ] Hero headline să conțină categoria: *"The first Agentic Commerce platform"* sau *"Your AI-powered store operator"*
- [ ] Sub-headline să explice modelul de operare, nu feature lista: *"Tell us what you sell. We'll run the store — inventory, orders, analytics, all of it."*
- [ ] Înlocuiește orice referință la "e-commerce platform" cu "commerce operator" sau "agentic commerce"

### Secțiune "How it works" (lipsă)
- [ ] 3 pași simpli: **1. Adaugi produsele → 2. AI analizează și operează → 3. Tu aprobi deciziile mari**
- [ ] Vizual: contrast direct Shopify model (tu faci totul) vs Merx model (AI face, tu aprobi)

### Secțiune "Why Merx" (poziționare explicită)
- [ ] Card: *"Shopify îți dă unelte. Merx îți dă un operator."*
- [ ] Card: *"Nu mai analiza dashboarduri. Primești decizii, nu date."*
- [ ] Card: *"AI cu permisiuni — tu decizi ce poate face agentul."*

### Social proof
- [ ] Testimoniale reale sau placeholdere realiste (merchant mic, 1-3 persoane, fără echipă de marketing)
- [ ] Stat: *"X merchants, Y produse gestionate automat"* (even if placeholder at launch)

### SEO & meta
- [ ] `og:title`: *"Merx — Agentic Commerce Platform"*
- [ ] `og:description`: *"Tell us what you sell. We'll run the store. AI-powered commerce operator for small merchants."*
- [ ] Keywords: agentic commerce, AI commerce operator, AI ecommerce, autonomous store management

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
