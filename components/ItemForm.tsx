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
