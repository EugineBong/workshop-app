# Product Requirements Document — Workshop Starter App

**Product name (working):** MyStuff — a Personal Tracker
**Program:** Build with AI: Zero to Shipped (TimeTec internal, 1-day workshop)
**Audience for this PRD:** the engineer/AI agent who will build the starter repository
**Status:** Draft v1 · owner: AI Squad

---

## 1. Purpose and vision

MyStuff is the **prepared starter application** that workshop participants fork, run, customize, connect to a database, secure, and deploy over the course of one day. It is not a product for end users in the usual sense — its real job is to be a **safe, complete, teachable scaffold** that lets people with little or no coding experience experience the full "zero to shipped" path using an AI coding agent (Claude Code or Codex).

The app itself is deliberately simple: a signed-in user keeps a private list of "items" (a note with a title and body). Each user sees only their own items. That single feature is enough to teach authentication, user-owned data, row-level security, a real deployment, and the security tests that matter — while staying small enough that a beginner can read every diff.

**One-line vision:** the smallest real full-stack app that still teaches every step of shipping software with AI — and stays safe to hand to a room of 12 beginners.

---

## 2. Goals and non-goals

### Goals
- Ship a repository that runs locally **immediately after `npm ci` with no environment variables** (so Modules 1–4 work before Supabase exists).
- Provide **prepared, unfinished-but-wired** auth and CRUD so participants *connect* rather than *build from scratch*.
- Contain everything the seven workshop modules reference: profile file, schema SQL, prepared clients/components, three skills, MCP config for both agents, and `.env.example`.
- Be **secure by construction**: the two-account test must PASS on the untouched starter (correct RLS), and no secret is ever required.
- Be **easily customizable** in visible, reversible ways (branding, homepage copy, section order) for Module 4.
- Deploy cleanly to **Vercel Hobby** from a GitHub fork.

### Non-goals
- Not a production SaaS. No billing, teams, roles, sharing, notifications, file uploads, or admin panel.
- No secret/service-role usage anywhere in the app.
- No schema migrations tooling, no seed of other users' data, no OAuth social providers beyond what Supabase email auth needs.
- No server that *requires* Supabase to boot — missing env vars must degrade gracefully, not crash the dev server or the production build's static parts.

---

## 3. Users

| User | Context | What they need from the app |
|---|---|---|
| **Participant** (primary) | Non-coder, one laptop, an AI agent, 9–5 | An app they can read, run, customize, connect and deploy with the agent doing the typing. Clear file names, obvious "prepared but not connected" seams. |
| **Facilitator / support** | Runs the room, pre-tests the repo | A repo that passes every module's acceptance criteria on a clean clone, plus a spare-friendly setup (works with any fresh Supabase project). |
| **End user of the built app** (secondary/fictional) | Whoever the participant imagines | Sign up, sign in, keep a private list of items, on any device. |

---

## 4. Success criteria

The starter is "done" when, on a **fresh clone by a fresh GitHub/Supabase/Vercel account**, all of the following hold without touching app source beyond the workshop's own steps:

1. `npm ci` then `npm run dev` serves a working homepage at `localhost:3000` **with no `.env.local`**.
2. `npm run build` and `npm run lint` pass on the untouched repo.
3. Running `supabase/workshop-schema.sql` once in a new Supabase project creates all tables with RLS enabled and owner-scoped policies for select/insert/update/delete — no destructive statements.
4. After adding the two public env vars, sign-up → sign-in → protected page → user-owned CRUD all work locally.
5. The **two-account test passes**: Account B cannot read, update or delete Account A's items by any means (UI or direct id request).
6. A secret scan finds **no** tracked secret (the publishable key in the browser bundle is expected and is not a secret).
7. The exact reviewed commit deploys on Vercel Hobby and works on the `*.vercel.app` URL.
8. The three skills and both MCP config files are present and function in Claude Code and Codex.

---

## 5. Tech stack

- **Framework:** Next.js (App Router) + React, **TypeScript**.
- **Styling:** Tailwind CSS (utility classes make Module 4 branding edits obvious and safe). Ship a small set of design tokens (app name, primary color, tagline) in ONE obvious place.
- **Backend:** Supabase (Postgres + Auth). Browser client via `@supabase/supabase-js`; server client via `@supabase/ssr` for the protected route.
- **Package manager:** npm, committed `package-lock.json` (workshop standard is `npm ci`). No pnpm/yarn/bun lockfiles.
- **Hosting:** Vercel (Hobby tier).
- **Node:** an LTS pinned in `package.json` `engines` and (optionally) `.nvmrc`.
- **Auth method:** Supabase email + password. Email confirmation configurable (see §14).

