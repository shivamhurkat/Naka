# Naka

Naka is a phone-first photo logbook for Indian mills — cotton, oil, and dal.
Mill staff capture truck arrivals and lot details with their phones; mill owners
review daily summaries and reports from any device. Designed for cheap Android
hardware, slow connections, and Hindi-speaking users.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — mobile-first, 16 px base, 44 px tap targets
- **Supabase** — auth, Postgres, storage (step 2)

## Scripts

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

## Environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials before running.
