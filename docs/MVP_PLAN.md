# Freelancer OS — 2–3 Week MVP Plan

## Goals

Ship a usable SaaS where a freelancer can: sign up → import/sync jobs → generate AI proposals → track applications → manage basic clients/projects → export one invoice.

---

## Week 1 — Foundation & Auth

### Days 1–2: Project setup & database

- [ ] Create Supabase project (Auth enabled: email + Google)
- [ ] Run `supabase/migrations/001_initial_schema.sql`
- [ ] Verify RLS policies with Supabase SQL editor (test as authenticated user)
- [ ] Scaffold `backend/` and `frontend/` repos
- [ ] Configure `.env` files from `.env.example`
- [ ] Deploy empty backend to Railway (`GET /health` works)

**Deliverable:** User can register/login; `profiles` row auto-created on signup trigger.

### Days 3–4: Authentication & profile

- [ ] Frontend: Login, Register, Forgot password pages (Supabase Auth UI or custom)
- [ ] Protected route wrapper; session persistence
- [ ] Profile page: skills, experience, portfolio links, bio
- [ ] Backend: `authMiddleware`, `GET/PATCH /api/profile`
- [ ] Proposal templates CRUD on profile

**Deliverable:** Authenticated user edits profile and saves a proposal template.

### Days 5–7: Jobs module

- [ ] `JobAggregatorService`: Remote OK + Arbeitnow fetchers
- [ ] Normalize to `jobs` schema; dedupe by `external_url`
- [ ] `POST /api/jobs/sync` (manual trigger; admin/cron later)
- [ ] `POST /api/jobs/import` for manual URL
- [ ] Frontend: Jobs list (table), filters (tags, source), job detail drawer
- [ ] Save job → creates `application` with status `saved`

**Deliverable:** User sees aggregated jobs and can import a custom link.

---

## Week 2 — Core Value (AI + CRM)

### Days 8–10: AI proposals

- [ ] `OpenAIService` + prompt templates (`docs/AI_PROMPTS.md`)
- [ ] `POST /api/proposals/generate` with tone/length
- [ ] Usage counter for Free tier (5/month)
- [ ] Frontend: Proposal generator modal on job detail
- [ ] Save/edit generated proposals; link to `application_id`
- [ ] Apply Assistant: copy proposal + open `job.url` in new tab

**Deliverable:** User generates and copies a personalized proposal in < 30 seconds.

### Days 11–12: Application tracker

- [ ] `applications` API: list, update status, notes, `follow_up_at`
- [ ] Frontend: Kanban board (Saved → Applied → Interview → Won/Lost)
- [ ] Table view toggle; follow-up reminder badge on dashboard

**Deliverable:** Full CRM pipeline for job applications.

### Days 13–14: Clients & projects

- [ ] Clients CRUD + communication notes
- [ ] Projects linked to clients; status, deadline, deliverables JSON
- [ ] Frontend: Clients list, Project detail with checklist

**Deliverable:** Post-win workflow: client + project created from application.

---

## Week 3 — Revenue, Polish, Deploy

### Days 15–16: Invoices

- [ ] Invoice CRUD; line items; PDF generation (backend)
- [ ] Upload PDF to Supabase Storage (`invoices` bucket, RLS path)
- [ ] Payments record against invoice
- [ ] Frontend: Invoice list, create form, download PDF

**Deliverable:** User creates invoice and marks payment received.

### Days 17–18: Dashboard & billing

- [ ] Dashboard widgets: applications count, conversion %, earnings sum, active clients
- [ ] Stripe Checkout for Pro plan; webhook handler
- [ ] Plan gate on proposal generation
- [ ] Settings: billing portal link

**Deliverable:** Monetization live in test mode.

### Days 19–21: Production hardening

- [ ] Rate limiting, Helmet, CORS lock to production domain
- [ ] Error boundaries + toast notifications
- [ ] E2E smoke: register → sync jobs → proposal → apply track
- [ ] Deploy frontend (Vercel) + backend (Railway)
- [ ] Documentation: README setup guide
- [ ] Optional: RSS source config in settings

**Deliverable:** Production URL shared with beta users.

---

## Post-MVP Backlog (Priority Order)

1. Email notifications (follow-up reminders via Resend)
2. Scheduled job sync (Railway cron every 6 hours)
3. Chrome extension (detect job page, inject copy button)
4. Team workspaces / invite members
5. Webhooks for Zapier
6. Razorpay for India billing alternative

---

## Definition of Done (MVP)

| Criteria | Target |
|----------|--------|
| Auth | Email signup, JWT-protected API |
| Jobs | 2+ legal sources + manual import |
| AI | Proposal < 15s p95 with profile context |
| CRM | 5-status pipeline + notes |
| Billing | Stripe test subscription upgrades plan |
| Security | RLS on all tables; no service key in frontend |
| Uptime | Health check green on deployed API |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OpenAI cost spike | Rate limit; max tokens; gpt-4o-mini default |
| API source changes | Adapter pattern per source; graceful degradation |
| Scope creep | Defer extension, webhooks, team features |
| Policy violation | Code review checklist; no scrapers in repo |
