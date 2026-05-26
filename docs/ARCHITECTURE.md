# Freelancer OS — System Architecture

## 1. High-Level Overview

Freelancer OS is a multi-tenant SaaS platform. Each authenticated user operates in an isolated workspace backed by Supabase PostgreSQL with Row-Level Security (RLS). A Node.js Express API handles business logic, job aggregation, AI proposal generation, and Stripe billing. The React SPA talks to Express (not directly to OpenAI) for secrets and rate limiting.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│  React SPA (Vite)    │  Chrome Extension    │  Email (Resend/SendGrid)      │
│  Vercel              │  (optional MVP+1)    │  (notifications)              │
└──────────┬───────────┴──────────┬───────────┴───────────────┬───────────────┘
           │ JWT (Supabase)       │ same auth                  │
           ▼                      ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY — Express.js                             │
│                    Railway / Render — HTTPS only                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Middleware: CORS │ Helmet │ Rate Limit │ Auth (JWT verify) │ Validation    │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬────────┤
│  Auth    │  Jobs    │  Apps    │  AI      │  Clients │ Projects │ Invoices │
│  Routes  │  Routes  │  Routes  │  Routes  │  Routes  │  Routes  │  Routes  │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬───┘
     │          │          │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
│  JobAggregator │ ProposalAI │ InvoicePDF │ Billing │ Notification          │
└──────────┬──────────────────────────────┬───────────────────┬─────────────┘
           │                              │                   │
           ▼                              ▼                   ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Supabase            │    │  OpenAI API          │    │  Stripe              │
│  PostgreSQL + Auth   │    │  (gpt-4o-mini)       │    │  Subscriptions       │
│  Storage (invoices)  │    │                      │    │                      │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  EXTERNAL (LEGAL)    │
│  Remote OK API       │
│  Arbeitnow API       │
│  RSS feeds (user cfg)│
│  Manual job URLs     │
└──────────────────────┘
```

## 2. Request Flow — AI Proposal Generation

```
User → [React] POST /api/proposals/generate
         Headers: Authorization: Bearer <supabase_jwt>
         Body: { jobId, tone, length }

Express → authMiddleware → validate → checkSubscriptionQuota
         → ProposalService.generate()
              → load profile + job from Supabase (user_id scoped)
              → build prompt from template (docs/AI_PROMPTS.md)
              → OpenAI chat.completions
              → save to proposals table
         → return { proposal, tokensUsed }

React → display in modal → Apply Assistant (copy + open job URL)
```

## 3. Multi-Tenancy Model

| Layer | Isolation mechanism |
|-------|---------------------|
| Database | Every tenant table has `user_id UUID NOT NULL` referencing `auth.users` |
| RLS | Policies: `auth.uid() = user_id` on SELECT/INSERT/UPDATE/DELETE |
| API | JWT `sub` extracted; all queries filter by `user_id` |
| Storage | Bucket paths: `{user_id}/invoices/{invoice_id}.pdf` |

Workspace = one user in MVP. Phase 2: `workspaces` + `workspace_members` for teams.

## 4. Job Aggregation (Policy-Safe)

```
┌─────────────────┐     cron / manual trigger      ┌──────────────────┐
│ JobAggregator   │ ─────────────────────────────► │ jobs table       │
│ Service         │     normalize + dedupe by URL  │ (per user_id)    │
└────────┬────────┘                                └──────────────────┘
         │
    ┌────┴────┬────────────┬─────────────────┐
    ▼         ▼            ▼                 ▼
 RemoteOK  Arbeitnow   RSS (config)    POST /jobs/import
  public    public      user feeds       { url, title?, ... }
  API       API
```

**Explicitly excluded:** LinkedIn/Upwork scraping, headless login, auto-submit forms.

## 5. Application CRM Pipeline

```
  ┌────────┐   ┌─────────┐   ┌───────────┐   ┌─────┐   ┌──────┐
  │ saved  │ → │ applied │ → │ interview │ → │ won │   │ lost │
  └────────┘   └─────────┘   └───────────┘   └─────┘   └──────┘
       │            │              │              │
       └────────────┴──────────────┴──────────────┘
                    applications table
                    + notes, follow_up_at
```

## 6. Security Architecture

```
┌──────────────┐
│   Browser    │  Supabase Auth (email/OAuth) → stores session
└──────┬───────┘
       │ access_token in memory / httpOnly cookie (preferred: cookie via SSR later)
       ▼
┌──────────────┐
│   Express    │  supabase.auth.getUser(jwt) OR jose verify with JWT secret
└──────┬───────┘
       │ service_role ONLY in backend workers (never exposed to client)
       ▼
┌──────────────┐
│  Supabase    │  RLS enforced even if API bug; anon key in frontend for direct reads (optional)
└──────────────┘
```

- Input: Zod schemas on all POST/PATCH bodies
- Rate limits: 100 req/15min general; 10 req/min on `/proposals/generate`
- Secrets: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` server-only

## 7. Monetization Flow

```
Free plan: 5 proposals/month (tracked in usage_counters)
Pro plan:  unlimited + priority aggregation

Stripe Checkout → webhook → subscriptions table → update plan on profile
```

## 8. Deployment Topology

| Component | Host | Env |
|-----------|------|-----|
| frontend | Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` |
| backend | Railway | all secrets + `FRONTEND_URL` for CORS |
| database | Supabase Cloud | migrations in `supabase/migrations/` |
| cron | Railway cron / Supabase Edge Function | job sync every 6h |

## 9. Folder Structure

```
freelancer_os/
├── docs/                 # Architecture, MVP, AI prompts
├── supabase/migrations/  # SQL schema + RLS
├── backend/              # Express API
├── frontend/             # React + Vite
├── extension/            # Chrome extension (bonus stub)
└── README.md
```

## 10. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Vite + React | Fast MVP, SPA dashboard; migrate to Next.js if SEO/marketing site needed |
| State | TanStack Query | Server state, caching, optimistic updates |
| UI | Tailwind + shadcn-style components | SaaS polish, rapid iteration |
| PDF | pdfkit or @react-pdf/renderer on backend | Server-side invoice generation |
| AI model | gpt-4o-mini | Cost/quality balance for proposals |

## 11. Observability (Production)

- Structured logging: `pino` in Express
- Error tracking: Sentry (frontend + backend)
- Health: `GET /health` → DB ping + version
- Metrics: proposal generation latency, aggregation success rate
