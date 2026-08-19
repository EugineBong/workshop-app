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
