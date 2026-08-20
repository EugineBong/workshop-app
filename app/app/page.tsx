import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import BrandHeader from "@/components/BrandHeader";
import BackendNotConnected from "@/components/BackendNotConnected";
import ItemsClient from "@/components/ItemsClient";
import { brand } from "@/lib/config/brand";

export default async function AppPage() {
  const supabase = await getSupabaseServerClient();

  // Modules 1–4: no backend yet — show the page shell, not a crash.
  if (!supabase) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: brand.backgroundColor }}>
        <BrandHeader />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Your bucket list
          </h1>
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
