"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/types/ai.types";

interface AIWarningBannerProps {
  confidence?: ConfidenceLevel;
  warnings?: string[];
  compact?: boolean;
}

const confidenceConfig: Record<
  ConfidenceLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  high: {
    label: "Élevé",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  medium: {
    label: "Moyen",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  low: {
    label: "Faible",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

export default function AIWarningBanner({
  confidence,
  warnings = [],
  compact = false,
}: AIWarningBannerProps) {
  const conf = confidence ? confidenceConfig[confidence] : null;

  return (
    <div className="space-y-3">
      {conf && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4",
            conf.bg,
            conf.border
          )}
        >
          <ShieldAlert size={20} className={cn("flex-shrink-0 mt-0.5", conf.color)} />
          <div>
            <p className={cn("text-sm font-semibold", conf.color)}>
              Niveau de confiance : {conf.label}
            </p>
            {!compact && (
              <p className="text-sm text-[#6B6B6B] mt-1">
                Vérifiez systématiquement les informations avant publication.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={20} className="flex-shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Fiche générée par IA
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Cette fiche a été générée par intelligence artificielle. Vérifiez{" "}
            <strong>TOUTES</strong> les informations avant publication.
          </p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            Points à vérifier :
          </p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
