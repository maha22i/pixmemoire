"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, FileText, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  isGenerating: boolean;
}

const STEPS = [
  { icon: Search, label: "Recherche d'informations...", delay: 0 },
  { icon: FileText, label: "Rédaction de la biographie...", delay: 3000 },
  { icon: Clock, label: "Génération de la chronologie...", delay: 7000 },
  { icon: BookOpen, label: "Compilation des sources...", delay: 11000 },
];

export default function GenerationProgress({
  isGenerating,
}: GenerationProgressProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setActiveStep(0);
      return;
    }

    const timers = STEPS.map((step, index) =>
      setTimeout(() => setActiveStep(index), step.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Loader2 size={20} className="animate-spin text-[#F5A623]" />
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Génération en cours...
        </h3>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isDone = index < activeStep;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                isActive && "bg-[#F5A623]/10 border border-[#F5A623]/20",
                isDone && "bg-emerald-50 border border-emerald-100",
                !isActive && !isDone && "opacity-40"
              )}
            >
              {isActive ? (
                <Loader2 size={16} className="animate-spin text-[#F5A623]" />
              ) : (
                <Icon
                  size={16}
                  className={cn(
                    isDone ? "text-emerald-500" : "text-[#6B6B6B]"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-sm",
                  isActive
                    ? "text-[#F5A623] font-medium"
                    : isDone
                      ? "text-emerald-600"
                      : "text-[#6B6B6B]"
                )}
              >
                {isDone ? step.label.replace("...", " ✓") : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
