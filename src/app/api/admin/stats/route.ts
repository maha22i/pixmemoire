import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startISO = startDate.toISOString();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      publishedResult,
      draftResult,
      suggestionsResult,
      viewsResult,
      topPersonalitiesResult,
      recentPersonalitiesResult,
      categoriesResult,
    ] = await Promise.all([
      supabase
        .from("personalities")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("personalities")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("suggestions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("viewed_at", monthStart.toISOString()),
      supabase
        .from("personalities")
        .select("id, full_name, display_name, main_photo_url, views_count, slug")
        .eq("status", "published")
        .order("views_count", { ascending: false })
        .limit(10),
      supabase
        .from("personalities")
        .select("id, full_name, display_name, main_photo_url, status, created_at, slug")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("categories").select("id, name, icon, color"),
    ]);

    let viewsPerDay: { date: string; views: number }[] = [];
    try {
      const { data: viewsData } = await supabase
        .from("page_views")
        .select("viewed_at")
        .gte("viewed_at", startISO)
        .order("viewed_at", { ascending: true });

      if (viewsData && viewsData.length > 0) {
        const grouped: Record<string, number> = {};
        viewsData.forEach((v) => {
          const date = new Date(v.viewed_at).toISOString().split("T")[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });
        viewsPerDay = Object.entries(grouped).map(([date, views]) => ({
          date,
          views,
        }));
      }
    } catch {
      // page_views n'existe peut-être pas encore
    }

    const categoryDistribution =
      categoriesResult.data?.map((cat) => ({
        name: cat.name,
        color: cat.color,
        value: 0,
      })) || [];

    try {
      const { data: pcData } = await supabase
        .from("personality_categories")
        .select("category_id");

      if (pcData) {
        pcData.forEach((pc) => {
          const cat = categoryDistribution.find(
            (c) =>
              categoriesResult.data?.find((x) => x.id === pc.category_id)
                ?.name === c.name
          );
          if (cat) cat.value++;
        });
      }
    } catch {
      // table n'existe peut-être pas
    }

    return NextResponse.json({
      stats: {
        totalPublished: publishedResult.count || 0,
        totalDrafts: draftResult.count || 0,
        pendingSuggestions: suggestionsResult.count || 0,
        totalViewsThisMonth: viewsResult.count || 0,
      },
      viewsPerDay,
      topPersonalities: topPersonalitiesResult.data || [],
      recentPersonalities: recentPersonalitiesResult.data || [],
      categoryDistribution: categoryDistribution.filter((c) => c.value > 0),
    });
  } catch (error) {
    console.error("Erreur API stats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
