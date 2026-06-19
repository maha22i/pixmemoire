import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDbErrorMessage } from "@/lib/admin/db-errors";

async function requireCategoryEditor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (!adminUser?.is_active) {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }

  if (!["super_admin", "editor"].includes(adminUser.role)) {
    return {
      error: NextResponse.json(
        {
          error:
            "Permissions insuffisantes. Seuls les éditeurs et administrateurs peuvent gérer les catégories.",
        },
        { status: 403 }
      ),
    };
  }

  return { supabase, user };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireCategoryEditor();
    if ("error" in auth && auth.error) return auth.error;

    const { supabase } = auth;
    const body = await request.json();
    const { name, slug, description, icon, color, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Le nom et le slug sont requis." },
        { status: 400 }
      );
    }

    const { count } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Ce slug existe déjà. Choisissez un autre nom ou modifiez le slug." },
        { status: 409 }
      );
    }

    const insertOrder =
      typeof order === "number"
        ? order
        : ((await supabase.from("categories").select("id", { count: "exact", head: true }))
            .count ?? 0) + 1;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description: description ?? "",
        icon: icon ?? "",
        color: color ?? "#F5A623",
        order: insertOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création catégorie:", error);
      return NextResponse.json(
        { error: getDbErrorMessage(error) },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erreur API catégories POST:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireCategoryEditor();
    if ("error" in auth && auth.error) return auth.error;

    const { supabase } = auth;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 });
    }

    if (updates.slug) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", updates.slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "Ce slug existe déjà. Choisissez un autre slug." },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erreur modification catégorie:", error);
      return NextResponse.json(
        { error: getDbErrorMessage(error) },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API catégories PATCH:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireCategoryEditor();
    if ("error" in auth && auth.error) return auth.error;

    const { supabase } = auth;
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 });
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression catégorie:", error);
      return NextResponse.json(
        { error: getDbErrorMessage(error, "Erreur lors de la suppression.") },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API catégories DELETE:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
