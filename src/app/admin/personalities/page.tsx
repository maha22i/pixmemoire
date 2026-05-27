import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import PersonalitiesTable from "@/components/admin/tables/PersonalitiesTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function PersonalitiesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: personalities } = await supabase
    .from("personalities")
    .select("*")
    .order("created_at", { ascending: false });

  let categories: Array<{ id: string; name: string; slug: string; icon: string; color: string }> = [];
  try {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, icon, color")
      .order("order");
    categories = data || [];
  } catch {
    // gestion silencieuse
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Personnalités</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Gérez toutes les personnalités de la plateforme.
          </p>
        </div>
        <Link
          href="/admin/personalities/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] text-white text-sm font-medium rounded-lg hover:bg-[#E09010] transition-colors"
        >
          <Plus size={16} />
          Nouvelle personnalité
        </Link>
      </div>

      <PersonalitiesTable
        personalities={personalities || []}
        categories={categories}
      />
    </div>
  );
}
