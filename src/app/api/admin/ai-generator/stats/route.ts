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

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthGens, error } = await supabase
      .from("ai_generations")
      .select("status, cost_estimate, tokens_used")
      .gte("created_at", startOfMonth.toISOString());

    if (error) {
      return NextResponse.json(
        { error: "Erreur récupération stats" },
        { status: 500 }
      );
    }

    const all = monthGens || [];
    const totalGenerations = all.length;
    const totalCost = all.reduce(
      (sum, g) => sum + (Number(g.cost_estimate) || 0),
      0
    );
    const tokensUsed = all.reduce(
      (sum, g) => sum + (g.tokens_used || 0),
      0
    );
    const validated = all.filter((g) => g.status === "validated").length;
    const rejected = all.filter((g) => g.status === "rejected").length;
    const decidedCount = validated + rejected;
    const validationRate =
      decidedCount > 0 ? Math.round((validated / decidedCount) * 100) : 0;

    return NextResponse.json({
      totalGenerations,
      totalCost: Math.round(totalCost * 10000) / 10000,
      tokensUsed,
      validationRate,
      validated,
      rejected,
    });
  } catch (error) {
    console.error("Erreur stats IA:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
