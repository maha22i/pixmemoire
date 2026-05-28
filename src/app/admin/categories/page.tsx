import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";

export default async function CategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from("categories").select("*").order("order"),
    supabase.from("subcategories").select("*").order("order"),
  ]);

  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, number> = {};

  try {
    const [{ data: catLinks }, { data: subLinks }] = await Promise.all([
      supabase.from("personality_categories").select("category_id"),
      supabase.from("personality_subcategories").select("subcategory_id"),
    ]);

    catLinks?.forEach((pc) => {
      categoryCounts[pc.category_id] = (categoryCounts[pc.category_id] || 0) + 1;
    });

    subLinks?.forEach((ps) => {
      subcategoryCounts[ps.subcategory_id] =
        (subcategoryCounts[ps.subcategory_id] || 0) + 1;
    });
  } catch {
    // tables peuvent ne pas exister avant migration
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Catégories</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Organisez les personnalités par catégories et sous-catégories.
          Mettez en avant une sous-catégorie pour l&apos;afficher sur l&apos;accueil.
        </p>
      </div>

      <CategoriesManager
        initialCategories={categories || []}
        initialSubcategories={subcategories || []}
        categoryCounts={categoryCounts}
        subcategoryCounts={subcategoryCounts}
      />
    </div>
  );
}
