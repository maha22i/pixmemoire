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
            "Permissions insuffisantes. Seuls les éditeurs et administrateurs peuvent gérer les sous-catégories.",
        },
        { status: 403 }
      ),
    };
  }

  return { supabase };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireCategoryEditor();
    if ("error" in auth && auth.error) return auth.error;

    const { supabase } = auth;
    const body = await request.json();
    const { category_id, name, slug, description, icon, color, order, featured } = body;

    if (!category_id || !name || !slug) {
      return NextResponse.json(
        { error: "La catégorie parente, le nom et le slug sont requis." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("subcategories")
      .select("id")
      .eq("category_id", category_id)
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Ce slug existe déjà dans cette catégorie. Choisissez un autre nom ou slug.",
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("subcategories")
      .insert({
        category_id,
        name,
        slug,
        description: description ?? "",
        icon: icon ?? "",
        color: color ?? "",
        order: order ?? 0,
        featured: featured ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création sous-catégorie:", error);
      return NextResponse.json(
        { error: getDbErrorMessage(error) },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erreur API sous-catégories POST:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireCategoryEditor();
    if ("error" in auth && auth.error) return auth.error;

    const { supabase } = auth;
    const body = await request.json();
    const { id, category_id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 });
    }

    if (updates.slug && category_id) {
      const { data: existing } = await supabase
        .from("subcategories")
        .select("id")
        .eq("category_id", category_id)
        .eq("slug", updates.slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error:
              "Ce slug existe déjà dans cette catégorie. Choisissez un autre slug.",
          },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("subcategories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erreur modification sous-catégorie:", error);
      return NextResponse.json(
        { error: getDbErrorMessage(error) },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API sous-catégories PATCH:", error);
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

    const { error } = await supabase.from("subcategories").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression sous-catégorie:", error);
      return NextResponse.json(
        { error: getDbErrorMessage(error, "Erreur lors de la suppression.") },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API sous-catégories DELETE:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
