# MyStuff Workshop Starter App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "MyStuff" Next.js + Supabase starter repository that workshop participants fork, run env-free, customize, connect to Supabase, secure, and deploy to Vercel.

**Architecture:** Next.js App Router (TypeScript, Tailwind) with a public landing page, auth pages, and a server-protected `/app` CRUD page. Supabase clients (browser via `@supabase/ssr` `createBrowserClient`, server via `createServerClient`) are created lazily and return `null` when env vars are missing, so every page renders a friendly "backend not connected" state env-free. RLS in `supabase/workshop-schema.sql` is the real access control.

**Tech Stack:** Next.js (App Router) + React + TypeScript, Tailwind CSS, `@supabase/supabase-js` + `@supabase/ssr`, npm, Vercel Hobby.

**Spec:** `/home/maru/workshop/workshop-app/WorkshopAppPRD.md` (all §18 open decisions resolved: title+body only; email confirmation OFF; items table only; skills in `.claude/skills/<name>/SKILL.md`; branding in `lib/config/brand.ts`; Node 22).

## Global Constraints

- Must run env-free: `npm ci && npm run dev` serves `/` with **no** `.env.local`; `npm run build` and `npm run lint` pass on the untouched repo. Missing env vars degrade gracefully — never crash.
- No secrets anywhere: only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. No `sb_secret_`, no `service_role`, no `security definer` policies.
- `user_id` on insert comes from the session, never from form input.
- No `dangerouslySetInnerHTML` on user content anywhere.
- One lockfile: `package-lock.json` only. Modest dependency count.
- Non-destructive SQL only: no `drop table`, no `truncate`, no `delete`.
- Node pinned: `"engines": { "node": "22.x" }` and `.nvmrc` = `22`.
- Every page usable at mobile width; labelled fields; visible focus.
- There is no test framework (deliberate — PRD §17 keeps deps modest). Verification per task = `npm run build`, `npm run lint`, and dev-server checks with `curl`/manual steps as written.
- Commit after every task. The repo is not yet a git repo — Task 1 initializes it.

---

### Task 1: Scaffold Next.js app, repo hygiene, MCP configs

**Files:**
- Create: entire Next.js scaffold at repo root (via `create-next-app`), `.nvmrc`, `.env.example`, `workshop-profile.md`, `.mcp.json` (moved from `mcp.json`), `.codex/config.toml` (moved from `codexconfig.toml`)
- Modify: `package.json` (engines), `.gitignore` (`!.env.example`), `app/globals.css` (force light theme)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a running Next.js app with npm scripts `dev`, `build`, `start`, `lint`; Tailwind configured; import alias `@/*`; git repo with initial commit

- [ ] **Step 1: Stash the three pre-existing files, scaffold, restore**

```bash
cd /home/maru/workshop/workshop-app
mkdir -p /tmp/claude-stash && mv WorkshopAppPRD.md mcp.json codexconfig.toml docs /tmp/claude-stash/
npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
mv /tmp/claude-stash/WorkshopAppPRD.md /tmp/claude-stash/docs . 
```

If `create-next-app` prompts anyway (flags drift), answer: TypeScript yes, ESLint yes, Tailwind yes, `src/` no, App Router yes, default import alias. If it offers Turbopack for dev, accept the default.

- [ ] **Step 2: Move MCP configs into their committed locations**

```bash
mkdir -p .codex
mv /tmp/claude-stash/mcp.json .mcp.json
mv /tmp/claude-stash/codexconfig.toml .codex/config.toml
```

- [ ] **Step 3: Pin Node and verify scripts**

In `package.json` add:

```json
"engines": { "node": "22.x" }
```

Create `.nvmrc` containing exactly:

```
22
```

Verify `package.json` has scripts `dev`, `build`, `start`, `lint`. If `lint` is missing (newer create-next-app versions omit it), add `"lint": "eslint ."` and confirm `eslint` + `eslint-config-next` are in devDependencies (create-next-app installs them when ESLint is selected).

