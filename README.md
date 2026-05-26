# Freelancer OS

AI-powered Freelancer Client & Job Management Platform.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS 4 |
| Backend | Node.js 20 + Express |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | OpenAI API (gpt-4o-mini) |
| Billing | Stripe |

## Project structure

```
freelancer_os/
├── docs/           # Architecture, MVP plan, AI prompts, UI notes
├── supabase/       # SQL migrations + RLS
├── backend/        # Express API
├── frontend/       # React SPA
└── extension/      # Chrome extension (optional)
```

## Quick start

**Full step-by-step guide:** **[docs/SETUP.md](docs/SETUP.md)**

```bash
# 1. Run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
# 2. Backend
cd backend && cp .env.example .env   # Windows: Copy-Item .env.example .env
npm install && npm run dev

# 3. Frontend (new terminal)
cd frontend && cp .env.example .env
npm install && npm run dev
```

- API: http://localhost:4000/health  
- App: http://localhost:5173

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET/PATCH | `/api/profile` | User profile |
| GET | `/api/profile/dashboard` | Dashboard stats |
| GET | `/api/jobs` | List jobs |
| POST | `/api/jobs/sync` | Fetch from RemoteOK + Arbeitnow |
| POST | `/api/jobs/import` | Manual job URL |
| POST | `/api/proposals/generate` | AI proposal |
| GET/PATCH | `/api/applications` | CRM pipeline |
| CRUD | `/api/clients`, `/api/projects`, `/api/invoices` | Business modules |
| POST | `/api/billing/checkout` | Stripe checkout |

All `/api/*` routes (except webhook) require `Authorization: Bearer <supabase_jwt>`.

## Policy compliance

- No LinkedIn/Upwork scraping
- No auto-apply bots
- Job sources: public APIs, RSS, manual URLs only
- Apply Assistant opens job URL + copy proposal (user pastes manually)

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel — root `frontend`, build `npm run build`, output `dist` |
| Backend | Railway — root `backend`, start `npm start` |
| Database | Supabase Cloud |

Set production env vars and `FRONTEND_URL` for CORS.

## Documentation

- **[Setup Guide](docs/SETUP.md)** — local dev, env vars, Supabase, Stripe, deploy, troubleshooting
- [Architecture](docs/ARCHITECTURE.md)
- [MVP Plan (2–3 weeks)](docs/MVP_PLAN.md)
- [AI Prompts](docs/AI_PROMPTS.md)
- [UI Design Notes](docs/UI_DESIGN.md)

## License

Proprietary — all rights reserved.
