"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  DollarSign,
  Shield,
  Cpu,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import type { AISettings } from "@/types/ai.types";

const MODELS = [
  {
    value: "claude-opus-4-7",
    label: "Claude Opus 4.7",
    desc: "Le plus puissant, le plus cher",
  },
  {
    value: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    desc: "Équilibré (recommandé)",
  },
  {
    value: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    desc: "Rapide et économique",
  },
];

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ai-generator/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erreur chargement des paramètres");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/ai-generator/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success("Paramètres sauvegardés !");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur de sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#F5A623]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <p className="text-sm text-[#6B6B6B] py-8 text-center">
        Impossible de charger les paramètres.
      </p>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Activation */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.is_enabled ? (
              <ToggleRight size={28} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={28} className="text-[#6B6B6B]" />
            )}
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Générateur IA
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                {settings.is_enabled
                  ? "Activé — tous les admins peuvent générer"
                  : "Désactivé — personne ne peut générer"}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, is_enabled: !settings.is_enabled })
            }
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              settings.is_enabled
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            {settings.is_enabled ? "Désactiver" : "Activer"}
          </button>
        </div>
      </div>

      {/* Modèle */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-[#F5A623]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Modèle par défaut
          </h3>
        </div>
        <div className="space-y-2">
          {MODELS.map((model) => (
            <label
              key={model.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                settings.default_model === model.value
                  ? "border-[#F5A623] bg-[#F5A623]/5"
                  : "border-[#E5E5E5] hover:border-[#F5A623]/50"
              }`}
            >
              <input
                type="radio"
                name="model"
                value={model.value}
                checked={settings.default_model === model.value}
                onChange={() =>
                  setSettings({ ...settings, default_model: model.value })
                }
                className="accent-[#F5A623]"
              />
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {model.label}
                </p>
                <p className="text-xs text-[#6B6B6B]">{model.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Limites de dépenses */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-[#F5A623]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Limites de dépenses
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Budget mensuel global (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.monthly_budget_usd}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  monthly_budget_usd: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Limite par utilisateur (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.per_user_budget_usd}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  per_user_budget_usd: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
            />
          </div>
        </div>
      </div>

      {/* Rate limiting */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#F5A623]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Limites d'utilisation
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Limite par heure (par utilisateur)
            </label>
            <input
              type="number"
              value={settings.hourly_limit_per_user}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hourly_limit_per_user: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Limite par jour (par utilisateur)
            </label>
            <input
              type="number"
              value={settings.daily_limit_per_user}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  daily_limit_per_user: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
            />
          </div>
        </div>
      </div>

      {/* Bouton sauvegarder */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#1A1A1A] bg-[#F5A623] rounded-xl hover:bg-[#E09010] transition-colors disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Sauvegarder les paramètres
      </button>
    </div>
  );
}