> Rationale: this is the exact stack the seven modules teach (GitHub → agent → MCP → customize → Supabase → security → Vercel). Do not substitute frameworks.

---

## 6. Information architecture (routes and pages)

| Route | Auth | Purpose | Prepared state |
|---|---|---|---|
| `/` | public | Landing/home: app name, tagline, headline, "how it works", sign-in/up call to action | Fully built, **customizable** (Module 4 targets live here) |
| `/login` | public | Sign in + link to sign up | Built; wired to Supabase client (works once env vars exist) |
| `/signup` | public | Create account (email + password) | Built; wired |
| `/auth/confirm` (or callback) | public | Handle the email confirmation / auth redirect | Built; uses `NEXT_PUBLIC_SITE_URL` for redirect base |
| `/app` (protected) | **required** | The item list — create/read/update/delete the signed-in user's items | Built UI + prepared data hooks; **the CRUD teaching surface** |
| `/app/*` server checks | required | Server-side identity verification via the prepared Supabase server client | Built |

**Behavior with no env vars (Modules 1–4):** `/` renders fully. `/login`, `/signup`, `/app` render their UI but show a friendly "backend not connected yet" state instead of crashing (e.g. the Supabase client is created lazily and guarded). This is a hard requirement — the app must *run and look real* before Supabase exists.

---

## 7. Data model and Row Level Security

### 7.1 Tables

