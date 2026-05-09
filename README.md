# Naka

Naka is a phone-first photo logbook for Indian mills — cotton, oil, and dal.
Mill staff capture truck arrivals and lot details with their phones; mill owners
review daily summaries and reports from any device. Designed for cheap Android
hardware, slow connections, and Hindi-speaking users.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — mobile-first, 16 px base, 44 px tap targets
- **Supabase** — Postgres, storage, RLS
- **next-intl** — bilingual UI (Hindi default, English toggle)
- **jose** — custom JWT sessions (no email/OTP)

## Scripts

```bash
npm run dev           # start dev server on http://localhost:3000
npm run build         # production build
npm run start         # serve production build
npm run lint          # ESLint
npm run db:types      # regenerate src/types/database.ts from Supabase schema
npx tsx scripts/seed-users.ts  # seed demo users (run after seed.sql)
```

## Environment

Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → service_role
- `JWT_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

## Internationalisation (i18n)

Default language is **Hindi** (Devanagari). Users can toggle to **English** via the
`हिंदी | English` switcher in the top bar and on public pages. The choice is saved
in a `naka_locale` cookie and synced to `users.locale` in the database.

### Adding a new string

1. Add the key to **both** `src/i18n/messages/hi.json` and `src/i18n/messages/en.json`.
   Use namespace prefixes to group related keys (e.g. `"auth.login.myNewLabel"`).
2. Use in a **server component**: `const t = await getTranslations('auth'); t('login.myNewLabel')`
3. Use in a **client component**: `const t = useTranslations('auth'); t('login.myNewLabel')`

> **Never hardcode user-facing text in components.**
> Numbers, dates, and currency always use Indian formats (₹, DD/MM/YYYY, en-IN locale)
> regardless of language — see `src/lib/format.ts`.

## Font

Noto Sans Devanagari (Google Fonts, subsets: devanagari + latin) is loaded via
`next/font` and applied when locale is `hi`. English falls back to `system-ui`.

## Phone number handling

All phone inputs use `src/lib/phone.ts` → `normalizeIndianPhone(input)`.

Accepts any of: `9876543210`, `09876543210`, `+919876543210`, `+91 98765-43210`.
Always stores and validates the 10-digit national form. Use this helper in every
future form that accepts an Indian mobile number — do not write a new regex.

```ts
import { normalizeIndianPhone } from "@/lib/phone";
const result = normalizeIndianPhone(rawInput);
if (result.ok) { /* result.national = "9876543210" */ }
```

## Photos

Photos attach to entities (inbound_lot, outbound_dispatch, claim) via the
`photos` table. Each entity has named slots (truck, weighbridge, moisture_meter,
sample, dispatch_slip). Slots are defined in `src/lib/storage/photos.ts`.

Use `<PhotoGrid entityType="..." entityId="...">` to render the 2×2 capture UI.
For future entities (dispatches in step 9), pass a custom `slots` prop.

Upload flow: compress client-side (browser-image-compression) → signed PUT URL
(`/api/photos/upload-url`) → XHR with progress → register (`/api/photos/register`).
