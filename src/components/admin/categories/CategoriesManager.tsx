"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, GripVertical, Users } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/admin/forms/ConfirmDialog";
import CategoryModal from "./CategoryModal";
import type { Category } from "@/types/database.types";

interface CategoriesManagerProps {
  initialCategories: Category[];
  categoryCounts: Record<string, number>;
}

export default function CategoriesManager({
  initialCategories,
  categoryCounts,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleSave = async (data: Partial<Category>) => {
    try {
      const supabase = createClient();

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(data)
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("Catégorie modifiée avec succès.");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({
            ...data,
            order: categories.length + 1,
          });

        if (error) throw error;
        toast.success("Catégorie créée avec succès.");
      }

      setShowModal(false);
      setEditingCategory(undefined);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const count = categoryCounts[deleteTarget.id] || 0;
    if (count > 0) {
      toast.error(
        `Impossible de supprimer : ${count} personnalité(s) liée(s).`
      );
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;
      toast.success("Catégorie supprimée.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingCategory(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] text-white text-sm font-medium rounded-lg hover:bg-[#E09010] transition-colors"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F8F8F8] flex items-center justify-center mb-4">
            <Users size={28} className="text-[#6B6B6B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
            Aucune catégorie
          </h3>
          <p className="text-sm text-[#6B6B6B]">
            Créez votre première catégorie pour organiser les personnalités.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    {category.icon || "📁"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A]">
                      {category.name}
                    </h3>
                    <p className="text-xs text-[#6B6B6B]">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#F5A623]"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(category)}
                    className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-red-50 hover:text-[#EF4444]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-[#6B6B6B] mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                <span>
                  {categoryCounts[category.id] || 0} personnalité(s)
                </span>
                <span className="flex items-center gap-1">
                  <GripVertical size={12} />
                  Ordre : {category.order}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        category={editingCategory}
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer cette catégorie ?"
        description={
          (categoryCounts[deleteTarget?.id || ""] || 0) > 0
            ? `Cette catégorie contient ${categoryCounts[deleteTarget?.id || ""]} personnalité(s). Vous ne pouvez pas la supprimer.`
            : "Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
        }
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}
