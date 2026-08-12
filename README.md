# Merx

AI-native e-commerce platform where the AI agent is the primary operational interface between the merchant and their store.

> "Tell us what you sell. We'll run the store."

## Setup local

```bash
# 1. Clonează și instalează dependențele
git clone <repo>
cd Merx
npm install

# 2. Configurează environment
cp .env.example .env
# Completează valorile din .env

# 3. Rulează migrations
cd apps/api
npx prisma migrate dev

# 4. Pornește toate serviciile
npm run dev  # din root (Turborepo pornește toate apps în paralel)
```

**Apps disponibile:**
- Dashboard: http://localhost:3000
- API: http://localhost:3001
- Storefront: http://localhost:3002

## Structura proiectului

```
apps/
  dashboard/   — React SPA (interfața merchant)
  storefront/  — React SPA (magazinul public)
  api/         — Node.js + Express (backend)
packages/
  types/       — TypeScript types shared
  api-client/  — HTTP client typed
  llm-provider/ — LLMProvider interface + OpenAI impl
```

Vezi [`docs/structure.md`](docs/structure.md) pentru detalii complete.

## Documentație

| Document | Descriere |
|---|---|
| [`docs/prd.md`](docs/prd.md) | Ce construim și de ce |
| [`docs/architecture.md`](docs/architecture.md) | Diagrama sistemului la runtime |
| [`docs/structure.md`](docs/structure.md) | Codebase layout și convenții |
| [`docs/infrastructure.md`](docs/infrastructure.md) | Hosting, env vars, CI/CD |
| [`docs/decisions/`](docs/decisions/) | Architecture Decision Records |
| [`docs/features/`](docs/features/) | PRD + tech spec per feature |
| [`docs/launch-checklist.md`](docs/launch-checklist.md) | Checklist pre-launch |

## Tech stack

**Frontend:** React, TypeScript, TanStack Query, Tailwind CSS, React Router

**Backend:** Node.js, TypeScript, Express, Prisma, Zod

**Database:** PostgreSQL (Supabase), Redis (Upstash)

**AI:** OpenAI GPT-4o via LLMProvider abstraction

**Hosting:** Vercel (frontend) + Fly.io (backend) + Supabase (DB)
