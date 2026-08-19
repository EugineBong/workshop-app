# MyStuff — Workshop Starter App

The starter app for **Build with AI: Zero to Shipped** (TimeTec, 1-day workshop).
A signed-in user keeps a private list of items (a note with a title and body).
Each user sees only their own items — enforced by the database, not just the UI.

## Run it (no setup needed)

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The homepage, login, signup and /app pages all render
**before** any backend exists — pages that need Supabase show a friendly
"Backend not connected yet" note until Module 5.

## The seams (where each module plugs in)

| Module | What you touch |
|---|---|
| 1 — GitHub | `workshop-profile.md` (your first commit) |
| 3 — MCP & skills | `.mcp.json`, `.codex/config.toml`, `.claude/skills/` |
| 4 — Customize | `lib/config/brand.ts` (branding + badge toggle), `app/page.tsx` (copy + `SECTION_ORDER`) |
| 5 — Supabase | run `supabase/workshop-schema.sql`, then create `.env.local` from `.env.example` |
| 6 — Security | `/review-security` skill + the two-account test |
| 7 — Deploy | `/prepare-deployment` skill + Vercel |

## Connecting Supabase (Module 5)

1. Create a Supabase project.
2. SQL editor → paste and run `supabase/workshop-schema.sql` (once).
3. Copy `.env.example` to `.env.local` and fill in your project's URL and
   publishable key (Project Settings → API). Both values are browser-safe.
4. Restart the dev server. Sign up, sign in, add items.

**Email confirmation is OFF** in the workshop Supabase template — sign-up signs you
straight in. (If your project has it ON, sign-up shows "check your email" instead;
the app handles both.)

## Environment variables

Only three, all public (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
No secret key is used anywhere — there is nothing here that must be hidden,
and `.env.local` is git-ignored anyway.

## Security model (the short version)

- `/app` verifies your identity **on the server** and redirects signed-out visitors.
- Row Level Security in Postgres is the real access control: another user cannot
  read, edit or delete your rows even by calling the API directly.
- Everything you type is rendered as plain text — never as HTML.

## Deploying (Module 7)

Deploys to Vercel Hobby from a GitHub fork. Set the three env vars in Vercel
(`NEXT_PUBLIC_SITE_URL` = your `*.vercel.app` URL), deploy, then set the same URL
as the Site URL in Supabase Auth settings. The `/prepare-deployment` skill walks
the whole checklist.
