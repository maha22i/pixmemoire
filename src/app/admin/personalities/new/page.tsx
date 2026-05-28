import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import PersonalityForm from "@/components/admin/personality/PersonalityForm";

export default async function NewPersonalityPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from("categories").select("*").order("order"),
    supabase.from("subcategories").select("*").order("order"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
        Nouvelle personnalité
      </h1>
      <PersonalityForm
        categories={categories || []}
        subcategories={subcategories || []}
        mode="create"
      />
    </div>
  );
}
