import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: settings, error } = await supabase
      .from("ai_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erreur récupération paramètres" },
        { status: 500 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur settings:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", user.id)
      .single();

    if (!adminUser?.is_active || adminUser.role !== "super_admin") {
      return NextResponse.json(
        { error: "Seul le super admin peut modifier les paramètres IA" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { data: existing } = await supabase
      .from("ai_settings")
      .select("id")
      .limit(1)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Aucun enregistrement de paramètres trouvé" },
        { status: 404 }
      );
    }

    const { data: updated, error } = await supabase
      .from("ai_settings")
      .update({
        default_model: body.default_model,
        monthly_budget_usd: body.monthly_budget_usd,
        per_user_budget_usd: body.per_user_budget_usd,
        daily_limit_per_user: body.daily_limit_per_user,
        hourly_limit_per_user: body.hourly_limit_per_user,
        is_enabled: body.is_enabled,
        system_prompt_override: body.system_prompt_override || null,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erreur mise à jour paramètres" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur update settings:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
