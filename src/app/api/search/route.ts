import { NextRequest, NextResponse } from "next/server";
import { searchPersonalities } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  const personalities = await searchPersonalities(q);
  const results = personalities.map((p) => ({
    slug: p.slug,
    display_name: p.display_name,
    title: p.title,
    category: p.categories[0]?.name ?? null,
  }));

  return NextResponse.json(results);
}
