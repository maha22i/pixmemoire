import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    if (!adminUser?.is_active) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const {
      personalities,
      detailLevel = "standard",
      includeSources = true,
    } = await request.json();

    if (!Array.isArray(personalities) || personalities.length === 0) {
      return NextResponse.json(
        { error: "Liste de personnalités requise" },
        { status: 400 }
      );
    }

    if (personalities.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 personnalités par lot" },
        { status: 400 }
      );
    }

    const batchId = crypto.randomUUID();

    const queueItems = personalities.map(
      (p: { name: string; category: string; era?: string; notes?: string }) => ({
        batch_id: batchId,
        admin_id: user.id,
        personality_name: p.name,
        category_slug: p.category || null,
        era: p.era || "contemporary",
        additional_notes: p.notes || null,
        status: "pending",
      })
    );

    const { error: insertError } = await supabase
      .from("ai_generation_queue")
      .insert(queueItems);

    if (insertError) {
      console.error("Erreur création queue:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création du lot" },
        { status: 500 }
      );
    }

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "create",
      entity_type: "personality",
      details: {
        type: "ai_batch",
        batch_id: batchId,
        count: personalities.length,
        detail_level: detailLevel,
        include_sources: includeSources,
      },
    });

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      count: personalities.length,
    });
  } catch (error) {
    console.error("Erreur batch IA:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}

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
    const batchId = searchParams.get("batch_id");

    if (!batchId) {
      return NextResponse.json(
        { error: "batch_id requis" },
        { status: 400 }
      );
    }

    const { data: items, error } = await supabase
      .from("ai_generation_queue")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Erreur récupération du lot" },
        { status: 500 }
      );
    }

    const total = items?.length || 0;
    const done = items?.filter((i) => i.status === "done").length || 0;
    const failed = items?.filter((i) => i.status === "failed").length || 0;
    const processing =
      items?.filter((i) => i.status === "processing").length || 0;

    return NextResponse.json({
      batch_id: batchId,
      items: items || [],
      stats: {
        total,
        done,
        failed,
        processing,
        pending: total - done - failed - processing,
        is_complete: done + failed === total,
      },
    });
  } catch (error) {
    console.error("Erreur status batch:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
