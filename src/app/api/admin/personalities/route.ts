import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    let query = supabase
      .from("personalities")
      .select("*, personality_categories!inner(category_id, categories(*))", {
        count: "exact",
      });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,display_name.ilike.%${search}%,title.ilike.%${search}%`
      );
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("personality_categories.category_id", category);
    }

    const validSortColumns = ["created_at", "updated_at", "full_name", "views_count"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";

    query = query
      .order(sortColumn, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Erreur récupération personnalités:", error);

      const fallbackQuery = supabase
        .from("personalities")
        .select("*", { count: "exact" });

      if (search) {
        fallbackQuery.or(
          `full_name.ilike.%${search}%,display_name.ilike.%${search}%`
        );
      }
      if (status && status !== "all") {
        fallbackQuery.eq("status", status);
      }

      const { data: fallbackData, error: fallbackError, count: fallbackCount } =
        await fallbackQuery
          .order(sortColumn, { ascending: sortOrder === "asc" })
          .range(offset, offset + limit - 1);

      if (fallbackError) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      return NextResponse.json({
        data: fallbackData || [],
        total: fallbackCount || 0,
        page,
        limit,
        totalPages: Math.ceil((fallbackCount || 0) / limit),
      });
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Erreur API personnalités:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();

    const {
      categories: categoryIds,
      timeline_events,
      ...personalityData
    } = body;

    const { data: personality, error } = await supabase
      .from("personalities")
      .insert(personalityData)
      .select()
      .single();

    if (error) {
      console.error("Erreur création personnalité:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création" },
        { status: 500 }
      );
    }

    if (categoryIds?.length > 0) {
      const categoryLinks = categoryIds.map((catId: string) => ({
        personality_id: personality.id,
        category_id: catId,
      }));

      await supabase.from("personality_categories").insert(categoryLinks);
    }

    if (timeline_events?.length > 0) {
      const events = timeline_events.map(
        (event: Record<string, unknown>, index: number) => ({
          ...event,
          personality_id: personality.id,
          order: index,
        })
      );

      await supabase.from("timeline_events").insert(events);
    }

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "create",
      entity_type: "personality",
      entity_id: personality.id,
      details: { name: personality.full_name },
    });

    return NextResponse.json(personality, { status: 201 });
  } catch (error) {
    console.error("Erreur API création:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", user.id)
      .single();

    if (!adminUser?.is_active || adminUser.role === "contributor") {
      return NextResponse.json(
        { error: "Permissions insuffisantes" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID requis" },
        { status: 400 }
      );
    }

    const { data: personality } = await supabase
      .from("personalities")
      .select("full_name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("personalities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "delete",
      entity_type: "personality",
      entity_id: id,
      details: { name: personality?.full_name || "Inconnu" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API suppression:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
