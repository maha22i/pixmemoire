import type { AIDetailLevel } from "@/types/ai.types";

interface ModelPricing {
  input: number;
  output: number;
}

const PRICING_PER_MILLION: Record<string, ModelPricing> = {
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

const FDJ_PER_USD = 177.72;

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = PRICING_PER_MILLION[model] || PRICING_PER_MILLION["claude-sonnet-4-6"];
  return (
    (inputTokens * rates.input) / 1_000_000 +
    (outputTokens * rates.output) / 1_000_000
  );
}

export function estimateCost(
  model: string,
  detailLevel: AIDetailLevel
): { usd: number; fdj: number; tokens: number } {
  const tokenEstimates: Record<AIDetailLevel, { input: number; output: number }> = {
    concis: { input: 1200, output: 2000 },
    standard: { input: 1200, output: 4000 },
    detaille: { input: 1200, output: 7000 },
  };

  const estimate = tokenEstimates[detailLevel];
  const usd = calculateCost(model, estimate.input, estimate.output);

  return {
    usd: Math.round(usd * 10000) / 10000,
    fdj: Math.round(usd * FDJ_PER_USD * 100) / 100,
    tokens: estimate.input + estimate.output,
  };
}

export function formatCostUSD(cost: number): string {
  if (cost < 0.01) return `< $0.01`;
  return `$${cost.toFixed(4)}`;
}

export function formatCostFDJ(usd: number): string {
  const fdj = usd * FDJ_PER_USD;
  return `${fdj.toFixed(0)} FDJ`;
}