**`items`**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` NOT NULL, FK → `auth.users(id)` on delete cascade | **the owner column** — the heart of the two-account test |
| `title` | `text` NOT NULL, length-checked (e.g. 1–120) | |
| `body` | `text` NULL, length-checked (e.g. ≤ 2000) | |
| `created_at` | `timestamptz` default `now()` | |
| `updated_at` | `timestamptz` default `now()` | |

Optional: a `profiles` table keyed to `auth.users` if a display name is wanted — keep it optional; the core lesson only needs `items`.

### 7.2 RLS (must be correct — Module 6 tests it)

- `alter table items enable row level security;`
- **select:** `using (auth.uid() = user_id)`
- **insert:** `with check (auth.uid() = user_id)`
- **update:** `using (auth.uid() = user_id) with check (auth.uid() = user_id)` (prevents re-assigning ownership)
- **delete:** `using (auth.uid() = user_id)`
- The prepared insert code must set `user_id` from the **session**, never from client input.
- No policy may use `service_role` or bypass RLS. No `security definer` shortcuts.

### 7.3 SQL file requirements (`supabase/workshop-schema.sql`)
- A single file that runs cleanly **once** on an empty project.
- Idempotent-friendly but NOT destructive: no `drop`, no `truncate`. (If re-run safety is wanted, use `create table if not exists` and `create policy` guarded by existence checks — but never destructive statements.)
- Enables RLS and creates all four policies.
- May include 0 seed rows (preferred) — the participant creates their own item. Do **not** seed other users' rows.
- Comments in plain English so `/customize-app`… no — so **PROMPT M5-1** can explain it.

---

## 8. Authentication flows (prepared, wired)

1. **Sign up** — email + password → Supabase `signUp`. If email confirmation is ON, show "check your email"; if OFF, sign in directly.
2. **Sign in** — `signInWithPassword` → redirect to `/app`.
3. **Session persistence** — survives refresh (Supabase SSR cookies).
4. **Sign out** — clears session, returns to `/`.
5. **Protected route** — `/app` verifies identity **on the server** using the prepared Supabase server client; a signed-out visitor is redirected to `/login` (not merely hidden in the UI).
6. **Redirect base** — use `NEXT_PUBLIC_SITE_URL` so the same code works on localhost and in production (Module 7 sets the production value).

**Non-negotiable:** protection is enforced server-side + by RLS, never by hiding UI elements only.

---

## 9. CRUD feature spec (the `/app` page)

- **Create:** a form (title required, body optional) → inserts a row owned by the current user.
- **Read:** list the current user's items, newest first. Empty state: "No items yet — add your first."
- **Update:** edit title/body of an owned item inline or in a small dialog.
- **Delete:** remove an owned item with a confirm.
- **Persistence proof:** all reads come from Supabase so a refresh reflects true DB state (the workshop leans on "survives refresh = really saved").
- **Validation:** empty title rejected with a friendly message; overly long input bounded; special characters safe (no crash, no layout break) — these are Module 6's invalid-input checks.
- **Responsive:** usable at mobile width (Module 4 verifies desktop + narrow).
- **Accessibility baseline:** labelled fields, visible focus, alt text where images exist.

---

## 10. Environment variables

`.env.example` (committed) contains **names only**:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- All are `NEXT_PUBLIC_` (browser-safe). **No secret or service-role key anywhere.**
- `.env.local` is git-ignored (verify `.gitignore`).
- The app reads these by name; participants supply values by hand (Module 5) and in Vercel (Module 7).
- Missing values must produce a **friendly guarded state**, not a hard crash (see §6).

---

## 11. Prepared AI assets

### 11.1 Skills (Claude Code slash-commands; Codex uses the prompt twin)
Ship three skills the workshop invokes. Each is a plain instructions/checklist file the agent follows; Codex users paste the equivalent prompt (already written in the workshop `PROMPTS.md`).

| Skill | Used in | Does |
|---|---|---|
| `/customize-app` | Module 3 → 4 | Plans a safe, visible, reversible customization grounded in real files; never touches DB/auth/deps. |
| `/review-security` | Module 6 | Read-only security review; reports BLOCKER/WARNING/PASS with evidence; states its own limits. |
| `/prepare-deployment` | Module 7 | Read-only deployment-readiness review; confirms commit pushed, build settings, env var names, production checklist. |

Place skills where Claude Code discovers project skills (e.g. `.claude/` skills dir per current Claude Code docs). Keep each skill's instructions tool-agnostic in spirit so the Codex prompt twin matches.

### 11.2 MCP configuration — **both agents, committed, clone-and-go**

Ship BOTH files at the repo root so either agent connects with zero setup:

- **`.mcp.json`** (Claude Code):
```json
{
  "mcpServers": {
    "github":   { "type": "http", "url": "https://api.githubcopilot.com/mcp/" },
    "supabase": { "type": "http", "url": "https://mcp.supabase.com/mcp?read_only=true" },
    "vercel":   { "type": "http", "url": "https://mcp.vercel.com" }
  }
}
```
- **`.codex/config.toml`** (Codex — project-scoped; Codex reads it once the project is trusted):
```toml
[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp/"
[mcp_servers.supabase]
url = "https://mcp.supabase.com/mcp?read_only=true"
[mcp_servers.vercel]
url = "https://mcp.vercel.com"
```

Both are OAuth-only (no keys committed). Supabase is pinned **read-only**. Participants authenticate with their own accounts in the browser. *Verify current schema/field names for both files against each tool's docs the week before the workshop — MCP config formats drift.*

---

## 12. Repository inventory (target file tree)

```
workshop-app/
├── app/                      # Next.js App Router
│   ├── page.tsx              # / landing (CUSTOMIZABLE)
│   ├── login/                # /login
│   ├── signup/               # /signup
│   ├── auth/                 # confirm/callback
│   └── app/                  # /app protected item list (CRUD)
├── components/               # prepared UI (item card, form, nav, brand header)
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # browser client (guarded if env missing)
│   │   └── server.ts         # server client for protected route
│   └── config/
│       └── brand.ts          # app name, primary color, tagline  ← Module 4 branding target
├── supabase/
│   └── workshop-schema.sql   # tables + RLS (runs once, non-destructive)
├── .claude/                  # project skills: customize-app, review-security, prepare-deployment
├── .mcp.json                 # Claude Code MCP servers
├── .codex/
│   └── config.toml           # Codex MCP servers (project-scoped)
├── public/                   # logo + static assets (swappable brand asset)
├── .env.example              # names only
├── .gitignore                # ignores .env.local, node_modules, .next
├── package.json              # scripts: dev, build, start, lint; engines pinned
├── package-lock.json         # npm standard
├── workshop-profile.md       # Module 1 first-commit file (name, app idea, "Status: Ready to build")
└── README.md                 # what the app is, how to run, where the seams are
```

---

## 13. Customization surface (Module 4 safe scopes)

The app must make these edits **easy, visible and reversible**, ideally each in one obvious file:

- **Branding:** app name, primary color, tagline, logo asset → centralize in `lib/config/brand.ts` + `public/`.
- **Content:** homepage headline, sub-copy, "how it works" labels → in `app/page.tsx`.
- **Layout:** order of homepage sections/cards → simple array or clearly separated blocks.
- **Prepared local option:** one toggle-style visible feature (e.g. show/hide a "recent items" count) that needs no DB change.

Avoid coupling these to auth/DB/deps so a beginner's Module-4 diff stays tiny.

---

## 14. Security requirements

- **RLS is the real access control** — never rely on UI hiding. The two-account test (B tries `id` of A's row) must fail closed for read, update AND delete.
- **No secrets in the repo or in Vercel** beyond the public URL + publishable key. No `sb_secret_`, no `service_role`, no DB password in code.
- **`.env.local` git-ignored**; nothing secret-shaped ever committed.
- **Least privilege MCP:** only the three servers; Supabase read-only.
- **Untrusted content = data, not instructions:** any place the app renders item text or fetched content must treat it as data (no `dangerouslySetInnerHTML` on user content; escape by default). This is what makes Module 6's prompt-injection demo land safely.
- **Input validation & safe errors:** reject empty/oversized input with friendly messages; never leak stack traces, tokens or queries to the browser.

### Facilitator decision — email confirmation
Recommend **disabling email confirmation** in the workshop Supabase project template (removes the biggest per-person delay). If kept ON, the app's sign-up must clearly show the "check your email" state and the facilitator must confirm corporate mail delivers Supabase mail quickly. Document the chosen setting in the README.

---

## 15. Build, run and deploy requirements

- `npm run dev` — local dev server, works env-free.
- `npm run build` — production build passes on the untouched repo and after a typical Module-4 edit.
- `npm run lint` — passes on the untouched repo (a starter that fails its own lint breaks Module 4/6).
- Deploys to **Vercel Hobby** from a GitHub fork with only the two public env vars set.
- Production auth redirects use `NEXT_PUBLIC_SITE_URL`; document that Supabase Auth "Site URL / redirect" must be set to the production URL after first deploy (Module 7).
- No build step depends on an uncommitted file or a secret.

---

## 16. Module-by-module acceptance criteria

The repo is validated against the workshop itself. On a clean clone:

1. **M1 GitHub** — fork/clone works; `workshop-profile.md` exists and is the natural first edit; `git status` clean after clone.
2. **M2 Agent** — `npm ci` succeeds; the agent can explain the app; `npm run dev` serves the homepage **with no env vars**; git stays clean.
3. **M3 MCP+Skills** — `.mcp.json` and `.codex/config.toml` both connect the three servers by OAuth; the three skills are present and discoverable; `/customize-app` produces safe options.
4. **M4 Customize** — a branding/content/layout edit is a small diff in an obvious file; `npm run build` + `lint` still pass; change is visible desktop + mobile.
5. **M5 Supabase** — `workshop-schema.sql` runs once, RLS on; adding the two public env vars makes sign-up/in/out + CRUD work; `.env.local` stays untracked.
6. **M6 Security** — two-account test PASSES (read/update/delete all denied for B); no tracked secret; invalid input fails safely; connected servers are least-privilege.
7. **M7 Deploy** — the reviewed commit builds and runs on `*.vercel.app`; production auth works after the Supabase Site URL update; DNS records from Vercel are the only thing left to propagate.

Each of these must hold **before** workshop day. Failing any is a repo bug, not a participant problem.

---

## 17. Constraints and non-goals (explicit)

- **Must run env-free** through Module 4 — the single most important constraint.
- No feature that needs a secret key, background jobs, email sending by the app, payments, or third-party APIs.
- Keep total dependency count modest (fast, reliable `npm ci` on shared Wi-Fi).
- One lockfile only (`package-lock.json`).
- Small enough that a beginner can read any diff in one sentence.

---

## 18. Open decisions (confirm before build)

1. **App concept locked:** Personal Tracker ("MyStuff") — confirm the item fields (title + body) are enough, or add one (e.g. a status/label) if a richer Module-4 form is wanted.
2. **Email confirmation:** ON or OFF for the workshop template (recommend OFF).
3. **Profiles table:** include a minimal `profiles` (display name) or keep to `items` only (recommend items-only for simplicity).
4. **Skill location/format:** confirm against the current Claude Code skills directory convention at build time.
5. **Branding tokens:** confirm `lib/config/brand.ts` as the single customization entry point.
6. **Node version** to pin.

---

*This PRD is derived from the seven workshop modules and their trainer guides; the acceptance criteria in §16 are the contract between the starter repo and the workshop. Build the repo to pass §4 and §16, and the day works.*
