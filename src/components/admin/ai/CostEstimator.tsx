"use client";

import { DollarSign } from "lucide-react";
import { estimateCost, formatCostUSD, formatCostFDJ } from "@/lib/ai/cost";
import type { AIDetailLevel } from "@/types/ai.types";

interface CostEstimatorProps {
  model: string;
  detailLevel: AIDetailLevel;
}

export default function CostEstimator({ model, detailLevel }: CostEstimatorProps) {
  const estimate = estimateCost(model, detailLevel);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5]">
      <DollarSign size={16} className="text-[#F5A623]" />
      <div className="text-xs">
        <span className="text-[#6B6B6B]">Coût estimé : </span>
        <span className="font-semibold text-[#1A1A1A]">
          {formatCostUSD(estimate.usd)}
        </span>
        <span className="text-[#6B6B6B] ml-1.5">
          ({formatCostFDJ(estimate.usd)})
        </span>
        <span className="text-[#6B6B6B] ml-1.5">
          ~{estimate.tokens.toLocaleString("fr-FR")} tokens
        </span>
      </div>
    </div>
  );
}
