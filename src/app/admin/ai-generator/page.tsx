import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import AIGeneratorPage from "@/components/admin/ai/AIGeneratorPage";

export const metadata = {
  title: "Générateur IA — PixMémoire Admin",
};

export default async function Page() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true });

  const { data: settings } = await supabase
    .from("ai_settings")
    .select("default_model, is_enabled")
    .limit(1)
    .single();

  return (
    <AIGeneratorPage
      categories={categories || []}
      defaultModel={settings?.default_model || "claude-sonnet-4-6"}
      isEnabled={settings?.is_enabled !== false}
    />
  );
}