- [ ] **Step 4: Create `.env.example` (names only) and fix `.gitignore`**

`.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In `.gitignore`, confirm `.env*` (or `.env.local`) is ignored and append below it:

```
!.env.example
```

- [ ] **Step 5: Create `workshop-profile.md`**

```markdown
# Workshop Profile

- **Name:** (your name here)
- **My app idea:** (one sentence — what will YOUR version of this app track?)
- **Status:** Ready to build
```

- [ ] **Step 6: Force a simple light theme in `app/globals.css`**

Replace the generated `:root`/dark-mode variable block so beginners see one predictable theme. Keep the Tailwind import line(s) exactly as generated, then reduce the rest to:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

(Delete any `@media (prefers-color-scheme: dark)` block and any `@theme inline` dark overrides; keep the `@theme inline` font/color token mapping if present, minus dark values.)

- [ ] **Step 7: Verify env-free dev, build, lint**

```bash
npm run build        # Expected: build succeeds, no env vars present
npm run lint         # Expected: no errors
npm run dev &        # then:
curl -s http://localhost:3000 | head -c 200   # Expected: HTML, HTTP 200
kill %1
```

- [ ] **Step 8: Init git and commit**

```bash
git init -b main
git add -A
git commit -m "chore: scaffold Next.js starter with MCP configs, env example, workshop profile"
```

---

### Task 2: Brand config, logo, BrandHeader

**Files:**
- Create: `lib/config/brand.ts`, `public/logo.svg`, `components/BrandHeader.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `brand` object `{ name: string; tagline: string; primaryColor: string; logo: string; showWorkshopBadge: boolean }` imported as `import { brand } from "@/lib/config/brand"`; `<BrandHeader />` default export, no props

- [ ] **Step 1: Create `lib/config/brand.ts`**

```ts
// ─────────────────────────────────────────────────────────────
// BRAND SETTINGS — this is the file to edit in Module 4.
// Change a value, save, and the whole app updates. Safe to edit:
// nothing here touches the database, auth, or dependencies.
// ─────────────────────────────────────────────────────────────
export const brand = {
  /** The app's name — shown in the header, homepage and browser tab. */
  name: "MyStuff",

  /** One-line tagline shown under the name on the homepage. */
  tagline: "Your private list of everything that matters.",

  /** Main accent color (any CSS color, e.g. "#4f46e5" or "rebeccapurple"). */
  primaryColor: "#4f46e5",

  /** Logo image in /public — swap the file or point to a new one. */
  logo: "/logo.svg",

  /** Toggle feature: show the workshop badge on the homepage. */
  showWorkshopBadge: true,
};
```

- [ ] **Step 2: Create `public/logo.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#4f46e5"/>
  <path d="M9 16.5l5 5 9-10" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 3: Create `components/BrandHeader.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";

/** Top navigation shown on the public pages (/, /login, /signup). */
export default function BrandHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
          style={{ color: brand.primaryColor }}
        >
          <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
          {brand.name}
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md px-3 py-1.5 font-medium text-white"
            style={{ backgroundColor: brand.primaryColor }}
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Use brand in the root layout metadata** — in `app/layout.tsx`, import `brand` and set:

```ts
export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
};
```

