"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Rocket,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Pause,
  Play,
  Eye,
  Save,
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CSVImporter from "./CSVImporter";
import CostEstimator from "./CostEstimator";
import type { AIDetailLevel, BatchEntry } from "@/types/ai.types";

interface BatchGeneratorTableProps {
  defaultModel?: string;
}

interface BatchItem extends BatchEntry {
  id: string;
  status: "pending" | "processing" | "done" | "failed";
  error?: string;
  resultId?: string;
  personalityId?: string;
}

interface BatchHistoryItem {
  id: string;
  batch_id: string;
  personality_name: string;
  category_slug: string;
  era: string;
  status: string;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
  generation: {
    id: string;
    personality_id: string | null;
    status: string;
    tokens_used: number | null;
    cost_estimate: number | null;
  } | null;
}

interface BatchHistory {
  batch_id: string;
  created_at: string;
  items: BatchHistoryItem[];
  stats: {
    total: number;
    done: number;
    failed: number;
    pending: number;
    saved: number;
  };
}

const ERAS = [
  { value: "pre_independence", label: "Pré-indépendance" },
  { value: "post_independence", label: "Post-indépendance" },
  { value: "contemporary", label: "Contemporaine" },
];

const ERA_LABELS: Record<string, string> = {
  pre_independence: "Pré-indépendance",
  post_independence: "Post-indépendance",
  contemporary: "Contemporaine",
};

