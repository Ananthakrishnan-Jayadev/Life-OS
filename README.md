# Life OS

Personal productivity dashboard built with React + Vite + Supabase + Tailwind CSS.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in `frontend/`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Pages

- **Dashboard** — Morning overview with live widgets from all domains
- **Workout Tracker** — Exercise database, session logging, progression charts
- **Body Tracker** — Weight, measurements, Navy BF% auto-calculation, trend charts
- **Study Checklist** — Daily learning tracks with streak tracking
- **Budget Tracker** — Transactions, category spending, budget targets, 6-month trends
- **Job Applications** — Table/kanban views, inline status updates, pipeline stats
- **Habit Streaks** — 90-day heatmaps, weekly scorecard, per-habit trend charts
- **Quick Capture** — Zero-friction inbox with tag filtering and archive

## Stack

React 18 · Vite · Tailwind CSS 3 · Supabase · Zustand · Recharts · Lucide Icons

## Architecture

```
src/
├── services/     # Supabase query functions (one file per domain)
├── hooks/        # React hooks wrapping services with loading/error state
├── pages/        # Page components using real Supabase data
├── components/   # UI primitives, charts, layout
├── store/        # Zustand stores (auth, toast)
└── lib/          # Supabase client, utilities
```

## Auth

- Email/password via Supabase Auth
- Demo login available (no account required)
- All routes protected — redirects to `/login` when unauthenticated

## UX Features

- **Realtime** — Inbox, habits, and dashboard update live via Supabase subscriptions
- **Optimistic updates** — Study toggles, habit checks, inbox archive, and job status changes update instantly with automatic revert on error
- **Toast notifications** — Success/error feedback on every mutation, auto-dismisses after 3s
- **Loading skeletons** — Structured placeholders matching each page's layout
- **Empty states** — Friendly messages with action prompts when there's no data

## Progress Photos

Body Tracker supports progress photo uploads via Supabase Storage.

**Setup required** in Supabase Dashboard → Storage:
1. Create a bucket called `progress-photos`, set to **private**
2. Add RLS policies so users can only access their own `{userId}/` folder
