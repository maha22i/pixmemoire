import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import type { AIGeneratedData } from "@/types/ai.types";

const REGION_MAP: Record<string, string> = {
  djibouti_ville: "djibouti-ville",
  "djibouti-ville": "djibouti-ville",
  tadjourah: "tadjourah",
  dikhil: "dikhil",
  ali_sabieh: "ali-sabieh",
  "ali-sabieh": "ali-sabieh",
  obock: "obock",
  arta: "arta",
};

export async function POST() {
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

    const { data: unsavedItems } = await supabase
      .from("ai_generation_queue")
      .select("*, generation:ai_generations!ai_generation_queue_result_id_fkey(*)")
      .eq("status", "done")
      .not("result_id", "is", null);

    if (!unsavedItems?.length) {
      return NextResponse.json({
        success: true,
        message: "Aucune génération à migrer",
        migrated: 0,
      });
    }

    const toMigrate = unsavedItems.filter((item) => {
      const gen = item.generation;
      return gen && !gen.personality_id && gen.status !== "validated";
    });

    if (toMigrate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Toutes les générations sont déjà sauvegardées",
        migrated: 0,
      });
    }

    const results: { name: string; success: boolean; error?: string }[] = [];

    for (const item of toMigrate) {
      const gen = item.generation;
      try {
        const genData = (gen.raw_output?.data || gen.raw_output) as AIGeneratedData;

        if (!genData?.full_name) {
          results.push({
            name: item.personality_name,
            success: false,
            error: "Données de génération invalides",
          });
          continue;
        }

        const slug = slugify(genData.full_name);

        const { data: existingSlug } = await supabase
          .from("personalities")
          .select("slug")
          .eq("slug", slug)
          .maybeSingle();

        const finalSlug = existingSlug
          ? `${slug}-${Date.now().toString(36)}`
          : slug;

        const mappedRegion = REGION_MAP[genData.origin_region] || "djibouti-ville";

        const sourcesForDb = (genData.sources || []).map((s) => ({
          title: s.title,
          url: s.url || "",
          type:
            s.type === "site_web"
              ? "web"
              : s.type === "interview"
                ? "article"
                : s.type,
        }));

        const { data: personality, error: insertError } = await supabase
          .from("personalities")
          .insert({
            slug: finalSlug,
            full_name: genData.full_name,
            display_name: genData.display_name || genData.full_name,
            title: genData.title,
            birth_date: genData.birth_date || null,
            death_date: genData.death_date || null,
            birth_place: genData.birth_place || "",
            origin_region: mappedRegion,
            gender: genData.gender,
            era: genData.era,
            is_alive: genData.is_alive,
            famous_quote: genData.famous_quote || null,
            short_bio: genData.short_bio,
            full_bio: genData.full_bio,
            achievements: genData.achievements || "",
            sources: sourcesForDb,
            status: "draft",
            ai_generated: true,
            ai_generation_id: gen.id,
            needs_human_review: true,
            verification_status: "in_review",
          })
          .select()
          .single();

        if (insertError) {
          results.push({
            name: item.personality_name,
            success: false,
            error: insertError.message,
          });
          continue;
        }

        if (genData.timeline?.length && personality) {
          const events = genData.timeline.map((event, index) => ({
            personality_id: personality.id,
            event_date: event.event_date || "",
            title: event.title,
            description: event.description || "",
            order: index,
          }));
          await supabase.from("timeline_events").insert(events);
        }

        if (genData.categories_suggested?.length && personality) {
          const { data: matchedCategories } = await supabase
            .from("categories")
            .select("id, slug")
            .in("slug", genData.categories_suggested.map((c) => slugify(c)));

          if (matchedCategories?.length) {
            await supabase.from("personality_categories").insert(
              matchedCategories.map((cat) => ({
                personality_id: personality.id,
                category_id: cat.id,
              }))
            );
          }
        }

        await supabase
          .from("ai_generations")
          .update({
            personality_id: personality.id,
            status: "validated",
            validated_at: new Date().toISOString(),
            validated_by: user.id,
          })
          .eq("id", gen.id);

        results.push({ name: item.personality_name, success: true });
      } catch (err) {
        results.push({
          name: item.personality_name,
          success: false,
          error: err instanceof Error ? err.message : "Erreur inattendue",
        });
      }
    }

    const migrated = results.filter((r) => r.success).length;

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "create",
      entity_type: "personality",
      details: {
        type: "ai_batch_migrate",
        migrated,
        total: results.length,
        results,
      },
    });

    return NextResponse.json({
      success: true,
      migrated,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    console.error("Erreur migration batch:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
