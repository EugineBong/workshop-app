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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
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
