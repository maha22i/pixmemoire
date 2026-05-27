import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";

export default async function CategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("order");

  const categoryCounts: Record<string, number> = {};
  try {
    const { data } = await supabase
      .from("personality_categories")
      .select("category_id");

    data?.forEach((pc) => {
      categoryCounts[pc.category_id] = (categoryCounts[pc.category_id] || 0) + 1;
    });
  } catch {
    // gestion silencieuse
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Catégories</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Organisez les personnalités par domaine.
        </p>
      </div>

      <CategoriesManager
        initialCategories={categories || []}
        categoryCounts={categoryCounts}
      />
    </div>
  );
}