- [ ] **Step 5: Verify** — `npm run build && npm run lint`. Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: brand config, logo and BrandHeader"
```

---

### Task 3: Homepage (customizable landing page)

**Files:**
- Modify: `app/page.tsx` (full replacement)

**Interfaces:**
- Consumes: `brand` from Task 2, `<BrandHeader />` from Task 2
- Produces: the `/` route — fully static, env-free

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";
import { brand } from "@/lib/config/brand";

// ─────────────────────────────────────────────────────────────
// HOMEPAGE CONTENT — safe to customize in Module 4.
// Edit the words below, or reorder the sections in SECTION_ORDER.
// ─────────────────────────────────────────────────────────────

const headline = "Keep track of the stuff that matters.";
const subcopy =
  "A private list that's yours alone. Add notes, ideas and reminders — they're saved securely and only you can see them.";

const howItWorks = [
  { title: "1. Create an account", text: "Sign up with just an email and a password." },
  { title: "2. Add your items", text: "Notes, ideas, tasks — anything you want to keep." },
  { title: "3. Come back anytime", text: "Your list is saved in the cloud, private to you." },
];

// Reorder these to change the page layout (Module 4 layout edit).
const SECTION_ORDER = ["hero", "how-it-works", "cta"] as const;

// ─────────────────────────────────────────────────────────────

type SectionId = (typeof SECTION_ORDER)[number];

const sections: Record<SectionId, React.ReactNode> = {
  hero: (
    <section key="hero" className="px-4 py-16 text-center">
      {brand.showWorkshopBadge && (
        <span className="mb-4 inline-block rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600">
          Built at the TimeTec AI Workshop
        </span>
      )}
      <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        {headline}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">{subcopy}</p>
      <p className="mt-2 text-sm font-medium" style={{ color: brand.primaryColor }}>
        {brand.tagline}
      </p>
    </section>
  ),
  "how-it-works": (
    <section key="how-it-works" className="px-4 py-12">
      <h2 className="text-center text-2xl font-semibold">How it works</h2>
      <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
        {howItWorks.map((step) => (
          <div key={step.title} className="rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  ),
  cta: (
    <section key="cta" className="px-4 py-16 text-center">
      <h2 className="text-2xl font-semibold">Ready to start?</h2>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-md px-5 py-2.5 font-medium text-white"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Create your account
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>
    </section>
  ),
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main>{SECTION_ORDER.map((id) => sections[id])}</main>
      <footer className="border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        {brand.name} — {brand.tagline}
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify env-free rendering**

```bash
npm run build && npm run lint    # Expected: pass
npm run dev &
curl -s http://localhost:3000 | grep -o "Keep track of the stuff that matters."   # Expected: match
kill %1
```

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: customizable landing page"`

---

### Task 4: Guarded Supabase clients + middleware

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts` (repo root; if the scaffold used a `src/` dir — it should not have — keep next to `app/`)
- Modify: `package.json` (new deps)

**Interfaces:**
- Consumes: env var names from Global Constraints
- Produces:
  - `isSupabaseConfigured(): boolean` and `getSupabaseBrowserClient(): SupabaseClient | null` from `@/lib/supabase/client`
  - `getSupabaseServerClient(): Promise<SupabaseClient | null>` from `@/lib/supabase/server`

- [ ] **Step 1: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create `lib/supabase/client.ts`**

```ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True once BOTH public env vars exist. Until Module 5 supplies them,
 * every page must render a friendly "not connected" state instead of crashing.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

let browserClient: SupabaseClient | null = null;

/** Browser Supabase client. Returns null when the backend isn't connected yet. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  browserClient ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  return browserClient;
}
```

- [ ] **Step 3: Create `lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Server Supabase client (reads the auth session from cookies).
 *  Returns null when the backend isn't connected yet. */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore; the
          // middleware refreshes sessions instead.
        }
      },
    },
  });
}
```

- [ ] **Step 4: Create `middleware.ts` (session refresh for the protected area)**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase session cookie on protected routes.
 *  Does nothing (and never crashes) while env vars are missing. */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser(); // refreshes the token if it expired
  return response;
}

export const config = { matcher: ["/app/:path*"] };
```

- [ ] **Step 5: Verify env-free** — `npm run build && npm run lint`. Expected: pass with no env vars set.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: guarded Supabase browser/server clients and session middleware"`

---

### Task 5: BackendNotConnected + login and signup pages

**Files:**
- Create: `components/BackendNotConnected.tsx`, `components/LoginForm.tsx`, `components/SignupForm.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`

