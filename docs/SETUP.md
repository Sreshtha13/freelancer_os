# Freelancer OS — Setup Guide

Step-by-step instructions to run Freelancer OS locally and deploy to production.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase project](#2-supabase-project)
3. [Database migration](#3-database-migration)
4. [Supabase Auth](#4-supabase-auth)
5. [Storage (invoices)](#5-storage-invoices)
6. [Backend setup](#6-backend-setup)
7. [Frontend setup](#7-frontend-setup)
8. [Verify local install](#8-verify-local-install)
9. [Stripe (optional)](#9-stripe-optional)
10. [OpenAI](#10-openai)
11. [Production deployment](#11-production-deployment)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| Git | any | `git --version` |

**Accounts to create (free tiers are fine for development):**

- [Supabase](https://supabase.com) — database, auth, storage
- [OpenAI](https://platform.openai.com) — AI proposals
- [Stripe](https://stripe.com) — optional, for Pro billing

---

## 2. Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choose an organization, name (e.g. `freelancer-os`), database password, and region.
3. Wait until the project status is **Active**.

### Get API keys

1. Open **Project Settings** → **API**.
2. Copy and save:

| Key | Where used |
|-----|------------|
| **Project URL** | `SUPABASE_URL` / `VITE_SUPABASE_URL` |
| **anon public** | `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` |
| **service_role** | `SUPABASE_SERVICE_ROLE_KEY` (backend only — never expose to frontend) |

> **Security:** The `service_role` key bypasses Row Level Security. Use it only in the backend `.env`, never in the React app or Git.

---

## 3. Database migration

1. In Supabase Dashboard, open **SQL Editor** → **New query**.
2. Open the file `supabase/migrations/001_initial_schema.sql` from this repo.
3. Copy the **entire** file contents and paste into the SQL Editor.
4. Click **Run**.

### Confirm migration

Run this in the SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see tables including: `profiles`, `jobs`, `applications`, `proposals`, `clients`, `projects`, `invoices`, `payments`.

### Confirm profile trigger

After a user signs up, a row should appear in `profiles`. The migration includes `handle_new_user()` on `auth.users`.

---

## 4. Supabase Auth

1. Go to **Authentication** → **Providers**.
2. Enable **Email** (enabled by default).
3. For local dev, optional: **Authentication** → **Settings** → disable **Confirm email** so sign-up works without inbox verification.

### Site URL (required for redirects)

1. **Authentication** → **URL Configuration**.
2. Set:

| Field | Local value |
|-------|-------------|
| Site URL | `http://localhost:5173` |
| Redirect URLs | `http://localhost:5173/**` |

For production, add your Vercel URL (e.g. `https://your-app.vercel.app/**`).

### Optional: Google OAuth

1. Enable **Google** provider.
2. Add OAuth client ID/secret from [Google Cloud Console](https://console.cloud.google.com/).
3. Add authorized redirect URI from Supabase (shown on the provider page).

---

## 5. Storage (invoices)

Required before using invoice PDF upload in production. Safe to skip for initial MVP testing.

### Create bucket

1. **Storage** → **New bucket**
2. Name: `invoices`
3. **Public bucket:** OFF (private)

### Storage policies (SQL Editor)

```sql
-- Users can upload to their own folder: {user_id}/...
CREATE POLICY "Users upload own invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users update own invoices"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own invoices"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 6. Backend setup

### Install

```bash
cd backend
npm install
```

### Environment file

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

OPENAI_API_KEY=sk-proj-...

# Optional until billing is needed:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### Run

```bash
npm run dev
```

Expected output:

```
Freelancer OS API listening on port 4000
```

### Health check

Open in browser or run:

```bash
curl http://localhost:4000/health
```

Expected JSON:

```json
{
  "status": "ok",
  "service": "freelancer-os-api",
  "database": "ok",
  "timestamp": "..."
}
```

If `"database": "error"`, check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 7. Frontend setup

Open a **second terminal** (keep backend running).

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:4000
```

> `VITE_` prefix is required — Vite only exposes variables with this prefix to the browser.

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 8. Verify local install

Use this checklist after both servers are running.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Register at `/register` | Redirect to Dashboard |
| 2 | **Profile** → add skills + bio → Save | Success, no errors |
| 3 | **Jobs** → **Sync jobs** | Jobs appear in table |
| 4 | **Jobs** → paste a job URL → **Import** | New row in table |
| 5 | **Jobs** → **Proposal** on a job | AI text generated (needs OpenAI key) |
| 6 | **Jobs** → **Save** on a job | Row in **Applications** |
| 7 | **Applications** → change status in Kanban | Status updates |
| 8 | `GET /health` | `"database": "ok"` |

### First-time user flow

```
Register → Profile (skills/bio) → Jobs (Sync) → Proposal → Applications
```

---

## 9. Stripe (optional)

Skip for MVP if you only need Free tier (5 proposals/month).

### Dashboard setup

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Products** → **Add product**
2. Name: `Freelancer OS Pro`
3. Add recurring price (e.g. $19/month) → copy **Price ID** → `STRIPE_PRO_PRICE_ID`

### Backend env

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Local webhooks

Install [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```bash
stripe login
stripe listen --forward-to localhost:4000/api/billing/webhook
```

Copy the webhook signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

### Test upgrade

1. Log in → **Settings** → **Upgrade to Pro**
2. Use test card `4242 4242 4242 4242`
3. Confirm `profiles.plan` is `pro` in Supabase Table Editor

---

## 10. OpenAI

1. [platform.openai.com](https://platform.openai.com) → **API keys** → **Create secret key**
2. Add billing/credits on the account (required for API calls)
3. Set `OPENAI_API_KEY` in `backend/.env`

Default model: `gpt-4o-mini` (see `backend/src/config/ai.config.js`).

### Proposal quota

| Plan | Limit |
|------|-------|
| Free | 5 proposals / calendar month |
| Pro | Unlimited |

Quota is tracked in `usage_counters`.

---

## 11. Production deployment

### Environment summary

| Variable | Backend | Frontend |
|----------|---------|----------|
| Supabase URL | ✅ | ✅ `VITE_` |
| Supabase anon key | ✅ | ✅ `VITE_` |
| Supabase service role | ✅ | ❌ never |
| OpenAI key | ✅ | ❌ never |
| Stripe secrets | ✅ | ❌ never |
| `FRONTEND_URL` | ✅ (CORS) | — |
| `VITE_API_URL` | — | ✅ (production API URL) |

### Supabase (production)

1. Add production Site URL and Redirect URLs (Vercel domain).
2. Re-run migration if using a new project (or use the same project for staging).

### Backend — Railway

1. New project → **Deploy from GitHub** → select repo, root directory: `backend`
2. **Variables:** paste all keys from `backend/.env` (use production values)
3. Set `FRONTEND_URL=https://your-app.vercel.app`
4. Start command: `npm start`
5. Copy public URL → use as `VITE_API_URL` on frontend

### Frontend — Vercel

1. Import repo → root directory: `frontend`
2. Framework: **Vite**
3. Build: `npm run build` → Output: `dist`
4. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = Railway backend URL

### Stripe (production)

1. Switch to **Live** keys in production env
2. Webhook endpoint: `https://your-api.railway.app/api/billing/webhook`
3. Events: `customer.subscription.created`, `customer.subscription.updated`

---

## 12. Troubleshooting

### `database: "error"` on `/health`

- Wrong `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`
- Migration not applied
- Supabase project paused (free tier inactivity)

### `401 Invalid or expired token` on API calls

- User not logged in
- Frontend `VITE_SUPABASE_*` does not match backend `SUPABASE_*` project
- Token expired — sign out and sign in again

### `402 Monthly proposal limit reached`

- Free plan: 5/month — upgrade to Pro or wait for next month
- Check `usage_counters` in Supabase

### `400 Add skills or a bio` when generating proposal

- Profile needs at least one skill **or** bio ≥ 100 characters

### CORS errors in browser

- `FRONTEND_URL` in backend must match exact origin (including `http://` and port)
- Restart backend after changing `.env`

### Jobs sync returns 0 jobs

- RemoteOK/Arbeitnow APIs may be rate-limited or temporarily down
- Use **Import** with a manual job URL instead
- Check backend console for `errors` array in sync response

### OpenAI `503 OpenAI is not configured`

- Set `OPENAI_API_KEY` in `backend/.env` and restart server

### Register works but profile missing

- Re-run migration (trigger `on_auth_user_created`)
- Or manually insert into `profiles` for testing

### Windows: `cp` not found

Use PowerShell:

```powershell
Copy-Item .env.example .env
```

---

## Project commands reference

| Location | Command | Purpose |
|----------|---------|---------|
| `backend/` | `npm run dev` | API with hot reload |
| `backend/` | `npm start` | Production API |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production build |

---

## Related docs

- [Architecture](ARCHITECTURE.md)
- [MVP Plan](MVP_PLAN.md)
- [AI Prompts](AI_PROMPTS.md)
- [UI Design](UI_DESIGN.md)

---

## Support checklist (copy for onboarding)

```
[ ] Supabase project created
[ ] 001_initial_schema.sql executed
[ ] Auth email enabled, Site URL set
[ ] backend/.env filled (Supabase + OpenAI)
[ ] frontend/.env filled (VITE_* vars)
[ ] npm install in backend + frontend
[ ] /health returns database: ok
[ ] Register + login works
[ ] Job sync or import works
[ ] AI proposal generates
[ ] (Optional) Stripe webhook configured
[ ] (Optional) invoices storage bucket + policies
```
