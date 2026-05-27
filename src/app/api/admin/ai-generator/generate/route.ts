import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";
import { calculateCost } from "@/lib/ai/cost";
import { checkRateLimit } from "@/lib/ai/rate-limit";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const requestSchema = z.object({
  personalityName: z.string().min(2),
  category: z.string(),
  era: z.enum(["pre_independence", "post_independence", "contemporary"]),
  detailLevel: z.enum(["concis", "standard", "detaille"]),
  additionalContext: z.string().optional(),
  includeSources: z.boolean().default(true),
  includeTimeline: z.boolean().default(true),
  includeRelated: z.boolean().default(true),
});

export async function POST(request: Request) {
  const startTime = Date.now();

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
        { error: rateCheck.reason },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const params = parseResult.data;

    const { data: settings } = await supabase
      .from("ai_settings")
      .select("*")
      .limit(1)
      .single();

    if (settings && !settings.is_enabled) {
      return NextResponse.json(
        { error: "Le générateur IA est actuellement désactivé." },
        { status: 403 }
      );
    }

    const model = settings?.default_model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
    const userPrompt = buildUserPrompt(params);

    const response = await client.messages.create({
      model,
      max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || "8000"),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textContent = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed;
    try {
      const cleaned = textContent
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const { data: errorGen } = await supabase
        .from("ai_generations")
        .insert({
          admin_id: user.id,
          prompt_input: params,
          raw_output: { raw_text: textContent },
          status: "error",
          model_used: response.model,
          tokens_used:
            response.usage.input_tokens + response.usage.output_tokens,
          generation_time: Date.now() - startTime,
          error_message: "Impossible de parser la réponse JSON de Claude",
        })
        .select()
        .single();

      return NextResponse.json(
        {
          success: false,
          error: "La réponse de Claude n'était pas un JSON valide. Réessayez.",
          generation_id: errorGen?.id,
        },
        { status: 422 }
      );
    }

    if (parsed.error === "personne_inconnue") {
      await supabase.from("ai_generations").insert({
        admin_id: user.id,
        prompt_input: params,
        raw_output: parsed,
        status: "error",
        model_used: response.model,
        tokens_used:
          response.usage.input_tokens + response.usage.output_tokens,
        cost_estimate: calculateCost(
          response.model,
          response.usage.input_tokens,
          response.usage.output_tokens
        ),
        generation_time: Date.now() - startTime,
        error_message: "Personnalité inconnue de Claude",
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "Cette personnalité est inconnue de l'IA. Fournissez plus de contexte dans les informations supplémentaires, ou créez la fiche manuellement.",
        },
        { status: 404 }
      );
    }

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = calculateCost(response.model, inputTokens, outputTokens);

    const { data: generation } = await supabase
      .from("ai_generations")
      .insert({
        admin_id: user.id,
        prompt_input: params,
        raw_output: parsed,
        status: "success",
        model_used: response.model,
        tokens_used: inputTokens + outputTokens,
        cost_estimate: cost,
        generation_time: Date.now() - startTime,
      })
      .select()
      .single();

    await supabase.from("activity_logs").insert({
      admin_id: user.id,
      action: "create",
      entity_type: "personality",
      details: {
        type: "ai_generation",
        personality: params.personalityName,
        generation_id: generation?.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: parsed.data,
      warnings: parsed.warnings || [],
      confidence: parsed.confidence_level,
      metrics: {
        tokens_used: inputTokens + outputTokens,
        cost_usd: cost,
        generation_time_ms: Date.now() - startTime,
      },
      generation_id: generation?.id,
    });
  } catch (error) {
    console.error("Erreur génération IA:", error);

    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
