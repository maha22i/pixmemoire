import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import type { AIGeneratedData } from "@/types/ai.types";

export async function POST(request: Request) {
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

    const { generationData, generationId } = (await request.json()) as {
      generationData: AIGeneratedData;
      generationId: string;
    };

    if (!generationData || !generationId) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    const regionMap: Record<string, string> = {
      djibouti_ville: "djibouti-ville",
      "djibouti-ville": "djibouti-ville",
      tadjourah: "tadjourah",
      dikhil: "dikhil",
      ali_sabieh: "ali-sabieh",
      "ali-sabieh": "ali-sabieh",
      obock: "obock",
      arta: "arta",
    };

    const slug = slugify(generationData.full_name);

    const { data: existingSlug } = await supabase
      .from("personalities")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    const finalSlug = existingSlug
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    const mappedRegion =
      regionMap[generationData.origin_region] || "djibouti-ville";

    const sourcesForDb = (generationData.sources || []).map((s) => ({
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
        full_name: generationData.full_name,
        display_name: generationData.display_name || generationData.full_name,
        title: generationData.title,
        birth_date: generationData.birth_date || null,
        death_date: generationData.death_date || null,
        birth_place: generationData.birth_place || "",
        origin_region: mappedRegion,
        gender: generationData.gender,
        era: generationData.era,
        is_alive: generationData.is_alive,
        famous_quote: generationData.famous_quote || null,
        short_bio: generationData.short_bio,
        full_bio: generationData.full_bio,
        achievements: generationData.achievements || "",
        sources: sourcesForDb,
        status: "draft",
        ai_generated: true,
        ai_generation_id: generationId,
        needs_human_review: true,
        verification_status: "in_review",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erreur insertion personnalité:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde: " + insertError.message },
        { status: 500 }
      );
    }

    if (generationData.timeline?.length && personality) {
      const events = generationData.timeline.map((event, index) => ({
        personality_id: personality.id,
        event_date: event.event_date || "",
        title: event.title,
        description: event.description || "",
        order: index,
      }));

      await supabase.from("timeline_events").insert(events);
    }

    if (generationData.categories_suggested?.length && personality) {
      const { data: matchedCategories } = await supabase
        .from("categories")
        .select("id, slug")
        .in(
          "slug",
          generationData.categories_suggested.map((c) => slugify(c))
        );

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
      .eq("id", generationId);

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "create",
      entity_type: "personality",
      entity_id: personality.id,
      details: {
        type: "ai_save",
        name: personality.full_name,
        generation_id: generationId,
      },
    });

    return NextResponse.json({ success: true, personality });
  } catch (error) {
    console.error("Erreur sauvegarde IA:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
