"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import ItemForm from "./ItemForm";
import ItemCard from "./ItemCard";

export type Category =
  | "travel"
  | "skill"
  | "experience"
  | "creative"
  | "career"
  | "personal";

export type Status = "dreaming" | "planning" | "doing" | "done";

export type CategoryMeta = {
  id: Category;
  label: string;
  /** Poster-strip color for the card's left edge. */
  color: string;
};

export const CATEGORIES: CategoryMeta[] = [
  { id: "travel",     label: "Travel",     color: "#14b8a6" },
  { id: "skill",      label: "Skill",      color: "#f97316" },
  { id: "experience", label: "Experience", color: "#0ea5e9" },
  { id: "creative",   label: "Creative",   color: "#db2777" },
  { id: "career",     label: "Career",     color: "#059669" },
  { id: "personal",   label: "Personal",   color: "#78716c" },
];

export function categoryMeta(id: Category | null): CategoryMeta | null {
  if (!id) return null;
  return CATEGORIES.find((c) => c.id === id) ?? null;
}

export type Item = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  category: Category | null;
  status: Status;
  location: string | null;
  target_date: string | null;
  completed_at: string | null;
};

export type ItemDraft = {
  title: string;
  body: string;
  category: Category | null;
  status: Status;
  location: string;
  target_date: string;
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
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  const loadItems = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("items")
      .select(
        "id, title, body, created_at, category, status, location, target_date, completed_at",
      )
      .order("created_at", { ascending: false });
    if (error) {
      setError("Couldn't load your list. Refresh the page to try again.");
    } else {
      setItems((data ?? []) as Item[]);
      setError(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    void loadItems();
  }, [loadItems]);

  async function handleCreate(draft: ItemDraft) {
    if (!supabase) return "Backend not connected.";
    // user_id comes from the server-verified session — NEVER from the form.
    const { error } = await supabase.from("items").insert({
      user_id: userId,
      title: draft.title,
      body: draft.body || null,
      category: draft.category,
      status: draft.status,
      location: draft.location || null,
      target_date: draft.target_date || null,
      completed_at: draft.status === "done" ? new Date().toISOString() : null,
    });
    if (error) return "Couldn't save that adventure. Please try again.";
    await loadItems();
    return null;
  }

  async function handleUpdate(id: string, draft: ItemDraft) {
    if (!supabase) return "Backend not connected.";
    const existing = items.find((i) => i.id === id);
    const completed_at =
      draft.status === "done"
        ? existing?.completed_at ?? new Date().toISOString()
        : null;
    const { error } = await supabase
      .from("items")
      .update({
        title: draft.title,
        body: draft.body || null,
        category: draft.category,
        status: draft.status,
        location: draft.location || null,
        target_date: draft.target_date || null,
        completed_at,
      })
      .eq("id", id);
    if (error) return "Couldn't update that adventure. Please try again.";
    await loadItems();
    return null;
  }

  async function handleMarkDone(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from("items")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setError("Couldn't mark that as done. Please try again.");
      return;
    }
    setError(null);
    await loadItems();
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      setError("Couldn't delete that adventure. Please try again.");
      return;
    }
    setError(null);
    await loadItems();
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const doneCount = useMemo(
    () => items.filter((i) => i.status === "done").length,
    [items],
  );

  const filteredItems = useMemo(
    () =>
      categoryFilter === "all"
        ? items
        : items.filter((i) => i.category === categoryFilter),
    [items, categoryFilter],
  );

  const progressPct = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);

  return (
    <div
      className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden"
      style={{ backgroundColor: brand.backgroundColor }}
    >
      <header className="shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full items-center justify-between px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight"
            style={{ color: brand.primaryColor }}
          >
            <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
            <span>{brand.name}</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col md:min-h-0 md:flex-row md:overflow-hidden">
        {/* LEFT — Add form */}
        <aside className="shrink-0 border-b border-gray-200 bg-white md:w-[400px] md:border-r md:border-b-0 md:overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight sm:text-2xl">
              Add an adventure
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              What&apos;s the next thing you want to chase?
            </p>
            <div className="mt-4 sm:mt-5">
              <ItemForm onSubmit={handleCreate} />
            </div>
          </div>
        </aside>

        {/* RIGHT — Progress + filters + list */}
        <section className="flex flex-1 flex-col md:min-h-0 md:overflow-hidden">
          {/* Top strip: progress + filter chips */}
          <div className="shrink-0 border-b border-gray-200 bg-white/60 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-700">
                <span
                  className="font-[family-name:var(--font-playfair)] text-xl font-bold"
                  style={{ color: brand.primaryColor }}
                >
                  {doneCount}
                </span>{" "}
                of {items.length} chased
              </p>
              <p className="text-xs text-gray-500">{progressPct}%</p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${brand.accentColor}, ${brand.primaryColor})`,
                }}
              />
            </div>

            {items.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <FilterChip
                  active={categoryFilter === "all"}
                  onClick={() => setCategoryFilter("all")}
                  label={`All (${items.length})`}
                />
                {CATEGORIES.map((cat) => {
                  const count = items.filter((i) => i.category === cat.id).length;
                  if (count === 0) return null;
                  return (
                    <FilterChip
                      key={cat.id}
                      active={categoryFilter === cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      label={`${cat.label} (${count})`}
                      color={cat.color}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Scrollable card list */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 md:min-h-0">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading ? (
              <p className="text-gray-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white/50 p-8 text-center text-gray-500">
                No adventures yet — add your first on the left.
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white/50 p-8 text-center text-gray-500">
                Nothing in this category yet.
              </p>
            ) : (
              filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onMarkDone={handleMarkDone}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs font-medium transition"
      style={{
        borderColor: active ? color ?? brand.primaryColor : "#e5e7eb",
        backgroundColor: active ? (color ?? brand.primaryColor) + "18" : "white",
        color: active ? color ?? brand.primaryColor : "#4b5563",
      }}
    >
      {label}
    </button>
  );
}