export default function BatchGeneratorTable({
  defaultModel = "claude-sonnet-4-6",
}: BatchGeneratorTableProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [detailLevel, setDetailLevel] = useState<AIDetailLevel>("standard");
  const [includeSources, setIncludeSources] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pauseRef = useRef(false);

  const [history, setHistory] = useState<BatchHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [unsavedCount, setUnsavedCount] = useState(0);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/ai-generator/batch/history");
      const data = await res.json();
      if (res.ok && data.batches) {
        setHistory(data.batches);
        const totalUnsaved = data.batches.reduce(
          (acc: number, b: BatchHistory) =>
            acc + (b.stats.done - b.stats.saved),
          0
        );
        setUnsavedCount(totalUnsaved);
      }
    } catch {
      console.error("Erreur chargement historique lots");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addRow = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        name: "",
        category: "histoire",
        era: "contemporary",
        notes: "",
        status: "pending",
      },
    ]);
  };

  const removeRow = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateRow = (id: string, field: keyof BatchEntry, value: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCSVImport = (entries: BatchEntry[]) => {
    const newItems: BatchItem[] = entries.map((entry) => ({
      ...entry,
      id: crypto.randomUUID(),
      status: "pending" as const,
    }));
    setItems([...items, ...newItems]);
    toast.success(`${entries.length} personnalités ajoutées.`);
  };

  const validItems = items.filter((i) => i.name.trim());

  const startBatch = async () => {
    if (validItems.length === 0) {
      toast.error("Ajoutez au moins une personnalité.");
      return;
    }

    setShowConfirm(false);
    setIsRunning(true);
    setIsPaused(false);
    pauseRef.current = false;

    try {
      const res = await fetch("/api/admin/ai-generator/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalities: validItems.map((i) => ({
            name: i.name,
            category: i.category,
            era: i.era,
            notes: i.notes,
          })),
          detailLevel,
          includeSources,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      for (let idx = 0; idx < validItems.length; idx++) {
        if (pauseRef.current) {
          toast.info("Génération en pause.");
          break;
        }

        const item = validItems[idx];

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "processing" } : i
          )
        );

        try {
          const processRes = await fetch(
            "/api/admin/ai-generator/batch/process",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                batch_id: result.batch_id,
                detailLevel,
                includeSources,
                includeTimeline: true,
                includeRelated: true,
              }),
            }
          );

          const processResult = await processRes.json();

          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: processResult.success
                      ? processResult.status === "failed"
                        ? "failed"
                        : "done"
                      : "failed",
                    error: processResult.error,
                    resultId: processResult.generation_id || undefined,
                    personalityId:
                      processResult.personality_id || undefined,
                  }
                : i
            )
          );
        } catch {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: "failed", error: "Erreur réseau" }
                : i
            )
          );
        }

        if (idx < validItems.length - 1 && !pauseRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }

      toast.success(
        "Génération en lot terminée ! Les fiches ont été sauvegardées en brouillon."
      );
      fetchHistory();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur de batch"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(!isPaused);
  };

  const retryFailed = () => {
    setItems(
      items.map((i) =>
        i.status === "failed"
          ? { ...i, status: "pending", error: undefined, resultId: undefined }
          : i
      )
    );
  };

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const res = await fetch("/api/admin/ai-generator/batch/migrate", {
        method: "POST",
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      if (result.migrated > 0) {
        toast.success(
          `${result.migrated} fiche${result.migrated > 1 ? "s" : ""} migrée${result.migrated > 1 ? "s" : ""} en brouillon !` +
            (result.failed > 0
              ? ` (${result.failed} erreur${result.failed > 1 ? "s" : ""})`
              : "")
        );
      } else {
        toast.info(result.message || "Aucune fiche à migrer.");
      }
      fetchHistory();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur de migration"
      );
    } finally {
      setMigrating(false);
    }
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const failedCount = items.filter((i) => i.status === "failed").length;
  const pendingCount = items.filter(
    (i) => i.status === "pending" || i.status === "processing"
  ).length;

  const statusIcon = useCallback(
    (status: BatchItem["status"]) => {
      switch (status) {
        case "done":
          return <CheckCircle2 size={16} className="text-emerald-500" />;
        case "failed":
          return <XCircle size={16} className="text-red-500" />;
        case "processing":
          return (
            <Loader2 size={16} className="animate-spin text-[#F5A623]" />
          );
        default:
          return <Clock size={16} className="text-[#6B6B6B]" />;
      }
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Bandeau migration si générations non sauvegardées */}
      {unsavedCount > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {unsavedCount} génération{unsavedCount > 1 ? "s" : ""} en lot
              non enregistrée{unsavedCount > 1 ? "s" : ""} comme brouillon
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Ces fiches existent en base mais n&apos;apparaissent pas encore
              dans la page Personnalités. Cliquez pour les migrer.
            </p>
          </div>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {migrating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {migrating ? "Migration..." : "Migrer en brouillon"}
          </button>
        </div>
      )}

      {/* Historique des lots passés */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-[#F5A623]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Historique des lots
          </h3>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#F5A623]" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-[#6B6B6B] py-4">
            Aucun lot généré pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((batch) => (
              <div
                key={batch.batch_id}
                className="rounded-lg border border-[#E5E5E5] overflow-hidden"
              >
                {/* En-tête du lot */}
                <button
                  onClick={() =>
                    setExpandedBatch(
                      expandedBatch === batch.batch_id
                        ? null
                        : batch.batch_id
                    )
                  }
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#F8F8F8] transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#1A1A1A]">
                        Lot du{" "}
                        {new Date(batch.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      <span className="text-xs text-[#6B6B6B]">
                        {batch.stats.total} personnalité
                        {batch.stats.total > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {batch.stats.saved > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} />
                        {batch.stats.saved} sauvegardée
                        {batch.stats.saved > 1 ? "s" : ""}
                      </span>
                    )}
                    {batch.stats.done - batch.stats.saved > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={10} />
                        {batch.stats.done - batch.stats.saved} non
                        sauvegardée
                        {batch.stats.done - batch.stats.saved > 1
                          ? "s"
                          : ""}
                      </span>
                    )}
                    {batch.stats.failed > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                        <XCircle size={10} />
                        {batch.stats.failed} erreur
                        {batch.stats.failed > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {expandedBatch === batch.batch_id ? (
                    <ChevronUp size={16} className="text-[#6B6B6B]" />
                  ) : (
                    <ChevronDown size={16} className="text-[#6B6B6B]" />
                  )}
                </button>

                {/* Détail du lot */}
                {expandedBatch === batch.batch_id && (
                  <div className="border-t border-[#E5E5E5]">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F8F8F8]">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-[#6B6B6B] w-8">
                            #
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-[#6B6B6B]">
                            Nom
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-[#6B6B6B] w-28">
                            Catégorie
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-[#6B6B6B] w-32">
                            Époque
                          </th>
                          <th className="text-center px-4 py-2 font-medium text-[#6B6B6B] w-28">
                            Statut
                          </th>
                          <th className="text-center px-4 py-2 font-medium text-[#6B6B6B] w-24">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {batch.items.map((item, idx) => {
                          const isSaved =
                            !!item.generation?.personality_id;
                          return (
                            <tr
                              key={item.id}
                              className={cn(
                                "border-t border-[#E5E5E5]",
                                isSaved && "bg-emerald-50/30",
                                item.status === "failed" && "bg-red-50/30",
                                item.status === "done" &&
                                  !isSaved &&
                                  "bg-amber-50/30"
                              )}
                            >
                              <td className="px-4 py-2.5 text-[#6B6B6B]">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2.5 font-medium text-[#1A1A1A]">
                                {item.personality_name}
                              </td>
                              <td className="px-4 py-2.5 text-[#6B6B6B] capitalize">
                                {item.category_slug || "—"}
                              </td>
                              <td className="px-4 py-2.5 text-[#6B6B6B]">
                                {ERA_LABELS[item.era] || item.era}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {isSaved ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 size={10} />
                                    Brouillon
                                  </span>
                                ) : item.status === "done" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock size={10} />
                                    Non sauvé
                                  </span>
                                ) : item.status === "failed" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                                    <XCircle size={10} />
                                    Erreur
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                    <Clock size={10} />
                                    En attente
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center justify-center gap-1">
                                  {isSaved &&
                                    item.generation?.personality_id && (
                                      <>
                                        <Link
                                          href={`/admin/personalities/${item.generation.personality_id}/edit`}
                                          className="p-1.5 rounded text-[#6B6B6B] hover:text-[#F5A623] hover:bg-[#F5A623]/10 transition-colors"
                                          title="Modifier"
                                        >
                                          <Pencil size={14} />
                                        </Link>
                                        <Link
                                          href={`/admin/personalities`}
                                          className="p-1.5 rounded text-[#6B6B6B] hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                          title="Voir dans personnalités"
                                        >
                                          <ExternalLink size={14} />
                                        </Link>
                                      </>
                                    )}
                                  {item.status === "failed" &&
                                    item.error_message && (
                                      <span
                                        className="text-[10px] text-red-500 truncate max-w-[120px]"
                                        title={item.error_message}
                                      >
                                        {item.error_message}
                                      </span>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import CSV */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
          Méthode A : Import CSV
        </h3>
        <CSVImporter onImport={handleCSVImport} />
      </div>

      {/* Saisie manuelle */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Méthode B : Saisie manuelle
          </h3>
          <button
            onClick={addRow}
            disabled={isRunning}
            className="flex items-center gap-1.5 text-sm text-[#F5A623] hover:text-[#E09010] font-medium disabled:opacity-50"
          >
            <Plus size={14} />
            Ajouter une ligne
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-[#6B6B6B] py-4">
            Aucune personnalité ajoutée. Importez un CSV ou ajoutez
            manuellement.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8F8]">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B] w-8">
                    #
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B]">
                    Nom
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B] w-36">
                    Catégorie
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B] w-36">
                    Époque
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B]">
                    Notes
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-[#6B6B6B] w-20">
                    Statut
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-t border-[#E5E5E5]",
                      item.status === "done" && "bg-emerald-50/50",
                      item.status === "failed" && "bg-red-50/50",
                      item.status === "processing" && "bg-amber-50/50"
                    )}
                  >
                    <td className="px-3 py-2 text-[#6B6B6B]">{i + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateRow(item.id, "name", e.target.value)
                        }
                        disabled={isRunning || item.status === "done"}
                        className="w-full px-2 py-1 text-sm border border-transparent rounded focus:border-[#E5E5E5] focus:outline-none disabled:bg-transparent"
                        placeholder="Nom de la personnalité"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.category}
                        onChange={(e) =>
                          updateRow(item.id, "category", e.target.value)
                        }
                        disabled={isRunning || item.status === "done"}
                        className="w-full px-2 py-1 text-sm border border-transparent rounded focus:border-[#E5E5E5] focus:outline-none disabled:bg-transparent"
                      >
                        <option value="politique">Politique</option>
                        <option value="histoire">Histoire</option>
                        <option value="culture">Culture</option>
                        <option value="sport">Sport</option>
                        <option value="science">Science</option>
                        <option value="art">Art</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.era}
                        onChange={(e) =>
                          updateRow(item.id, "era", e.target.value)
                        }
                        disabled={isRunning || item.status === "done"}
                        className="w-full px-2 py-1 text-sm border border-transparent rounded focus:border-[#E5E5E5] focus:outline-none disabled:bg-transparent"
                      >
                        {ERAS.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.notes || ""}
                        onChange={(e) =>
                          updateRow(item.id, "notes", e.target.value)
                        }
                        disabled={isRunning || item.status === "done"}
                        className="w-full px-2 py-1 text-sm border border-transparent rounded focus:border-[#E5E5E5] focus:outline-none disabled:bg-transparent"
                        placeholder="Notes optionnelles"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {statusIcon(item.status)}
                        {item.status === "done" && item.personalityId && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Sauvé
                          </span>
                        )}
                      </div>
                      {item.error && (
                        <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-[100px]">
                          {item.error}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {item.status === "done" && item.personalityId && (
                          <Link
                            href={`/admin/personalities/${item.personalityId}/edit`}
                            className="p-1 text-[#6B6B6B] hover:text-[#F5A623]"
                            title="Modifier la fiche"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                        {!isRunning &&
                          item.status !== "done" &&
                          item.status !== "processing" && (
                            <button
                              onClick={() => removeRow(item.id)}
                              className="p-1 text-[#6B6B6B] hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paramètres globaux */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Paramètres globaux
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Niveau de détail
              </label>
              <select
                value={detailLevel}
                onChange={(e) =>
                  setDetailLevel(e.target.value as AIDetailLevel)
                }
                disabled={isRunning}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
              >
                <option value="concis">Concis (500-800 mots)</option>
                <option value="standard">Standard (1200-1800 mots)</option>
                <option value="detaille">
                  Détaillé (2500-3500 mots)
                </option>
              </select>
            </div>

            <label className="flex items-center gap-2 self-end p-3 rounded-lg border border-[#E5E5E5]">
              <input
                type="checkbox"
                checked={includeSources}
                onChange={(e) => setIncludeSources(e.target.checked)}
                className="accent-[#F5A623]"
                disabled={isRunning}
              />
              <span className="text-sm text-[#1A1A1A]">
                Inclure les sources
              </span>
            </label>
          </div>

          <CostEstimator model={defaultModel} detailLevel={detailLevel} />

          <p className="text-xs text-[#6B6B6B]">
            Coût total estimé pour {validItems.length} fiche
            {validItems.length > 1 ? "s" : ""} : délai de 5 secondes entre
            chaque génération.
          </p>
        </div>
      )}

      {/* Compteurs progression */}
      {isRunning && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{doneCount}</p>
            <p className="text-xs text-emerald-600">Réussies</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
            <p className="text-xs text-red-600">Erreurs</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </p>
            <p className="text-xs text-amber-600">Restantes</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {!isRunning ? (
          <>
            {showConfirm ? (
              <div className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800 flex-1">
                  Vous allez générer{" "}
                  <strong>{validItems.length} fiches</strong>. Elles seront
                  automatiquement sauvegardées en brouillon. Confirmer ?
                </p>
                <button
                  onClick={startBatch}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010]"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() =>
                    validItems.length > 0
                      ? setShowConfirm(true)
                      : toast.error("Ajoutez des personnalités d'abord.")
                  }
                  disabled={validItems.length === 0}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#1A1A1A] bg-[#F5A623] rounded-xl hover:bg-[#E09010] transition-colors disabled:opacity-50"
                >
                  <Rocket size={18} />
                  Lancer la génération en lot
                </button>
                {failedCount > 0 && (
                  <button
                    onClick={retryFailed}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5A623] border border-[#F5A623] rounded-lg hover:bg-[#F5A623]/5"
                  >
                    <RefreshCw size={16} />
                    Relancer les erreurs ({failedCount})
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <button
            onClick={togglePause}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors",
              isPaused
                ? "text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                : "text-amber-600 border-amber-300 hover:bg-amber-50"
            )}
          >
            {isPaused ? (
              <>
                <Play size={16} />
                Reprendre
              </>
            ) : (
              <>
                <Pause size={16} />
                Pause
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
