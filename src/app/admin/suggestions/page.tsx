import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import SuggestionsManager from "@/components/admin/suggestions/SuggestionsManager";

export default async function SuggestionsPage() {
  await requireAdmin();
  const supabase = await createClient();

  let suggestions: Array<{
    id: string;
    type: string;
    personality_id: string | null;
    submitter_name: string;
    submitter_email: string;
    message: string;
    status: string;
    created_at: string;
  }> = [];

  try {
    const { data } = await supabase
      .from("suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    suggestions = data || [];
  } catch {
    // table peut ne pas exister
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Suggestions</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Modérez les suggestions envoyées par les visiteurs.
        </p>
      </div>

      <SuggestionsManager initialSuggestions={suggestions} />
    </div>
  );
}
