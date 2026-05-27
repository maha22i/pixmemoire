"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Edit3,
  RefreshCw,
  Trash2,
  ExternalLink,
  Clock,
  Zap,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AIWarningBanner from "./AIWarningBanner";
import RichTextEditor from "./RichTextEditor";
import { formatCostUSD, formatCostFDJ } from "@/lib/ai/cost";
import type {
  AIGeneratedData,
  AIGenerationMetrics,
  ConfidenceLevel,
} from "@/types/ai.types";

interface GenerationResultProps {
  data: AIGeneratedData;
  warnings: string[];
  confidence: ConfidenceLevel;
  metrics: AIGenerationMetrics;
  generationId: string;
  onRegenerate: () => void;
  onReject: () => void;
}

export default function GenerationResult({
  data,
  warnings,
  confidence,
  metrics,
  generationId,
  onRegenerate,
  onReject,
}: GenerationResultProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  const [editedShortBio, setEditedShortBio] = useState<string | null>(null);
  const [editedFullBio, setEditedFullBio] = useState<string | null>(null);
  const [editedAchievements, setEditedAchievements] = useState<string | null>(null);

  const stripHtml = useCallback((html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    const saveData = {
      ...data,
      short_bio: editedShortBio ? stripHtml(editedShortBio) : data.short_bio,
      full_bio: editedFullBio || data.full_bio,
      achievements: editedAchievements || data.achievements,
    };

    try {
      const res = await fetch("/api/admin/ai-generator/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationData: saveData,
          generationId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erreur de sauvegarde");
      }

      toast.success("Fiche sauvegardée en brouillon !");
      router.push(`/admin/personalities/${result.personality.id}/edit`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur de sauvegarde"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const eraLabel = {
    pre_independence: "Pré-indépendance",
    post_independence: "Post-indépendance",
    contemporary: "Contemporaine",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche : aperçu */}
      <div className="lg:col-span-2 space-y-4">
        {/* En-tête personnalité */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                {data.full_name}
              </h2>
              {data.display_name !== data.full_name && (
                <p className="text-sm text-[#6B6B6B]">{data.display_name}</p>
              )}
              <p className="text-sm text-[#F5A623] font-medium mt-1">
                {data.title}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5A623]/10 text-[#F5A623]">
              {eraLabel[data.era] || data.era}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-[#6B6B6B]">Naissance :</span>
              <p className="font-medium">{data.birth_date || "Inconnue"}</p>
            </div>
            <div>
              <span className="text-[#6B6B6B]">Décès :</span>
              <p className="font-medium">
                {data.is_alive ? "En vie" : data.death_date || "Inconnu"}
              </p>
            </div>
            <div>
              <span className="text-[#6B6B6B]">Lieu :</span>
              <p className="font-medium">{data.birth_place || "Inconnu"}</p>
            </div>
            <div>
              <span className="text-[#6B6B6B]">Genre :</span>
              <p className="font-medium">
                {data.gender === "M" ? "Homme" : "Femme"}
              </p>
            </div>
          </div>

          {data.famous_quote && (
            <blockquote className="mt-4 pl-4 border-l-3 border-[#F5A623] italic text-sm text-[#6B6B6B]">
              "{data.famous_quote}"
            </blockquote>
          )}
        </div>

        {/* Résumé */}
        <RichTextEditor
          content={data.short_bio}
          onChange={setEditedShortBio}
          label="Résumé"
          minHeight="60px"
        />

        {/* Biographie */}
        <RichTextEditor
          content={data.full_bio}
          onChange={setEditedFullBio}
          label="Biographie complète"
          minHeight="200px"
        />

        {/* Réalisations */}
        {data.achievements && (
          <RichTextEditor
            content={data.achievements}
            onChange={setEditedAchievements}
            label="Réalisations & Contributions"
            minHeight="150px"
          />
        )}

        {/* Chronologie */}
        {data.timeline?.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Chronologie ({data.timeline.length} événements)
              </h3>
              {showTimeline ? (
                <ChevronUp size={16} className="text-[#6B6B6B]" />
              ) : (
                <ChevronDown size={16} className="text-[#6B6B6B]" />
              )}
            </button>
            {showTimeline && (
              <div className="space-y-3">
                {data.timeline.map((event, i) => (
                  <div
                    key={i}
                    className="flex gap-3 pl-3 border-l-2 border-[#F5A623]/30"
                  >
                    <div className="flex-shrink-0 w-24">
                      <span className="text-xs font-mono text-[#F5A623] font-medium">
                        {event.event_date}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-xs text-[#6B6B6B] mt-0.5">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {data.sources?.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Sources ({data.sources.length})
              </h3>
              {showSources ? (
                <ChevronUp size={16} className="text-[#6B6B6B]" />
              ) : (
                <ChevronDown size={16} className="text-[#6B6B6B]" />
              )}
            </button>
            {showSources && (
              <div className="space-y-2">
                {data.sources.map((source, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F8F8F8]"
                  >
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                        source.type === "livre"
                          ? "bg-blue-100 text-blue-700"
                          : source.type === "article"
                            ? "bg-green-100 text-green-700"
                            : source.type === "archive"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {source.type}
                    </span>
                    <span className="flex-1 text-sm text-[#1A1A1A]">
                      {source.title}
                      {source.author && (
                        <span className="text-[#6B6B6B]">
                          {" "}— {source.author}
                        </span>
                      )}
                    </span>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F5A623] hover:text-[#E09010]"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Catégories suggérées & Personnalités liées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.categories_suggested?.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                Catégories suggérées
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.categories_suggested.map((cat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs bg-[#F5A623]/10 text-[#F5A623] font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.related_personalities?.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                Personnalités liées
              </h3>
              <ul className="space-y-1">
                {data.related_personalities.map((p, i) => (
                  <li key={i} className="text-sm text-[#6B6B6B]">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Colonne droite : actions & métriques */}
      <div className="space-y-4">
        <AIWarningBanner confidence={confidence} warnings={warnings} />

        {/* Métriques */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Métriques</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap size={14} className="text-[#F5A623]" />
              <span className="text-[#6B6B6B]">Tokens :</span>
              <span className="font-medium">
                {metrics.tokens_used.toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={14} className="text-[#F5A623]" />
              <span className="text-[#6B6B6B]">Coût :</span>
              <span className="font-medium">
                {formatCostUSD(metrics.cost_usd)}{" "}
                <span className="text-[#999]">
                  ({formatCostFDJ(metrics.cost_usd)})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-[#F5A623]" />
              <span className="text-[#6B6B6B]">Temps :</span>
              <span className="font-medium">
                {(metrics.generation_time_ms / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3 sticky top-6">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Actions</h3>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-[#1A1A1A] bg-[#F5A623] rounded-lg hover:bg-[#E09010] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving
              ? "Sauvegarde en cours..."
              : "Sauvegarder en brouillon"}
          </button>

          <button
            onClick={() => {
              if (generationId) {
                router.push(`/admin/personalities/new?from_ai=${generationId}`);
              }
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F8F8F8] transition-colors"
          >
            <Edit3 size={16} />
            Éditer dans formulaire complet
          </button>

          <button
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F8F8F8] transition-colors"
          >
            <RefreshCw size={16} />
            Régénérer
          </button>

          {showConfirmReject ? (
            <div className="space-y-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-700">
                Êtes-vous sûr de vouloir rejeter cette fiche ?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onReject();
                    setShowConfirmReject(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowConfirmReject(false)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-[#6B6B6B] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F8F8F8]"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReject(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-500 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              Rejeter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
