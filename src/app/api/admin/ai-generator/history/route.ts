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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const adminId = searchParams.get("admin_id") || "";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("ai_generations")
      .select(
        "*, admin:admin_users!ai_generations_admin_id_fkey(full_name, email)",
        { count: "exact" }
      );

    if (status) {
      query = query.eq("status", status);
    }

    if (adminId) {
      query = query.eq("admin_id", adminId);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Erreur historique IA:", error);
      return NextResponse.json(
        { error: "Erreur de récupération" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Erreur API historique:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