**Interfaces:**
- Consumes: `getSupabaseBrowserClient`, `isSupabaseConfigured` (Task 4), `<BrandHeader />`, `brand` (Task 2)
- Produces: `/login` and `/signup` routes; `<BackendNotConnected />` (no props) reused by Task 7; login page accepts `?error=confirm` (used by Task 6)

- [ ] **Step 1: Create `components/BackendNotConnected.tsx`**

```tsx
/** Friendly placeholder shown wherever Supabase isn't connected yet (Modules 1–4). */
export default function BackendNotConnected() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Backend not connected yet</p>
      <p className="mt-1">
        This will work in Module 5: add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code>, then
        restart the dev server.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/LoginForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import BackendNotConnected from "./BackendNotConnected";

export default function LoginForm({ confirmError = false }: { confirmError?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    confirmError ? "That confirmation link didn't work. Try signing in, or sign up again." : null
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return; // banner above already explains
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("Sign-in failed. Check your email and password and try again.");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-sm px-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      {!isSupabaseConfigured() && (
        <div className="mt-4">
          <BackendNotConnected />
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: brand.primaryColor }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        No account yet?{" "}
        <a href="/signup" className="underline" style={{ color: brand.primaryColor }}>
          Sign up
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/SignupForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import BackendNotConnected from "./BackendNotConnected";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl}/auth/confirm` },
    });
    setBusy(false);
    if (error) {
      setError("Sign-up failed. Try a different email or a longer password.");
      return;
    }
    if (data.session) {
      // Email confirmation is OFF (the workshop default) — signed in already.
      router.push("/app");
      router.refresh();
    } else {
      // Email confirmation is ON — tell the user to check their inbox.
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="mx-auto mt-12 w-full max-w-sm px-4">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-3 text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish
          creating your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-sm px-4">
      <h1 className="text-2xl font-bold">Create your account</h1>
      {!isSupabaseConfigured() && (
        <div className="mt-4">
          <BackendNotConnected />
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password <span className="font-normal text-gray-500">(at least 8 characters)</span>
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: brand.primaryColor }}
        >
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="underline" style={{ color: brand.primaryColor }}>
          Sign in
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/login/page.tsx`** (server wrapper so `?error=confirm` needs no Suspense)

```tsx
import BrandHeader from "@/components/BrandHeader";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <LoginForm confirmError={error === "confirm"} />
    </div>
  );
}
```

- [ ] **Step 5: Create `app/signup/page.tsx`**

```tsx
import BrandHeader from "@/components/BrandHeader";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <SignupForm />
    </div>
  );
}
```

- [ ] **Step 6: Verify env-free**

```bash
npm run build && npm run lint    # Expected: pass
npm run dev &
curl -s http://localhost:3000/login | grep -o "Backend not connected yet"    # Expected: match
curl -s http://localhost:3000/signup | grep -o "Create your account"          # Expected: match
kill %1
```

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: login and signup pages with guarded backend state"`

---

### Task 6: Auth confirm route

**Files:**
- Create: `app/auth/confirm/route.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient` (Task 4); `/login?error=confirm` handling (Task 5)
- Produces: GET `/auth/confirm` — verifies the email OTP and redirects to `/app` (success) or `/login?error=confirm` (failure)

- [ ] **Step 1: Create `app/auth/confirm/route.ts`**

```ts
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Handles the link from Supabase confirmation emails.
 *  With email confirmation OFF (the workshop default) this is rarely hit,
 *  but it must exist so the ON case also works. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await getSupabaseServerClient();
  if (!supabase || !tokenHash || !type) {
    return NextResponse.redirect(`${siteUrl}/login?error=confirm`);
  }

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  return NextResponse.redirect(error ? `${siteUrl}/login?error=confirm` : `${siteUrl}/app`);
}
```

- [ ] **Step 2: Verify** — `npm run build && npm run lint` (expected: pass), then:

```bash
npm run dev &
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/auth/confirm
# Expected: 307 (or 308) redirecting to http://localhost:3000/login?error=confirm
kill %1
```

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: auth email-confirmation callback route"`

---

