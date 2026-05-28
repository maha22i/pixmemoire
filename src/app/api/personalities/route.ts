import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchesPersonalityNameSearch } from "@/lib/utils/personality-search";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");
  const era = searchParams.get("era");
  const gender = searchParams.get("gender");
  const region = searchParams.get("region");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") || "alpha-asc";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));

  const supabase = await createClient();

  let query = supabase
    .from("personalities")
    .select("*, personality_categories!inner(category_id)", { count: "exact" })
    .eq("status", "published");

  if (era) query = query.eq("era", era);
  if (gender) query = query.eq("gender", gender);
  if (region) query = query.eq("origin_region", region);
  if (status === "vivant") query = query.eq("is_alive", true);
  if (status === "decede") query = query.eq("is_alive", false);

  if (category) {
    query = query.eq("personality_categories.category_id", category);
  }

  switch (sort) {
    case "recent":
      query = query.order("created_at", { ascending: false });
      break;
    case "views":
      query = query.order("views_count", { ascending: false });
      break;
    default:
      query = query.order("full_name", { ascending: true });
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: rawData, count, error } = await query;

  if (error) {
    return NextResponse.json({ data: [], total: 0, page, totalPages: 0 });
  }

  let results = rawData ?? [];

  if (q) {
    results = results.filter((p) =>
      matchesPersonalityNameSearch(p.full_name, p.display_name, q)
    );
  }

  const total = count ?? results.length;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({ data: results, total, page, totalPages });
}
