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
