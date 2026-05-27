"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  DollarSign,
  Zap,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCostUSD } from "@/lib/ai/cost";
import type { AIGeneration } from "@/types/ai.types";

export default function GenerationHistory() {
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    totalGenerations: 0,
    totalCost: 0,
    validationRate: 0,
    tokensUsed: 0,
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (statusFilter) params.set("status", statusFilter);

      const [histRes, statsRes] = await Promise.all([
        fetch(`/api/admin/ai-generator/history?${params}`),
        fetch("/api/admin/ai-generator/stats"),
      ]);

      const histData = await histRes.json();
      const statsData = await statsRes.json();

      setGenerations(histData.data || []);
      setTotalPages(histData.totalPages || 1);
      setStats(statsData);
    } catch {
      console.error("Erreur chargement historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter]);

  const statusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; color: string; icon: React.ReactNode }
    > = {
      success: {
        label: "Brouillon",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <FileText size={12} />,
      },
      validated: {
        label: "Validé",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 size={12} />,
      },
      error: {
        label: "Erreur",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle size={12} />,
      },
      rejected: {
        label: "Rejeté",
        color: "bg-gray-50 text-gray-600 border-gray-200",
        icon: <XCircle size={12} />,
      },
      pending: {
        label: "En cours",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Loader2 size={12} className="animate-spin" />,
      },
    };

    const conf = config[status] || config.pending;

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
          conf.color
        )}
      >
        {conf.icon}
        {conf.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats du mois */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
              <FileText size={16} className="text-[#F5A623]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1A1A1A]">
            {stats.totalGenerations}
          </p>
          <p className="text-xs text-[#6B6B6B]">Générations ce mois</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1A1A1A]">
            {formatCostUSD(stats.totalCost)}
          </p>
          <p className="text-xs text-[#6B6B6B]">Coût ce mois</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1A1A1A]">
            {stats.validationRate}%
          </p>
          <p className="text-xs text-[#6B6B6B]">Taux de validation</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Zap size={16} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1A1A1A]">
            {stats.tokensUsed?.toLocaleString("fr-FR") || 0}
          </p>
          <p className="text-xs text-[#6B6B6B]">Tokens utilisés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
        >
          <option value="">Tous les statuts</option>
          <option value="success">Brouillons</option>
          <option value="validated">Validées</option>
          <option value="error">Erreurs</option>
          <option value="rejected">Rejetées</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#F5A623]" />
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-12">
            <FileText
              size={32}
              className="mx-auto text-[#6B6B6B] mb-2 opacity-50"
            />
            <p className="text-sm text-[#6B6B6B]">
              Aucune génération pour le moment.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">
                  Personnalité
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">
                  Admin
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#6B6B6B]">
                  Modèle
                </th>
                <th className="text-right px-4 py-3 font-medium text-[#6B6B6B]">
                  Tokens
                </th>
                <th className="text-right px-4 py-3 font-medium text-[#6B6B6B]">
                  Coût
                </th>
                <th className="text-center px-4 py-3 font-medium text-[#6B6B6B]">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {generations.map((gen) => (
                <tr
                  key={gen.id}
                  className="border-t border-[#E5E5E5] hover:bg-[#F8F8F8]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[#6B6B6B]">
                      <Clock size={12} />
                      {new Date(gen.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                    {gen.prompt_input?.personalityName || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B]">
                    {gen.admin?.full_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-[#6B6B6B]">
                      {gen.model_used?.replace("claude-", "") || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#6B6B6B]">
                    {gen.tokens_used?.toLocaleString("fr-FR") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#6B6B6B]">
                    {gen.cost_estimate
                      ? formatCostUSD(Number(gen.cost_estimate))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {statusBadge(gen.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5]">
            <p className="text-xs text-[#6B6B6B]">
              Page {page} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-[#F8F8F8] disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-[#F8F8F8] disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
