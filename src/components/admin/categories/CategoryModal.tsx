"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import type { Category } from "@/types/database.types";

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  order: z.number().int().min(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  category?: Category;
  existingCategories?: Category[];
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const ICON_SUGGESTIONS = [
  "users", "music", "briefcase", "trophy", "book",
  "globe", "heart", "star", "award", "landmark",
  "mic", "palette", "pen-tool", "film", "graduation-cap",
];

export default function CategoryModal({
  category,
  existingCategories = [],
  open,
  onClose,
  onSave,
}: CategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      color: "#F5A623",
      order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name || "",
        slug: category?.slug || "",
        description: category?.description || "",
        icon: category?.icon || "",
        color: category?.color || "#F5A623",
        order: category?.order || 0,
      });
    }
  }, [open, category, reset]);

  const name = watch("name");
  const color = watch("color");
  const slug = watch("slug");

  const slugConflict = slug
    ? existingCategories.find(
        (item) => item.slug === slug && item.id !== category?.id
      )
    : undefined;

  useEffect(() => {
    if (!category && name) {
      setValue("slug", toSlug(name));
    }
  }, [name, category, setValue]);

  if (!open) return null;

  const onSubmitForm = (data: CategoryFormData) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Nom <span className="text-[#EF4444]">*</span>
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              placeholder="Nom de la catégorie"
            />
            {errors.name && (
              <p className="text-xs text-[#EF4444]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Slug</label>
            <input
              {...register("slug")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
            />
            {slugConflict && (
              <p className="text-xs text-[#EF4444]">
                Ce slug est déjà utilisé par « {slugConflict.name} ». Modifiez le
                slug pour continuer.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] resize-none"
              placeholder="Description de la catégorie..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Icône (nom lucide)</label>
            <input
              {...register("icon")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              placeholder="Ex: users, music, trophy..."
            />
            <div className="flex flex-wrap gap-1.5 mt-1">
              {ICON_SUGGESTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-[#F8F8F8] text-[#6B6B6B] hover:bg-[#F5A623]/10 hover:text-[#F5A623] transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">Couleur</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("color")}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <input
                  {...register("color")}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">Ordre</label>
              <input
                type="number"
                {...register("order")}
                min={0}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B6B6B] bg-[#F8F8F8] rounded-lg hover:bg-[#E5E5E5] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(slugConflict)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] transition-colors disabled:opacity-50"
            >
              {category ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
