"use client";

import { useState } from "react";
import { Bot, ListChecks, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import AIGeneratorForm from "./AIGeneratorForm";
import BatchGeneratorTable from "./BatchGeneratorTable";
import type { Category } from "@/types/database.types";

interface AIGeneratorPageProps {
  categories: Category[];
  defaultModel: string;
  isEnabled: boolean;
}

export default function AIGeneratorPage({
  categories,
  defaultModel,
  isEnabled,
}: AIGeneratorPageProps) {
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

  if (!isEnabled) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <AlertTriangle
            size={40}
            className="mx-auto text-amber-500 mb-4"
          />
          <h2 className="text-lg font-semibold text-amber-800 mb-2">
            Générateur IA désactivé
          </h2>
          <p className="text-sm text-amber-700">
            Le générateur IA est actuellement désactivé par l'administrateur.
            Contactez le super admin pour l'activer dans les paramètres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Bot size={28} className="text-[#F5A623]" />
            Générateur IA
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Générez des fiches de personnalités djiboutiennes propulsées par
            Claude
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-[#E5E5E5]">
        <button
          onClick={() => setActiveTab("single")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "single"
              ? "border-[#F5A623] text-[#F5A623]"
              : "border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]"
          )}
        >
          <Bot size={16} />
          Génération unique
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === "batch"
              ? "border-[#F5A623] text-[#F5A623]"
              : "border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]"
          )}
        >
          <ListChecks size={16} />
          Génération en lot
        </button>
      </div>

      {/* Contenu */}
      {activeTab === "single" ? (
        <AIGeneratorForm
          categories={categories}
          defaultModel={defaultModel}
        />
      ) : (
        <BatchGeneratorTable defaultModel={defaultModel} />
      )}
    </div>
  );
}
