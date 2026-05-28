"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Users,
  ChevronDown,
  ChevronRight,
  Star,
  ListOrdered,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/admin/forms/ConfirmDialog";
import CategoryModal from "./CategoryModal";
import SubcategoryModal from "./SubcategoryModal";
import SubcategoryOrderModal from "./SubcategoryOrderModal";
import type { Category, Subcategory } from "@/types/database.types";

interface CategoriesManagerProps {
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
}

export default function CategoriesManager({
  initialCategories,
  initialSubcategories,
  categoryCounts,
  subcategoryCounts,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories] = useState(initialCategories);
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(initialCategories.map((c) => c.id))
  );

  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null);

  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | undefined>();
  const [subcategoryParentId, setSubcategoryParentId] = useState<string>("");
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [deleteSubcategoryTarget, setDeleteSubcategoryTarget] = useState<Subcategory | null>(null);
  const [orderSubcategory, setOrderSubcategory] = useState<Subcategory | null>(null);

  const subsByCategory = subcategories.reduce<Record<string, Subcategory[]>>(
    (acc, sub) => {
      if (!acc[sub.category_id]) acc[sub.category_id] = [];
      acc[sub.category_id].push(sub);
      return acc;
    },
    {}
  );

  Object.values(subsByCategory).forEach((subs) =>
    subs.sort((a, b) => a.order - b.order)
  );

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveCategory = async (data: Partial<Category>) => {
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
        const { error } = await supabase.from("categories").insert({
          ...data,
          order: categories.length + 1,
        });
        if (error) throw error;
        toast.success("Catégorie créée avec succès.");
      }

      setShowCategoryModal(false);
      setEditingCategory(undefined);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;

    const count = categoryCounts[deleteCategoryTarget.id] || 0;
    const subCount = (subsByCategory[deleteCategoryTarget.id] || []).length;
    if (count > 0) {
      toast.error(
        `Impossible de supprimer : ${count} personnalité(s) liée(s).`
      );
      return;
    }
    if (subCount > 0) {
      toast.error(
        `Impossible de supprimer : ${subCount} sous-catégorie(s) existante(s).`
      );
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", deleteCategoryTarget.id);
      if (error) throw error;
      toast.success("Catégorie supprimée.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleSaveSubcategory = async (data: Partial<Subcategory>) => {
    if (!subcategoryParentId && !editingSubcategory) return;

    try {
      const supabase = createClient();
      const categoryId = editingSubcategory?.category_id || subcategoryParentId;
      const siblings = subsByCategory[categoryId] || [];

      if (editingSubcategory) {
        const { error } = await supabase
          .from("subcategories")
          .update(data)
          .eq("id", editingSubcategory.id);
        if (error) throw error;
        toast.success("Sous-catégorie modifiée.");
      } else {
        const { error } = await supabase.from("subcategories").insert({
          ...data,
          category_id: categoryId,
          order: data.order ?? siblings.length + 1,
        });
        if (error) throw error;
        toast.success("Sous-catégorie créée.");
      }

      setShowSubcategoryModal(false);
      setEditingSubcategory(undefined);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde de la sous-catégorie.");
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!deleteSubcategoryTarget) return;

    const count = subcategoryCounts[deleteSubcategoryTarget.id] || 0;
    if (count > 0) {
      toast.error(
        `Impossible de supprimer : ${count} personnalité(s) liée(s).`
      );
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", deleteSubcategoryTarget.id);
      if (error) throw error;
      setSubcategories((prev) =>
        prev.filter((s) => s.id !== deleteSubcategoryTarget.id)
      );
      toast.success("Sous-catégorie supprimée.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const parentCategory = categories.find(
    (c) =>
      c.id === (editingSubcategory?.category_id || subcategoryParentId)
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingCategory(undefined);
            setShowCategoryModal(true);
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
        <div className="space-y-4">
          {categories.map((category) => {
            const subs = subsByCategory[category.id] || [];
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div
                key={category.id}
                className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden"
              >
                <div className="p-5 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleExpand(category.id)}
                        className="p-1 rounded text-[#6B6B6B] hover:bg-[#F8F8F8] shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{
                          backgroundColor: `${category.color}15`,
                          color: category.color,
                        }}
                      >
                        {category.icon || "📁"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#1A1A1A]">
                          {category.name}
                        </h3>
                        <p className="text-xs text-[#6B6B6B]">
                          /{category.slug} · {categoryCounts[category.id] || 0}{" "}
                          pers. · {subs.length} sous-cat.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => {
                          setSubcategoryParentId(category.id);
                          setEditingSubcategory(undefined);
                          setShowSubcategoryModal(true);
                        }}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F5A623]/10 hover:text-[#F5A623]"
                        title="Ajouter une sous-catégorie"
                      >
                        <FolderTree size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowCategoryModal(true);
                        }}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#F5A623]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteCategoryTarget(category)}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-red-50 hover:text-[#EF4444]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-[#6B6B6B] mt-2 ml-12 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 ml-12 text-xs text-[#6B6B6B]">
                    <span className="flex items-center gap-1">
                      <GripVertical size={12} />
                      Ordre : {category.order}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#E5E5E5] bg-[#FAFAFA] px-5 py-3">
                    {subs.length === 0 ? (
                      <p className="text-sm text-[#6B6B6B] py-2 ml-8">
                        Aucune sous-catégorie.{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setSubcategoryParentId(category.id);
                            setEditingSubcategory(undefined);
                            setShowSubcategoryModal(true);
                          }}
                          className="text-[#F5A623] hover:underline"
                        >
                          En créer une
                        </button>
                      </p>
                    ) : (
                      <ul className="space-y-2 ml-8">
                        {subs.map((sub) => (
                          <li
                            key={sub.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#E5E5E5] group/sub"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {sub.featured && (
                                <Star
                                  size={14}
                                  className="text-[#F5A623] fill-[#F5A623] shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <span className="text-sm font-medium text-[#1A1A1A]">
                                  {sub.name}
                                </span>
                                <span className="text-xs text-[#6B6B6B] ml-2">
                                  /{sub.slug} · {subcategoryCounts[sub.id] || 0}{" "}
                                  pers.
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => setOrderSubcategory(sub)}
                                className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F5A623]/10 hover:text-[#F5A623]"
                                title="Ordre des personnalités"
                              >
                                <ListOrdered size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSubcategory(sub);
                                  setSubcategoryParentId(sub.category_id);
                                  setShowSubcategoryModal(true);
                                }}
                                className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#F5A623]"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteSubcategoryTarget(sub)}
                                className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-red-50 hover:text-[#EF4444]"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CategoryModal
        category={editingCategory}
        open={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
      />

      <SubcategoryModal
        subcategory={editingSubcategory}
        categoryName={parentCategory?.name || ""}
        open={showSubcategoryModal}
        onClose={() => {
          setShowSubcategoryModal(false);
          setEditingSubcategory(undefined);
        }}
        onSave={handleSaveSubcategory}
      />

      <SubcategoryOrderModal
        subcategory={orderSubcategory}
        open={!!orderSubcategory}
        onClose={() => setOrderSubcategory(null)}
        onSaved={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Supprimer cette catégorie ?"
        description={
          (categoryCounts[deleteCategoryTarget?.id || ""] || 0) > 0
            ? `Cette catégorie contient ${categoryCounts[deleteCategoryTarget?.id || ""]} personnalité(s).`
            : "Êtes-vous sûr ? Les sous-catégories seront aussi supprimées."
        }
        confirmLabel="Supprimer"
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteSubcategoryTarget}
        onClose={() => setDeleteSubcategoryTarget(null)}
        onConfirm={handleDeleteSubcategory}
        title="Supprimer cette sous-catégorie ?"
        description={
          (subcategoryCounts[deleteSubcategoryTarget?.id || ""] || 0) > 0
            ? `Cette sous-catégorie contient ${subcategoryCounts[deleteSubcategoryTarget?.id || ""]} personnalité(s).`
            : "Cette action est irréversible."
        }
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}
