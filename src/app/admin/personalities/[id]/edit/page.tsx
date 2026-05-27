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

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("order");

  let linkedCategoryIds: string[] = [];
  try {
    const { data: links } = await supabase
      .from("personality_categories")
      .select("category_id")
      .eq("personality_id", id);
    linkedCategoryIds = links?.map((l) => l.category_id) || [];
  } catch {
    // table peut ne pas exister
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
        linkedCategoryIds={linkedCategoryIds}
        timelineEvents={timelineEvents}
        mode="edit"
      />
    </div>
  );
}
