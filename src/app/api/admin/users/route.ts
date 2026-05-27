import { NextRequest, NextResponse } from "next/server";
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

    const { data: currentAdmin } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!currentAdmin?.is_active || currentAdmin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès réservé aux super administrateurs" },
        { status: 403 }
      );
    }

    const { data: users, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération utilisateurs:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("Erreur API users:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: currentAdmin } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!currentAdmin?.is_active || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    if (id === user.id && updates.is_active === false) {
      return NextResponse.json(
        { error: "Impossible de se désactiver soi-même" },
        { status: 400 }
      );
    }

    if (id === user.id && updates.role && updates.role !== "super_admin") {
      return NextResponse.json(
        { error: "Impossible de modifier son propre rôle" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erreur modification utilisateur:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "update",
      entity_type: "user",
      entity_id: id,
      details: { updates },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur API users PUT:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: currentAdmin } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!currentAdmin?.is_active || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    if (id === user.id) {
      return NextResponse.json(
        { error: "Impossible de se supprimer soi-même" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("admin_users")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Erreur désactivation:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "delete",
      entity_type: "user",
      entity_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API users DELETE:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
