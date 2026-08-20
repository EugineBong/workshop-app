"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import BackendNotConnected from "./BackendNotConnected";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const trimmedName = displayName.trim();
    if (trimmedName.length === 0) {
      setError("Please enter a display name.");
      return;
    }
    if (trimmedName.length > 60) {
      setError("Keep the display name under 60 characters.");
      return;
    }
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
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm`,
        data: { display_name: trimmedName },
      },
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
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Check your email
        </h1>
        <p className="mt-3 text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish
          creating your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-sm px-4">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
        Start your list.
      </h1>
      <p className="mt-1 text-sm text-gray-600">Free, private, yours alone.</p>
      {!isSupabaseConfigured() && (
        <div className="mt-4">
          <BackendNotConnected />
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="display-name" className="block text-sm font-medium">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            required
            maxLength={60}
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
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
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
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
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full px-4 py-2.5 font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
          style={{ backgroundColor: brand.primaryColor }}
        >
          {busy ? "Creating account…" : "Create my list"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="underline" style={{ color: brand.primaryColor }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
