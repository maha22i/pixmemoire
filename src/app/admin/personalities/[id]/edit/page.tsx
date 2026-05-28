import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import PersonalityForm from "@/components/admin/personality/PersonalityForm";

interface EditPersonalityPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPersonalityPage({
  params,
}: EditPersonalityPageProps) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createClient();

  const { data: personality, error } = await supabase
    .from("personalities")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !personality) {
    notFound();
  }

  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from("categories").select("*").order("order"),
    supabase.from("subcategories").select("*").order("order"),
  ]);

  let linkedCategoryIds: string[] = [];
  let linkedSubcategories: { subcategory_id: string; order: number }[] = [];

  try {
    const [{ data: catLinks }, { data: subLinks }] = await Promise.all([
      supabase
        .from("personality_categories")
        .select("category_id")
        .eq("personality_id", id),
      supabase
        .from("personality_subcategories")
        .select("subcategory_id, order")
        .eq("personality_id", id),
    ]);

    const subCatParentIds = new Set(
      (subLinks ?? [])
        .map((l) =>
          subcategories?.find((s) => s.id === l.subcategory_id)?.category_id
        )
        .filter(Boolean)
    );

    linkedCategoryIds =
      catLinks
        ?.map((l) => l.category_id)
        .filter((catId) => !subCatParentIds.has(catId)) || [];

    linkedSubcategories =
      subLinks?.map((l) => ({
        subcategory_id: l.subcategory_id,
        order: l.order,
      })) || [];
  } catch {
    // tables peuvent ne pas exister avant migration
  }

  let timelineEvents: Array<{
    id: string;
    event_date: string;
    title: string;
    description: string;
    order: number;
  }> = [];
  try {
    const { data } = await supabase
      .from("timeline_events")
      .select("*")
      .eq("personality_id", id)
      .order("order");
    timelineEvents = data || [];
  } catch {
    // table peut ne pas exister
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
        Modifier : {personality.full_name}
      </h1>
      <PersonalityForm
        personality={personality}
        categories={categories || []}
        subcategories={subcategories || []}
        linkedCategoryIds={linkedCategoryIds}
        linkedSubcategories={linkedSubcategories}
        timelineEvents={timelineEvents}
        mode="edit"
      />
    </div>
  );
}
