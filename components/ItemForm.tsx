"use client";

import { useState } from "react";
import { brand } from "@/lib/config/brand";
import {
  CATEGORIES,
  type Category,
  type ItemDraft,
  type Status,
} from "./ItemsClient";

export const TITLE_MAX = 120;
export const BODY_MAX = 2000;
export const LOCATION_MAX = 100;

const STATUSES: { id: Status; label: string }[] = [
  { id: "dreaming", label: "Dreaming" },
  { id: "planning", label: "Planning" },
  { id: "doing",    label: "Doing" },
  { id: "done",     label: "Done" },
];

/** Returns a friendly error message, or null when the input is valid. */
export function validateItem(
  title: string,
  body: string,
  location = "",
): string | null {
  if (title.trim().length === 0) return "Please give your adventure a title.";
  if (title.length > TITLE_MAX) return `Keep the title under ${TITLE_MAX} characters.`;
  if (body.length > BODY_MAX) return `Keep the note under ${BODY_MAX} characters.`;
  if (location.length > LOCATION_MAX)
    return `Keep the location under ${LOCATION_MAX} characters.`;
  return null;
}

export default function ItemForm({
  onSubmit,
}: {
  onSubmit: (draft: ItemDraft) => Promise<string | null>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [status, setStatus] = useState<Status>("dreaming");
  const [location, setLocation] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateItem(title, body, location);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const submitError = await onSubmit({
      title: title.trim(),
      body: body.trim(),
      category: category === "" ? null : category,
      status,
      location: location.trim(),
      target_date: targetDate,
    });
    setBusy(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    setTitle("");
    setBody("");
    setCategory("");
    setStatus("dreaming");
    setLocation("");
    setTargetDate("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="new-title" className="block text-sm font-medium">
          What are you chasing?
        </label>
        <input
          id="new-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. See the Northern Lights"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-2 focus:outline-offset-1 sm:text-sm"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="new-category" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="new-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-2 focus:outline-offset-1 sm:text-sm"
          >
            <option value="">— None —</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="new-status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="new-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-2 focus:outline-offset-1 sm:text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="new-location" className="block text-sm font-medium">
            Where <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="new-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Kyoto, Japan"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-2 focus:outline-offset-1 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="new-target" className="block text-sm font-medium">
            Target date <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="new-target"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-2 focus:outline-offset-1 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="new-body" className="block text-sm font-medium">
          Why this one? <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="new-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="What draws you to it?"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-2 focus:outline-offset-1 sm:text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full px-5 py-2.5 font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: brand.primaryColor }}
      >
        {busy ? "Adding…" : "Add to my list"}
      </button>
    </form>
  );
}
