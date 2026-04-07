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
├── store/        # Zustand stores (auth, legacy local state)
└── lib/          # Supabase client, utilities
```

## Auth

- Email/password via Supabase Auth
- Demo login available (no account required)
- All routes protected — redirects to `/login` when unauthenticated
