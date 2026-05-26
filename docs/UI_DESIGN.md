# UI Design — Freelancer OS

## Design system

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0b0f` | Page canvas |
| Surface | `#0f1117` | Sidebar |
| Card | `#161922` | Cards, modals |
| Border | `#252836` | Dividers |
| Primary | `#6366f1` (indigo) | CTAs, active nav |
| Font | DM Sans | Headings + body |

## Layout

```
┌────────────┬──────────────────────────────────────────┐
│  Sidebar   │  Page header (title + actions)            │
│  240px     │  ─────────────────────────────────────    │
│            │  Content (tables / kanban / cards)        │
│  Logo      │                                           │
│  Nav x6    │                                           │
│  Settings  │                                           │
│  Sign out  │                                           │
└────────────┴──────────────────────────────────────────┘
```

## Key screens

### Dashboard
- 4 stat cards: applications, jobs applied, conversion %, earnings
- Pipeline chips by status

### Jobs
- Table: title, source, budget, actions (Save, Proposal)
- Top bar: Sync + URL import
- Proposal modal: tone/length selects, generate, copy, Apply Now

### Applications
- Kanban (default): 5 columns with drag-select status
- Table toggle for list view

### Profile
- Form: name, experience, skills, bio (feeds AI)

### Settings
- Upgrade to Pro card → Stripe Checkout

## Component inventory

| Component | Path |
|-----------|------|
| AppLayout | `frontend/src/components/layout/AppLayout.jsx` |
| Card, StatCard | `frontend/src/components/ui/Card.jsx` |
| Button | `frontend/src/components/ui/Button.jsx` |
| Modal | `frontend/src/components/ui/Modal.jsx` |
| ProposalModal | `frontend/src/components/jobs/ProposalModal.jsx` |
| KanbanBoard | `frontend/src/components/applications/KanbanBoard.jsx` |

## Responsive behavior

- Sidebar collapses to icons on `< md` (future enhancement)
- Kanban horizontal scroll on mobile
- Tables scroll horizontally on small screens
