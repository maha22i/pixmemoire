"use client";

import { useState } from "react";
import { Bot, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CostEstimator from "./CostEstimator";
import GenerationProgress from "./GenerationProgress";
import GenerationResult from "./GenerationResult";
import type {
  AIDetailLevel,
  AIGeneratedData,
  AIGenerationMetrics,
  ConfidenceLevel,
} from "@/types/ai.types";
import type { Category } from "@/types/database.types";

interface AIGeneratorFormProps {
  categories: Category[];
  defaultModel?: string;
}

const DETAIL_LEVELS: {
  value: AIDetailLevel;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    value: "concis",
    label: "Concis",
    desc: "500-800 mots — rapide",
    color: "text-emerald-600",
  },
  {
    value: "standard",
    label: "Standard",
    desc: "1200-1800 mots — recommandé",
    color: "text-amber-600",
  },
  {
    value: "detaille",
    label: "Détaillé",
    desc: "2500-3500 mots — exhaustif",
    color: "text-red-600",
  },
];

const ERAS = [
  { value: "pre_independence", label: "Pré-indépendance" },
  { value: "post_independence", label: "Post-indépendance" },
  { value: "contemporary", label: "Contemporaine" },
];

export default function AIGeneratorForm({
  categories,
  defaultModel = "claude-sonnet-4-6",
}: AIGeneratorFormProps) {
  const [personalityName, setPersonalityName] = useState("");
  const [category, setCategory] = useState(
    categories[0]?.slug || "histoire"
  );
  const [era, setEra] = useState<
    "pre_independence" | "post_independence" | "contemporary"
  >("contemporary");
  const [detailLevel, setDetailLevel] = useState<AIDetailLevel>("standard");
  const [additionalContext, setAdditionalContext] = useState("");
  const [includeSources, setIncludeSources] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeRelated, setIncludeRelated] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    data: AIGeneratedData;
    warnings: string[];
    confidence: ConfidenceLevel;
    metrics: AIGenerationMetrics;
    generationId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!personalityName.trim()) {
      toast.error("Veuillez saisir le nom de la personnalité.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ai-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalityName: personalityName.trim(),
          category,
          era,
          detailLevel,
          additionalContext: additionalContext.trim() || undefined,
          includeSources,
          includeTimeline,
          includeRelated,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur de génération");
      }

      setResult({
        data: json.data,
        warnings: json.warnings,
        confidence: json.confidence,
        metrics: json.metrics,
        generationId: json.generation_id,
      });

      toast.success("Fiche générée avec succès !");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inattendue";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setResult(null);
    handleGenerate();
  };

  const handleReject = () => {
    setResult(null);
    toast.info("Fiche rejetée.");
  };

  if (result) {
    return (
      <GenerationResult
        data={result.data}
        warnings={result.warnings}
        confidence={result.confidence}
        metrics={result.metrics}
        generationId={result.generationId}
        onRegenerate={handleRegenerate}
        onReject={handleReject}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Paramètres de génération */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Paramètres de génération
        </h3>

        {/* Nom */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">
            Nom de la personnalité <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={personalityName}
            onChange={(e) => setPersonalityName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
            placeholder="Ex : Hassan Gouled Aptidon"
            disabled={isGenerating}
          />
        </div>

        {/* Catégorie + Époque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Catégorie <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              disabled={isGenerating}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
              {categories.length === 0 && (
                <>
                  <option value="politique">Politique</option>
                  <option value="histoire">Histoire</option>
                  <option value="culture">Culture</option>
                  <option value="sport">Sport</option>
                  <option value="science">Science</option>
                  <option value="art">Art</option>
                  <option value="religion">Religion</option>
                  <option value="militaire">Militaire</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Époque <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={era}
              onChange={(e) =>
                setEra(
                  e.target.value as
                    | "pre_independence"
                    | "post_independence"
                    | "contemporary"
                )
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              disabled={isGenerating}
            >
              {ERAS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Niveau de détail */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">
            Niveau de détail
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DETAIL_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setDetailLevel(level.value)}
                disabled={isGenerating}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  detailLevel === level.value
                    ? "border-[#F5A623] bg-[#F5A623]/5"
                    : "border-[#E5E5E5] hover:border-[#F5A623]/50"
                )}
              >
                <p className={cn("text-sm font-medium", level.color)}>
                  {level.label}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Options toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 p-3 rounded-lg border border-[#E5E5E5] cursor-pointer hover:border-[#F5A623]/50">
            <input
              type="checkbox"
              checked={includeSources}
              onChange={(e) => setIncludeSources(e.target.checked)}
              className="accent-[#F5A623]"
              disabled={isGenerating}
            />
            <span className="text-sm text-[#1A1A1A]">
              Inclure les sources
            </span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-lg border border-[#E5E5E5] cursor-pointer hover:border-[#F5A623]/50">
            <input
              type="checkbox"
              checked={includeTimeline}
              onChange={(e) => setIncludeTimeline(e.target.checked)}
              className="accent-[#F5A623]"
              disabled={isGenerating}
            />
            <span className="text-sm text-[#1A1A1A]">
              Chronologie détaillée
            </span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-lg border border-[#E5E5E5] cursor-pointer hover:border-[#F5A623]/50">
            <input
              type="checkbox"
              checked={includeRelated}
              onChange={(e) => setIncludeRelated(e.target.checked)}
              className="accent-[#F5A623]"
              disabled={isGenerating}
            />
            <span className="text-sm text-[#1A1A1A]">
              Personnalités liées
            </span>
          </label>
        </div>

        {/* Informations supplémentaires */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">
            Informations supplémentaires{" "}
            <span className="text-[#6B6B6B] font-normal">(optionnel)</span>
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] resize-none"
            placeholder="Contexte additionnel pour guider la génération..."
            disabled={isGenerating}
          />
        </div>

        {/* Estimation coût */}
        <CostEstimator model={defaultModel} detailLevel={detailLevel} />
      </div>

      {/* Progression */}
      <GenerationProgress isGenerating={isGenerating} />

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle size={20} className="flex-shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Erreur de génération
            </p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Bouton générer */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !personalityName.trim()}
        className="flex items-center justify-center gap-3 w-full px-6 py-4 text-base font-bold text-[#1A1A1A] bg-[#F5A623] rounded-xl hover:bg-[#E09010] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Bot size={22} />
            Générer la fiche
          </>
        )}
      </button>
    </div>
  );
}
