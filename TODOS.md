# Merx — TODOs

> Actualizat: 2026-09-01
> Un singur loc pentru tot. Organizat pe domenii, în ordinea în care contează.

---

## 🔴 Auth — Business Rules (în lucru)

- [ ] **Flux-cu-flux — continuare** → deschide `docs/domain/business-rules/auth/PROGRESS.md`
  - [ ] Flux 4 — Sesiune activă
  - [ ] Flux 5 — Logout
  - [ ] Flux 6 — Forgot password
  - [ ] Flux 7 — Admin access
- [ ] **Decide:** Platform token TTL — același 15 min ca store-scoped token sau mai scurt (tranzitoriu)?
- [ ] **Tech spec / RFC** auth — mapează regulile Tier 0 la ce trebuie schimbat în cod
- [ ] **Backend TODOs** derivate din tech spec

---

## 🔴 Auth — Implementare (buguri cunoscute)

- [ ] `refresh.use-case.ts` — aruncă `NOT_FOUND` dacă userul nu are store; trebuie refăcut să accepte slug
- [ ] `findStoreByOwnerId` folosește `findFirst` — incompatibil cu multi-store; înlocuiește cu lookup pe slug
- [ ] Roluri inconsistente — `role: 'owner' | 'member'` trebuie înlocuit cu `User.platformRole: 'admin' | 'user'`

---

## 🟡 Dashboard — AI Agent

- [ ] **Suggested prompts** în `AIChatPage` — grid clickabil cu întrebări exemple pe categorii (Clienți, Comenzi, Stoc, Analytics); merchantul nu știe ce poate întreba

---

## 🟡 Billing / Subscripție

- [ ] Definit planuri de subscripție (ce diferențiază planurile, ce features sunt gated)
- [ ] Flux Stripe — checkout → webhook confirmare → creare store
- [ ] Stări store: `active` / `suspended` / `blocked` — implementare guard în authorization layer
- [ ] Grace period 3 zile — job scheduler pentru tranziție `suspended` → `blocked`

---

## 🟡 Store / Onboarding

- [ ] Configuration wizard post-plată (alegere slug, setup store de bază)
- [ ] Store picker post-login (user cu mai multe store-uri)
- [ ] Redirect logic post-login în funcție de starea userului

---

## 🟢 Infra / DevEx

- [ ] Dev environment strategy pentru subdomains (`mystore.localhost` sau env var `VITE_DEV_SLUG`)
- [ ] Wildcard DNS + SSL cert pentru `*.merx.com` în producție

---

## ✅ Decis, neimplementat (Tier 3 — planificat post-MVP)

- Admin impersonation token (TTL 1h, fără refresh, audit log)
- Logout everywhere (există `deleteAllUserRefreshTokens` în repo, neexpus)
- Email verification la signup
- Store members / staff access (`StoreMembership`)

---

_Actualizat de Claude Code la finalul fiecărei sesiuni relevante._
