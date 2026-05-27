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

    const { data: queueItems, error } = await supabase
      .from("ai_generation_queue")
      .select(
        "*, generation:ai_generations!ai_generation_queue_result_id_fkey(id, personality_id, status, raw_output, tokens_used, cost_estimate, generation_time)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur batch history:", error);
      return NextResponse.json(
        { error: "Erreur de récupération" },
        { status: 500 }
      );
    }

    const batchMap = new Map<
      string,
      {
        batch_id: string;
        created_at: string;
        items: typeof queueItems;
        stats: {
          total: number;
          done: number;
          failed: number;
          pending: number;
          saved: number;
        };
      }
    >();

    for (const item of queueItems || []) {
      if (!batchMap.has(item.batch_id)) {
        batchMap.set(item.batch_id, {
          batch_id: item.batch_id,
          created_at: item.created_at,
          items: [],
          stats: { total: 0, done: 0, failed: 0, pending: 0, saved: 0 },
        });
      }
      const batch = batchMap.get(item.batch_id)!;
      batch.items.push(item);
      batch.stats.total++;

      if (item.status === "done") {
        batch.stats.done++;
        if (item.generation?.personality_id) {
          batch.stats.saved++;
        }
      } else if (item.status === "failed") {
        batch.stats.failed++;
      } else {
        batch.stats.pending++;
      }
    }

    const batches = Array.from(batchMap.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Erreur API batch history:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
