"use client";

import { useState } from "react";
import { brand } from "@/lib/config/brand";
import {
  CATEGORIES,
  categoryMeta,
  type Category,
  type Item,
  type ItemDraft,
  type Status,
} from "./ItemsClient";
import { validateItem } from "./ItemForm";

const STATUS_STYLE: Record<Status, { label: string; bg: string; fg: string }> = {
  dreaming: { label: "Dreaming", bg: "#e5e7eb", fg: "#4b5563" },
  planning: { label: "Planning", bg: "#dbeafe", fg: "#1d4ed8" },
  doing:    { label: "Doing",    bg: "#fef3c7", fg: "#a16207" },
  done:     { label: "Done",     bg: "#d1fae5", fg: "#047857" },
};

const STATUSES: Status[] = ["dreaming", "planning", "doing", "done"];

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ItemCard({
  item,
  onUpdate,
  onDelete,
  onMarkDone,
}: {
  item: Item;
  onUpdate: (id: string, draft: ItemDraft) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
  onMarkDone: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body ?? "");
  const [category, setCategory] = useState<Category | "">(item.category ?? "");
  const [status, setStatus] = useState<Status>(item.status);
  const [location, setLocation] = useState(item.location ?? "");
  const [targetDate, setTargetDate] = useState(item.target_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cat = categoryMeta(item.category);
  const stripColor = cat?.color ?? "#cbd5e1";
  const isDone = item.status === "done";
  const statusStyle = STATUS_STYLE[item.status];

  async function handleSave() {
    const invalid = validateItem(title, body, location);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const saveError = await onUpdate(item.id, {
      title: title.trim(),
      body: body.trim(),
      category: category === "" ? null : category,
      status,
      location: location.trim(),
      target_date: targetDate,
    });
    setBusy(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
    setTitle(item.title);
    setBody(item.body ?? "");
    setCategory(item.category ?? "");
    setStatus(item.status);
    setLocation(item.location ?? "");
    setTargetDate(item.target_date ?? "");
    setError(null);
  }

  if (editing) {
    return (
      <div className="space-y-4 rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
        <div>
          <label htmlFor={`title-${item.id}`} className="block text-sm font-medium">
            Title
          </label>
          <input
            id={`title-${item.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`category-${item.id}`} className="block text-sm font-medium">
              Category
            </label>
            <select
              id={`category-${item.id}`}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "")}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
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
            <label htmlFor={`status-${item.id}`} className="block text-sm font-medium">
              Status
            </label>
            <select
              id={`status-${item.id}`}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_STYLE[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`location-${item.id}`} className="block text-sm font-medium">
              Where
            </label>
            <input
              id={`location-${item.id}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kyoto, Japan"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
            />
          </div>
          <div>
            <label htmlFor={`target-${item.id}`} className="block text-sm font-medium">
              Target date
            </label>
            <input
              id={`target-${item.id}`}
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`body-${item.id}`} className="block text-sm font-medium">
            Why this one?
          </label>
          <textarea
            id={`body-${item.id}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-offset-1"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: brand.primaryColor }}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            onClick={cancelEdit}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const targetLabel = formatDate(item.target_date);
  const createdLabel = new Date(item.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition"
      style={isDone ? { backgroundColor: "#faf6ef" } : undefined}
    >
      {/* Category color strip */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: stripColor }}
      />

      {/* CHASED stamp overlay */}
      {isDone && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-2 right-3 -rotate-12 rounded-md border-2 px-2 py-0.5 font-[family-name:var(--font-playfair)] text-xs font-black tracking-widest opacity-70"
          style={{ color: brand.primaryColor, borderColor: brand.primaryColor }}
        >
          CHASED ✓
        </div>
      )}

      <div className={`p-3.5 pl-4 ${isDone ? "opacity-80" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {cat && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                  style={{ backgroundColor: cat.color + "1a", color: cat.color }}
                >
                  {cat.label}
                </span>
              )}
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg }}
              >
                {statusStyle.label}
              </span>
            </div>
            {/* User text is rendered as plain text (React escapes it). */}
            <h2 className="mt-1 break-words font-[family-name:var(--font-playfair)] text-lg leading-snug font-bold">
              {item.title}
            </h2>

            {(item.location || targetLabel) && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
                {item.location && (
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>📍</span>
                    <span className="break-words">{item.location}</span>
                  </span>
                )}
                {targetLabel && (
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>📅</span>
                    {targetLabel}
                  </span>
                )}
              </div>
            )}

            {item.body && (
              <p className="mt-2 break-words whitespace-pre-wrap text-xs text-gray-700">
                {item.body}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {!isDone && (
            <button
              onClick={() => onMarkDone(item.id)}
              className="rounded-full px-3 py-1 text-xs font-semibold text-white hover:brightness-110"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Mark as done
            </button>
          )}
          {confirmingDelete ? (
            <>
              <button
                onClick={() => onDelete(item.id)}
                className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Really delete?
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700"
              >
                Keep
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs text-red-600 hover:bg-red-50"
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
