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
