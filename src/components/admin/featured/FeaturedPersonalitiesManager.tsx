"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ChevronUp,
  ChevronDown,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Personality } from "@/types/database.types";

const MAX_FEATURED = 6;

interface FeaturedPersonalitiesManagerProps {
  publishedPersonalities: Personality[];
  initialFeatured: Personality[];
}

export default function FeaturedPersonalitiesManager({
  publishedPersonalities,
  initialFeatured,
}: FeaturedPersonalitiesManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState<Personality[]>(
    [...initialFeatured].sort(
      (a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0)
    )
  );
  const [saving, setSaving] = useState(false);

  const featuredIds = new Set(featured.map((p) => p.id));

  const available = publishedPersonalities
    .filter((p) => !featuredIds.has(p.id))
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.display_name?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q)
      );
    });

  const addFeatured = (personality: Personality) => {
    if (featured.length >= MAX_FEATURED) {
      toast.error(`Maximum ${MAX_FEATURED} personnalités à la une.`);
      return;
    }
    setFeatured((prev) => [...prev, personality]);
  };

  const removeFeatured = (id: string) => {
    setFeatured((prev) => prev.filter((p) => p.id !== id));
  };

  const move = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= featured.length) return;
    const updated = [...featured];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFeatured(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();

      const previouslyFeatured = initialFeatured.map((p) => p.id);
      const toRemove = previouslyFeatured.filter((id) => !featuredIds.has(id));

      await Promise.all(
        toRemove.map((id) =>
          supabase
            .from("personalities")
            .update({ featured: false, featured_order: 0 })
            .eq("id", id)
        )
      );

      await Promise.all(
        featured.map((p, i) =>
          supabase
            .from("personalities")
            .update({ featured: true, featured_order: i + 1 })
            .eq("id", p.id)
        )
      );

      toast.success("Section « À la une » mise à jour.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="p-4 border-b border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-[#F5A623]" />
            <h2 className="font-semibold text-[#1A1A1A]">
              À la une sur l&apos;accueil
            </h2>
            <span className="text-xs text-[#6B6B6B] ml-auto">
              {featured.length}/{MAX_FEATURED}
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Ces personnalités apparaissent dans la section « Personnalités
            emblématiques ». Utilisez les flèches pour définir l&apos;ordre.
          </p>
        </div>

        <div className="p-4 min-h-[320px]">
          {featured.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-12">
              Aucune personnalité sélectionnée. Ajoutez-en depuis la liste à
              droite.
            </p>
          ) : (
            <ul className="space-y-2">
              {featured.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#F5A623]/30 bg-[#F5A623]/5"
                >
                  <span className="w-6 text-xs font-bold text-[#F5A623] text-center">
                    {i + 1}
                  </span>
                  {p.main_photo_url ? (
                    <img
                      src={p.main_photo_url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#E5E5E5] flex items-center justify-center text-sm font-medium">
                      {p.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {p.display_name || p.full_name}
                    </p>
                    <p className="text-xs text-[#6B6B6B] truncate">{p.title}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="p-1 rounded text-[#6B6B6B] hover:bg-white disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === featured.length - 1}
                      className="p-1 rounded text-[#6B6B6B] hover:bg-white disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFeatured(p.id)}
                      className="p-1 rounded text-[#6B6B6B] hover:text-[#EF4444] hover:bg-white ml-1"
                      title="Retirer"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Star size={16} />
            )}
            Enregistrer la sélection
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="p-4 border-b border-[#E5E5E5]">
          <h2 className="font-semibold text-[#1A1A1A] mb-3">
            Personnalités publiées
          </h2>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
            />
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {available.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-8">
              {search
                ? "Aucun résultat."
                : "Toutes les personnalités publiées sont déjà à la une."}
            </p>
          ) : (
            <ul className="space-y-1">
              {available.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => addFeatured(p)}
                    disabled={featured.length >= MAX_FEATURED}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F8F8] transition-colors text-left disabled:opacity-50"
                  >
                    {p.main_photo_url ? (
                      <img
                        src={p.main_photo_url}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#E5E5E5] flex items-center justify-center text-xs font-medium">
                        {p.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {p.display_name || p.full_name}
                      </p>
                      <p className="text-xs text-[#6B6B6B] truncate">{p.title}</p>
                    </div>
                    <span className="text-xs font-medium text-[#F5A623] shrink-0">
                      + Ajouter
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
