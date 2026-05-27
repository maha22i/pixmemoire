import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";
import { calculateCost } from "@/lib/ai/cost";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { slugify } from "@/lib/utils/slugify";
import type { AIGenerationParams, AIGeneratedData } from "@/types/ai.types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

async function saveAsDraft(
  supabase: Awaited<ReturnType<typeof createClient>>,
  genData: AIGeneratedData,
  generationId: string,
  userId: string
) {
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
      ai_generation_id: generationId,
      needs_human_review: true,
      verification_status: "in_review",
    })
    .select()
    .single();

  if (insertError) {
    console.error("Auto-save draft error:", insertError);
    return null;
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
      validated_by: userId,
    })
    .eq("id", generationId);

  return personality;
}

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

    const rateCheck = await checkRateLimit(user.id, adminUser.role);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason, rate_limited: true },
        { status: 429 }
      );
    }

    const {
      batch_id,
      detailLevel = "standard",
      includeSources = true,
      includeTimeline = true,
      includeRelated = true,
    } = await request.json();

    if (!batch_id) {
      return NextResponse.json(
        { error: "batch_id requis" },
        { status: 400 }
      );
    }

    const { data: pendingItems } = await supabase
      .from("ai_generation_queue")
      .select("*")
      .eq("batch_id", batch_id)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1);

    if (!pendingItems?.length) {
      return NextResponse.json({
        success: true,
        message: "Aucun élément en attente",
        done: true,
      });
    }

    const item = pendingItems[0];

    await supabase
      .from("ai_generation_queue")
      .update({ status: "processing" })
      .eq("id", item.id);

    const startTime = Date.now();

    try {
      const { data: settings } = await supabase
        .from("ai_settings")
        .select("default_model")
        .limit(1)
        .single();

      const model =
        settings?.default_model ||
        process.env.ANTHROPIC_MODEL ||
        "claude-sonnet-4-6";

      const params: AIGenerationParams = {
        personalityName: item.personality_name,
        category: item.category_slug || "histoire",
        era: item.era || "contemporary",
        detailLevel: detailLevel as "concis" | "standard" | "detaille",
        additionalContext: item.additional_notes || undefined,
        includeSources,
        includeTimeline,
        includeRelated,
      };

      const response = await client.messages.create({
        model,
        max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || "8000"),
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(params) }],
      });

      const textContent = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const cleaned = textContent
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      const parsed = JSON.parse(cleaned);

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const cost = calculateCost(response.model, inputTokens, outputTokens);

      const isError = parsed.error === "personne_inconnue";

      const { data: generation } = await supabase
        .from("ai_generations")
        .insert({
          admin_id: user.id,
          prompt_input: params,
          raw_output: parsed,
          status: isError ? "error" : "success",
          model_used: response.model,
          tokens_used: inputTokens + outputTokens,
          cost_estimate: cost,
          generation_time: Date.now() - startTime,
          error_message: isError ? "Personnalité inconnue" : null,
        })
        .select()
        .single();

      let personalityId: string | null = null;

      if (!isError && generation) {
        const genData = (parsed.data || parsed) as AIGeneratedData;
        if (genData.full_name) {
          const personality = await saveAsDraft(
            supabase,
            genData,
            generation.id,
            user.id
          );
          personalityId = personality?.id || null;
        }
      }

      await supabase
        .from("ai_generation_queue")
        .update({
          status: isError ? "failed" : "done",
          result_id: generation?.id,
          error_message: isError ? "Personnalité inconnue de l'IA" : null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      const { count: remaining } = await supabase
        .from("ai_generation_queue")
        .select("id", { count: "exact", head: true })
        .eq("batch_id", batch_id)
        .eq("status", "pending");

      return NextResponse.json({
        success: true,
        item_id: item.id,
        generation_id: generation?.id,
        personality_id: personalityId,
        status: isError ? "failed" : "done",
        remaining: remaining || 0,
        done: (remaining || 0) === 0,
      });
    } catch (genError) {
      await supabase
        .from("ai_generation_queue")
        .update({
          status: "failed",
          error_message:
            genError instanceof Error
              ? genError.message
              : "Erreur de génération",
          processed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      return NextResponse.json({
        success: false,
        item_id: item.id,
        error:
          genError instanceof Error
            ? genError.message
            : "Erreur de génération",
      });
    }
  } catch (error) {
    console.error("Erreur process batch:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