### Task 7: Protected `/app` page with CRUD

**Files:**
- Create: `app/app/page.tsx`, `components/ItemsClient.tsx`, `components/ItemForm.tsx`, `components/ItemCard.tsx`

**Interfaces:**
- Consumes: `getSupabaseServerClient` (Task 4), `getSupabaseBrowserClient` (Task 4), `brand` (Task 2), `<BackendNotConnected />` (Task 5)
- Produces: `/app` route (server-protected); `Item` type `{ id: string; title: string; body: string | null; created_at: string }` exported from `components/ItemsClient.tsx`

- [ ] **Step 1: Create `app/app/page.tsx`** (server-side protection — the real gate)

```tsx
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import BrandHeader from "@/components/BrandHeader";
import BackendNotConnected from "@/components/BackendNotConnected";
import ItemsClient from "@/components/ItemsClient";

export default async function AppPage() {
  const supabase = await getSupabaseServerClient();

  // Modules 1–4: no backend yet — show the page shell, not a crash.
  if (!supabase) {
    return (
      <div className="min-h-screen bg-white">
        <BrandHeader />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-bold">Your items</h1>
          <div className="mt-4">
            <BackendNotConnected />
          </div>
        </main>
      </div>
    );
  }

  // Identity is verified ON THE SERVER — signed-out visitors never see this page.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ItemsClient userId={user.id} userEmail={user.email ?? ""} />;
}
```

- [ ] **Step 2: Create `components/ItemsClient.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import ItemForm from "./ItemForm";
import ItemCard from "./ItemCard";

export type Item = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
};

export default function ItemsClient({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("items")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setError("Couldn't load your items. Refresh the page to try again.");
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function handleCreate(title: string, body: string) {
    if (!supabase) return "Backend not connected.";
    // user_id comes from the server-verified session — NEVER from the form.
    const { error } = await supabase
      .from("items")
      .insert({ user_id: userId, title, body: body || null });
    if (error) return "Couldn't save that item. Please try again.";
    await loadItems(); // re-read from the database: what you see is what's saved
    return null;
  }

  async function handleUpdate(id: string, title: string, body: string) {
    if (!supabase) return "Backend not connected.";
    const { error } = await supabase
      .from("items")
      .update({ title, body: body || null })
      .eq("id", id);
    if (error) return "Couldn't update that item. Please try again.";
    await loadItems();
    return null;
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    await supabase.from("items").delete().eq("id", id);
    await loadItems();
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: brand.primaryColor }}
          >
            <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
            {brand.name}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">Your items</h1>
        <div className="mt-6">
          <ItemForm onSubmit={handleCreate} />
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
              No items yet — add your first.
            </p>
          ) : (
            items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/ItemForm.tsx`** (create form + shared validation messages)

```tsx
"use client";

import { useState } from "react";
import { brand } from "@/lib/config/brand";

export const TITLE_MAX = 120;
export const BODY_MAX = 2000;

/** Returns a friendly error message, or null when the input is valid. */
export function validateItem(title: string, body: string): string | null {
  if (title.trim().length === 0) return "Please give your item a title.";
  if (title.length > TITLE_MAX) return `Keep the title under ${TITLE_MAX} characters.`;
  if (body.length > BODY_MAX) return `Keep the note under ${BODY_MAX} characters.`;
  return null;
}

export default function ItemForm({
  onSubmit,
}: {
  onSubmit: (title: string, body: string) => Promise<string | null>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateItem(title, body);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const submitError = await onSubmit(title.trim(), body.trim());
    setBusy(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    setTitle("");
    setBody("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-gray-200 p-4"
    >
      <div>
        <label htmlFor="new-title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="new-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Passport renewal"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      <div>
        <label htmlFor="new-body" className="block text-sm font-medium">
          Note <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="new-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Any details you want to remember"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: brand.primaryColor }}
      >
        {busy ? "Adding…" : "Add item"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create `components/ItemCard.tsx`** (inline edit + two-step delete confirm)

```tsx
"use client";

