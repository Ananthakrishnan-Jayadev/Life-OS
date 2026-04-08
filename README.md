# Life OS

Personal productivity dashboard — track workouts, habits, budget, study, jobs, and more.

## Stack

React 18 · Vite · Tailwind CSS · Supabase (Auth + Database + Storage) · Zustand · Recharts · Lucide Icons

## Local Development

```bash
git clone https://github.com/your-username/lifeos.git
cd lifeos/frontend
npm install
cp .env.example .env
# Fill in your Supabase credentials in .env
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

> Only the anon key is used in the client bundle — it is safe to expose. Never put your service role key here.

## Deploying to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy — `vercel.json` handles SPA routing automatically

## Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run your SQL schema scripts in the Supabase SQL editor
3. Enable Row Level Security on all tables
4. For progress photos: create a private storage bucket called `progress-photos` with RLS policies restricting access to `{userId}/` folders

## Pages

- **Dashboard** — Live overview widgets from all domains
- **Workout Tracker** — Exercise database, session logging, progression charts
- **Body Tracker** — Weight, measurements, Navy BF% auto-calculation, progress photos
- **Study Checklist** — Daily learning tracks with streak tracking
- **Budget Tracker** — Transactions, category spending, budget targets, 6-month trends
- **Job Applications** — Table/kanban views, inline status updates, pipeline stats
- **Habit Streaks** — 90-day heatmaps, weekly scorecard, per-habit trend charts
- **Quick Capture** — Zero-friction inbox with tag filtering and archive

## Architecture

```
src/
├── services/     # Supabase query functions (one file per domain)
├── hooks/        # React hooks with loading/error state + realtime subscriptions
├── pages/        # Route-level components (lazy loaded)
├── components/   # UI primitives, charts, layout
├── store/        # Zustand stores (auth, toast)
└── lib/          # Supabase client, utilities
```

## UX Features

- **Realtime** — Inbox, habits, and dashboard update live via Supabase subscriptions
- **Optimistic updates** — Instant feedback with automatic revert on error
- **Toast notifications** — Contextual success/error messages, auto-dismisses after 3s
- **Loading skeletons** — Structured placeholders matching each page layout
- **Empty states** — Friendly prompts when there's no data yet
- **Code splitting** — Each page is lazy-loaded for faster initial load
