"use client";

import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Subcategory } from "@/types/database.types";

interface PersonalityRow {
  id: string;
  full_name: string;
  display_name: string;
  main_photo_url: string;
  order: number;
}

interface SubcategoryOrderModalProps {
  subcategory: Subcategory | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function SubcategoryOrderModal({
  subcategory,
  open,
  onClose,
  onSaved,
}: SubcategoryOrderModalProps) {
  const [personalities, setPersonalities] = useState<PersonalityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !subcategory) return;

    async function load() {
      setLoading(true);
      const supabase = createClient();

      const { data: links } = await supabase
        .from("personality_subcategories")
        .select("personality_id, order")
        .eq("subcategory_id", subcategory!.id)
        .order("order", { ascending: true });

      if (!links || links.length === 0) {
        setPersonalities([]);
        setLoading(false);
        return;
      }

      const ids = links.map((l) => l.personality_id);
      const orderMap = new Map(links.map((l) => [l.personality_id, l.order]));

      const { data: rows } = await supabase
        .from("personalities")
        .select("id, full_name, display_name, main_photo_url")
        .in("id", ids);

      const sorted = (rows ?? [])
        .map((p) => ({
          ...p,
          order: orderMap.get(p.id) ?? 0,
        }))
        .sort((a, b) => a.order - b.order);

      setPersonalities(sorted);
      setLoading(false);
    }

    load();
  }, [open, subcategory]);

  const move = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= personalities.length) return;
    const updated = [...personalities];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setPersonalities(updated.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const handleSave = async () => {
    if (!subcategory) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await Promise.all(
        personalities.map((p, i) =>
          supabase
            .from("personality_subcategories")
            .update({ order: i + 1 })
            .eq("personality_id", p.id)
            .eq("subcategory_id", subcategory.id)
        )
      );
      toast.success("Ordre d'affichage enregistré.");
      onSaved();
      onClose();
    } catch {
      toast.error("Erreur lors de la sauvegarde de l'ordre.");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !subcategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Ordre d&apos;affichage
            </h2>
            <p className="text-xs text-[#6B6B6B]">{subcategory.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#F5A623]" size={24} />
            </div>
          ) : personalities.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-8">
              Aucune personnalité dans cette sous-catégorie.
            </p>
          ) : (
            <ul className="space-y-2">
              {personalities.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8]/50"
                >
                  <span className="w-6 text-xs font-medium text-[#6B6B6B] text-center">
                    {i + 1}
                  </span>
                  {p.main_photo_url ? (
                    <img
                      src={p.main_photo_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E5E5E5] flex items-center justify-center text-xs font-medium">
                      {p.full_name.charAt(0)}
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium text-[#1A1A1A] truncate">
                    {p.display_name || p.full_name}
                  </span>
                  <div className="flex gap-0.5">
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
                      disabled={i === personalities.length - 1}
                      className="p-1 rounded text-[#6B6B6B] hover:bg-white disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6B6B6B] bg-[#F8F8F8] rounded-lg"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || personalities.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer l'ordre"}
          </button>
        </div>
      </div>
    </div>
  );
}
