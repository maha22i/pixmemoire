"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Star } from "lucide-react";
import type { Subcategory } from "@/types/database.types";

const subcategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  order: z.number().int().min(0),
  featured: z.boolean(),
});

type SubcategoryFormData = z.infer<typeof subcategorySchema>;

interface SubcategoryModalProps {
  subcategory?: Subcategory;
  categoryName: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Subcategory>) => void;
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

export default function SubcategoryModal({
  subcategory,
  categoryName,
  open,
  onClose,
  onSave,
}: SubcategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      color: "",
      order: 0,
      featured: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: subcategory?.name || "",
        slug: subcategory?.slug || "",
        description: subcategory?.description || "",
        icon: subcategory?.icon || "",
        color: subcategory?.color || "",
        order: subcategory?.order || 0,
        featured: subcategory?.featured || false,
      });
    }
  }, [open, subcategory, reset]);

  const name = watch("name");
  const featured = watch("featured");

  useEffect(() => {
    if (!subcategory && name) {
      setValue("slug", toSlug(name));
    }
  }, [name, subcategory, setValue]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            {subcategory ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8]"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-[#6B6B6B] mb-6">
          Catégorie parente : <span className="font-medium">{categoryName}</span>
        </p>

        <form
          onSubmit={handleSubmit((data) => onSave(data))}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Nom <span className="text-[#EF4444]">*</span>
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              placeholder="Ex: Politique locale"
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
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">Ordre</label>
              <input
                type="number"
                {...register("order", { valueAsNumber: true })}
                min={0}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Couleur (optionnel)
              </label>
              <input
                {...register("color")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                placeholder="#F5A623"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5] cursor-pointer hover:border-[#F5A623]/50 transition-colors">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setValue("featured", e.target.checked)}
              className="accent-[#F5A623]"
            />
            <div className="flex items-center gap-2">
              <Star
                size={16}
                className={featured ? "text-[#F5A623] fill-[#F5A623]" : "text-[#6B6B6B]"}
              />
              <div>
                <span className="text-sm font-medium text-[#1A1A1A]">
                  Mettre en avant sur l&apos;accueil
                </span>
                <p className="text-xs text-[#6B6B6B]">
                  Affiche cette sous-catégorie dans la section dédiée de la page d&apos;accueil
                </p>
              </div>
            </div>
          </label>

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] transition-colors disabled:opacity-50"
            >
              {subcategory ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
