import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import FeaturedPersonalitiesManager from "@/components/admin/featured/FeaturedPersonalitiesManager";

export default async function ALaUnePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: published } = await supabase
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .order("full_name");

  const { data: featured } = await supabase
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("featured_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">À la une</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Choisissez jusqu&apos;à 6 personnalités affichées dans la section
          « Personnalités emblématiques » sur la page d&apos;accueil.
        </p>
      </div>

      <FeaturedPersonalitiesManager
        publishedPersonalities={published || []}
        initialFeatured={featured || []}
      />
    </div>
  );
}
