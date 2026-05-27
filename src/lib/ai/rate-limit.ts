import { createClient } from "@/lib/supabase/server";
import type { AISettings } from "@/types/ai.types";

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

export async function checkRateLimit(
  adminId: string,
  role: string
): Promise<RateLimitResult> {
  if (role === "super_admin") {
    return { allowed: true };
  }

  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("ai_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings) {
    return { allowed: true };
  }

  const s = settings as AISettings;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: hourlyCount } = await supabase
    .from("ai_generations")
    .select("id", { count: "exact", head: true })
    .eq("admin_id", adminId)
    .gte("created_at", oneHourAgo);

  if ((hourlyCount || 0) >= s.hourly_limit_per_user) {
    return {
      allowed: false,
      reason: `Limite horaire atteinte (${s.hourly_limit_per_user} générations/heure). Réessayez plus tard.`,
    };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: dailyCount } = await supabase
    .from("ai_generations")
    .select("id", { count: "exact", head: true })
    .eq("admin_id", adminId)
    .gte("created_at", startOfDay.toISOString());

  if ((dailyCount || 0) >= s.daily_limit_per_user) {
    return {
      allowed: false,
      reason: `Limite quotidienne atteinte (${s.daily_limit_per_user} générations/jour). Réessayez demain.`,
    };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyGens } = await supabase
    .from("ai_generations")
    .select("cost_estimate")
    .gte("created_at", startOfMonth.toISOString());

  const monthlySpend = (monthlyGens || []).reduce(
    (sum, g) => sum + (Number(g.cost_estimate) || 0),
    0
  );

  if (monthlySpend >= s.monthly_budget_usd) {
    return {
      allowed: false,
      reason: `Budget mensuel global épuisé ($${monthlySpend.toFixed(2)} / $${s.monthly_budget_usd}). Contactez le super admin.`,
    };
  }

  const { data: userMonthlyGens } = await supabase
    .from("ai_generations")
    .select("cost_estimate")
    .eq("admin_id", adminId)
    .gte("created_at", startOfMonth.toISOString());

  const userSpend = (userMonthlyGens || []).reduce(
    (sum, g) => sum + (Number(g.cost_estimate) || 0),
    0
  );

  if (userSpend >= s.per_user_budget_usd) {
    return {
      allowed: false,
      reason: `Votre budget mensuel est épuisé ($${userSpend.toFixed(2)} / $${s.per_user_budget_usd}). Contactez le super admin.`,
    };
  }

  return { allowed: true };
}