import { useState } from "react";
import { brand } from "@/lib/config/brand";
import type { Item } from "./ItemsClient";
import { validateItem } from "./ItemForm";

export default function ItemCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: Item;
  onUpdate: (id: string, title: string, body: string) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    const invalid = validateItem(title, body);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const saveError = await onUpdate(item.id, title.trim(), body.trim());
    setBusy(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-3 rounded-xl border border-gray-300 p-4">
        <div>
          <label htmlFor={`title-${item.id}`} className="block text-sm font-medium">
            Title
          </label>
          <input
            id={`title-${item.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        <div>
          <label htmlFor={`body-${item.id}`} className="block text-sm font-medium">
            Note
          </label>
          <textarea
            id={`body-${item.id}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={busy}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: brand.primaryColor }}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setTitle(item.title);
              setBody(item.body ?? "");
              setError(null);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* User text is rendered as plain text (React escapes it) — data, not markup. */}
          <h2 className="break-words font-semibold">{item.title}</h2>
          {item.body && (
            <p className="mt-1 break-words whitespace-pre-wrap text-sm text-gray-600">
              {item.body}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(item.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 text-sm">
          {confirmingDelete ? (
            <>
              <button
                onClick={() => onDelete(item.id)}
                className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white"
              >
                Really delete?
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700"
              >
                Keep
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify env-free**

```bash
npm run build && npm run lint    # Expected: pass
npm run dev &
curl -s http://localhost:3000/app | grep -o "Backend not connected yet"   # Expected: match
kill %1
```

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: server-protected /app page with user-owned CRUD"`

---

### Task 8: Supabase schema SQL

**Files:**
- Create: `supabase/workshop-schema.sql`

**Interfaces:**
- Consumes: nothing (run by participants in the Supabase SQL editor in Module 5)
- Produces: `public.items` table matching the `Item` type from Task 7 plus `user_id`/`updated_at`; RLS enabled; four owner-scoped policies

- [ ] **Step 1: Create `supabase/workshop-schema.sql`**

```sql
-- ════════════════════════════════════════════════════════════════
-- MyStuff workshop schema (Module 5)
-- Run this ONCE in your Supabase project's SQL editor.
-- Safe to re-run by accident: every statement is guarded.
-- Contains NO destructive statements (no drop / truncate / delete).
-- ════════════════════════════════════════════════════════════════

-- 1) The items table — one row per note, owned by exactly one user.
--    user_id is the owner column: it links each row to a signed-in user.
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  body       text check (body is null or char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Speeds up "list MY items, newest first" — exactly what the app does.
create index if not exists items_user_created_idx
  on public.items (user_id, created_at desc);

-- 2) Row Level Security: the DATABASE enforces "you only touch your own
--    rows". Even a modified app or a direct API call cannot cross users.
alter table public.items enable row level security;

-- 3) Four policies: read, create, edit, delete — each limited to the owner.
--    auth.uid() is the id of whoever is signed in right now.
do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_select_own') then
    create policy items_select_own on public.items
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_insert_own') then
    create policy items_insert_own on public.items
      for insert with check (auth.uid() = user_id);
  end if;

  -- update checks BOTH the old row (using) and the new row (with check),
  -- so nobody can re-assign an item to another user.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_update_own') then
    create policy items_update_own on public.items
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'items'
                   and policyname = 'items_delete_own') then
    create policy items_delete_own on public.items
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 4) Keep updated_at fresh whenever a row is edited.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();
```

- [ ] **Step 2: Verify the file contains no destructive statements**

```bash
grep -inE "drop |truncate|delete from|security definer|service_role" supabase/workshop-schema.sql
# Expected: no output (exit code 1)
```

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: workshop schema with RLS owner policies"`

---

### Task 9: The three Claude Code skills

**Files:**
- Create: `.claude/skills/customize-app/SKILL.md`, `.claude/skills/review-security/SKILL.md`, `.claude/skills/prepare-deployment/SKILL.md`

**Interfaces:**
- Consumes: file paths established in Tasks 2–8 (`lib/config/brand.ts`, `app/page.tsx`, `supabase/workshop-schema.sql`, `.env.example`)
- Produces: three project skills discoverable by Claude Code as `/customize-app`, `/review-security`, `/prepare-deployment`

- [ ] **Step 1: Create `.claude/skills/customize-app/SKILL.md`**

```markdown
---
name: customize-app
description: Plan and apply a safe, visible, reversible customization of this workshop app (branding, homepage copy, section order, or the workshop-badge toggle). Never touches the database, auth, or dependencies.
---

# Customize App

You are helping a workshop participant personalize this starter app. Changes must be
SMALL, VISIBLE in the browser, and REVERSIBLE with a single `git checkout`.

## Allowed customization surface (nothing else)

1. **Branding** — `lib/config/brand.ts`: app name, tagline, primaryColor, logo path,
   `showWorkshopBadge` toggle. A new logo goes in `public/`.
2. **Homepage content** — `app/page.tsx`: the `headline`, `subcopy` and `howItWorks`
   text near the top of the file.
3. **Homepage layout** — `app/page.tsx`: reorder the entries in `SECTION_ORDER`.

## Hard rules

- NEVER edit anything under `lib/supabase/`, `app/app/`, `app/auth/`, `middleware.ts`,
  `supabase/`, `.env*`, `package.json`, or `package-lock.json`.
- NEVER add, remove, or update a dependency.
- Keep each change a small diff the participant can read in one sentence.

## Process

1. Read `lib/config/brand.ts` and `app/page.tsx` first — ground every suggestion in
   what is actually there.
2. Ask what the participant wants their app to be about, then propose 2–3 concrete
   options within the allowed surface (exact file + exact values).
3. Apply the chosen change only after they pick one.
4. Verify: `npm run build` and `npm run lint` must still pass. Tell them to check the
   result in the browser at desktop AND narrow/mobile width.
5. Show them the diff (`git diff`) and explain it in plain English, one sentence per file.
```

- [ ] **Step 2: Create `.claude/skills/review-security/SKILL.md`**

```markdown
---
name: review-security
description: Read-only security review of this workshop app. Reports BLOCKER / WARNING / PASS findings with file-level evidence, and states its own limits. Makes no changes.
---

# Review Security

You are performing a READ-ONLY security review of this workshop app. Do not edit any
file. Output a short report: each finding is BLOCKER, WARNING, or PASS, with the file
path (and line where useful) as evidence.

## Checklist

1. **Secrets** — Search the tracked files for secret-shaped strings: `sb_secret_`,
   `service_role`, `SUPABASE_SERVICE`, private keys, DB passwords.
   The publishable key and project URL in the browser bundle are PUBLIC BY DESIGN — not findings.
   `.env.local` must be git-ignored and untracked (`git status`, `.gitignore`).
2. **RLS** — `supabase/workshop-schema.sql` must enable row level security on
   `public.items` and define owner-scoped policies for select, insert, update AND
   delete (`auth.uid() = user_id`; update needs both `using` and `with check`).
3. **Server-side protection** — `app/app/page.tsx` must verify the user on the server
   (`supabase.auth.getUser()`) and `redirect("/login")` when signed out. Hiding UI is
   not protection.
4. **Ownership on insert** — the insert in `components/ItemsClient.tsx` must set
   `user_id` from the verified session, never from a form field.
5. **Untrusted content stays data** — no `dangerouslySetInnerHTML` (or similar raw-HTML
   rendering) on user-entered content anywhere under `app/` or `components/`.
6. **Input validation** — empty titles rejected, length limits enforced in the UI
   (`components/ItemForm.tsx`) AND in the database (`check` constraints in the schema).
7. **Safe errors** — user-facing error messages must not leak stack traces, tokens,
   or SQL.
8. **Least-privilege MCP** — `.mcp.json` and `.codex/config.toml` list only github,
   supabase (with `read_only=true`), and vercel.

## Report format

- Start with a one-line verdict: "READY" (no BLOCKERs) or "NOT READY (n blockers)".
- List findings grouped by severity, each with evidence.
- End with **Limits of this review**: static reading only — it cannot prove RLS is
  enabled in the participant's actual Supabase project, so the live two-account test
  (Module 6) is still required.
```

- [ ] **Step 3: Create `.claude/skills/prepare-deployment/SKILL.md`**

```markdown
---
name: prepare-deployment
description: Read-only deployment-readiness review before deploying to Vercel (Module 7). Confirms the commit is pushed, build passes, env var names are right, and walks the production checklist. Makes no changes.
---

# Prepare Deployment

You are checking whether this app is ready to deploy to Vercel Hobby. READ-ONLY: do
not edit files, do not run the deployment. Report each check as ✅ or ❌ with evidence.

## Checks

1. **Clean and pushed** — `git status` is clean; the current commit exists on the
   GitHub remote (`git log origin/main..HEAD` shows nothing, or state what's unpushed).
2. **Build and lint pass locally** — run `npm run build` and `npm run lint`; both must
   succeed on this exact commit.
3. **No secrets going out** — `.env.local` untracked; no secret-shaped string in
   tracked files; only `NEXT_PUBLIC_*` vars are referenced by the app.
4. **Env vars for Vercel** — the participant must set exactly these in the Vercel
   project settings (values from their own Supabase project / production URL):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → their `https://<project>.vercel.app` URL
5. **Node version** — `package.json` `engines` pins Node 22; Vercel project should use it.

## Production checklist to hand the participant

1. Import the GitHub fork into Vercel (framework preset: Next.js, defaults are fine).
2. Add the three env vars above BEFORE the first deploy.
3. Deploy, then open the `*.vercel.app` URL — homepage must render.
4. In Supabase: Authentication → URL Configuration → set Site URL (and redirect URLs)
   to the production URL. Sign-up/sign-in on production works only after this.
5. Re-run the two-account test against the PRODUCTION URL.
```

- [ ] **Step 4: Verify discovery** — `ls .claude/skills/*/SKILL.md` shows all three files; each file's frontmatter has `name` and `description`.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: workshop skills - customize-app, review-security, prepare-deployment"`

---

### Task 10: README + full acceptance pass

**Files:**
- Modify: `README.md` (full replacement)

**Interfaces:**
- Consumes: everything above
- Produces: the finished starter repo, validated against PRD §4 success criteria that are checkable locally

- [ ] **Step 1: Replace `README.md`**

```markdown
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
```

- [ ] **Step 2: Full local acceptance pass (PRD §4, locally checkable items)**

```bash
rm -rf node_modules .next
npm ci                              # 1. installs from lockfile
npm run build && npm run lint       # 2. passes untouched, env-free
npm run dev &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000        # 200
curl -s http://localhost:3000/login  | grep -c "Backend not connected" # ≥1
curl -s http://localhost:3000/signup | grep -c "Sign up"               # ≥1
curl -s http://localhost:3000/app    | grep -c "Backend not connected" # ≥1
kill %1
git ls-files | xargs grep -lE "sb_secret_|service_role" ; echo "exit=$?"  # exit=123 or 1 (no hits)
git status --porcelain               # empty apart from this task's README change
ls .claude/skills/*/SKILL.md .mcp.json .codex/config.toml supabase/workshop-schema.sql workshop-profile.md .env.example
```

Expected: every command matches the annotated expectation. Any failure is a bug to fix before committing.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "docs: README with run instructions and module seams"`

- [ ] **Step 4: Report what needs a human/live environment** — tell the user these PRD §4 criteria still need live verification they must do (or grant access for): running the SQL on a real Supabase project, the two-account test with real accounts, and the Vercel deploy. Also ask whether `WorkshopAppPRD.md` and `docs/` should stay in the published starter repo or be removed before participants fork it.
