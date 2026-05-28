"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/components/admin/forms/ImageUploader";
import SlugInput from "@/components/admin/forms/SlugInput";
import type {
  Personality,
  Category,
  Subcategory,
  VideoEntry,
  SourceEntry,
} from "@/types/database.types";

const personalitySchema = z.object({
  full_name: z.string().min(1, "Le nom complet est requis"),
  display_name: z.string().optional(),
  slug: z.string().min(1, "Le slug est requis"),
  title: z.string().min(1, "Le titre/fonction est requis"),
  famous_quote: z.string().optional(),
  gender: z.enum(["M", "F"]),
  birth_date: z.string().optional(),
  death_date: z.string().optional(),
  birth_place: z.string().optional(),
  origin_region: z.enum([
    "djibouti-ville",
    "tadjourah",
    "dikhil",
    "ali-sabieh",
    "obock",
    "arta",
  ]),
  era: z.enum(["pre_independence", "post_independence", "contemporary"]),
  short_bio: z.string().min(1, "Le résumé est requis").max(300, "Maximum 300 caractères"),
  full_bio: z.string().min(1, "La biographie est requise"),
  achievements: z.string().optional(),
});

type FormData = z.infer<typeof personalitySchema>;

interface SubcategoryLink {
  subcategory_id: string;
  order: number;
}

interface PersonalityFormProps {
  personality?: Personality;
  categories: Category[];
  subcategories?: Subcategory[];
  linkedCategoryIds?: string[];
  linkedSubcategories?: SubcategoryLink[];
  timelineEvents?: Array<{
    id: string;
    event_date: string;
    title: string;
    description: string;
    order: number;
  }>;
  mode: "create" | "edit";
}

const TABS = [
  "Informations",
  "Biographie",
  "Catégories",
  "Galerie",
  "Vidéos",
  "Sources",
];

const REGIONS = [
  { value: "djibouti-ville", label: "Djibouti-ville" },
  { value: "tadjourah", label: "Tadjourah" },
  { value: "dikhil", label: "Dikhil" },
  { value: "ali-sabieh", label: "Ali Sabieh" },
  { value: "obock", label: "Obock" },
  { value: "arta", label: "Arta" },
];

const ERAS = [
  { value: "pre_independence", label: "Pré-indépendance" },
  { value: "post_independence", label: "Post-indépendance" },
  { value: "contemporary", label: "Contemporaine" },
];

export default function PersonalityForm({
  personality,
  categories,
  subcategories = [],
  linkedCategoryIds = [],
  linkedSubcategories = [],
  mode,
}: PersonalityFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [mainPhoto, setMainPhoto] = useState(personality?.main_photo_url || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(linkedCategoryIds);
  const [selectedSubs, setSelectedSubs] = useState<SubcategoryLink[]>(linkedSubcategories);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(personality?.gallery_urls || []);
  const [videos, setVideos] = useState<VideoEntry[]>(personality?.video_urls || []);
  const [sources, setSources] = useState<SourceEntry[]>(personality?.sources || []);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(personalitySchema),
    defaultValues: {
      full_name: personality?.full_name || "",
      display_name: personality?.display_name || "",
      slug: personality?.slug || "",
      title: personality?.title || "",
      famous_quote: personality?.famous_quote || "",
      gender: personality?.gender || "M",
      birth_date: personality?.birth_date || "",
      death_date: personality?.death_date || "",
      birth_place: personality?.birth_place || "",
      origin_region: personality?.origin_region || "djibouti-ville",
      era: personality?.era || "contemporary",
      short_bio: personality?.short_bio || "",
      full_bio: personality?.full_bio || "",
      achievements: personality?.achievements || "",
    },
  });

  const fullName = watch("full_name");
  const shortBio = watch("short_bio");
  const slug = watch("slug");

  const subsByCategory = subcategories.reduce<Record<string, Subcategory[]>>(
    (acc, sub) => {
      if (!acc[sub.category_id]) acc[sub.category_id] = [];
      acc[sub.category_id].push(sub);
      return acc;
    },
    {}
  );

  const saveCategoryLinks = async (
    supabase: ReturnType<typeof createClient>,
    personalityId: string
  ) => {
    const parentCatIds = selectedSubs
      .map((s) => subcategories.find((sub) => sub.id === s.subcategory_id)?.category_id)
      .filter((id): id is string => !!id);

    const allCategoryIds = [
      ...new Set([...selectedCategories, ...parentCatIds]),
    ];

    await supabase
      .from("personality_categories")
      .delete()
      .eq("personality_id", personalityId);

    await supabase
      .from("personality_subcategories")
      .delete()
      .eq("personality_id", personalityId);

    if (allCategoryIds.length > 0) {
      await supabase.from("personality_categories").insert(
        allCategoryIds.map((catId) => ({
          personality_id: personalityId,
          category_id: catId,
        }))
      );
    }

    if (selectedSubs.length > 0) {
      await supabase.from("personality_subcategories").insert(
        selectedSubs.map((s) => ({
          personality_id: personalityId,
          subcategory_id: s.subcategory_id,
          order: s.order,
        }))
      );
    }
  };

  const toggleCategory = (catId: string) => {
    const subsInCat = subsByCategory[catId] || [];
    const hasSubsSelected = selectedSubs.some((s) =>
      subsInCat.some((sub) => sub.id === s.subcategory_id)
    );

    if (selectedCategories.includes(catId)) {
      setSelectedCategories((prev) => prev.filter((id) => id !== catId));
    } else if (!hasSubsSelected) {
      setSelectedCategories((prev) => [...prev, catId]);
    }
  };

  const toggleSubcategory = (sub: Subcategory) => {
    const isSelected = selectedSubs.some((s) => s.subcategory_id === sub.id);

    if (isSelected) {
      setSelectedSubs((prev) =>
        prev.filter((s) => s.subcategory_id !== sub.id)
      );
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== sub.category_id));
      const siblingsCount = (selectedSubs.filter((s) => {
        const sibling = subcategories.find((x) => x.id === s.subcategory_id);
        return sibling?.category_id === sub.category_id;
      }).length) + 1;
      setSelectedSubs((prev) => [
        ...prev,
        { subcategory_id: sub.id, order: siblingsCount },
      ]);
    }
  };

  const updateSubOrder = (subcategoryId: string, order: number) => {
    setSelectedSubs((prev) =>
      prev.map((s) =>
        s.subcategory_id === subcategoryId ? { ...s, order } : s
      )
    );
  };

  const onSubmit = async (data: FormData, status: "draft" | "published") => {
    setIsSaving(true);

    try {
      const supabase = createClient();
      const payload = {
        ...data,
        display_name: data.display_name || data.full_name,
        birth_date: data.birth_date || null,
        death_date: data.death_date || null,
        main_photo_url: mainPhoto,
        gallery_urls: galleryUrls,
        video_urls: videos,
        sources,
        status,
        is_alive: !data.death_date,
        featured: personality?.featured || false,
        views_count: personality?.views_count || 0,
      };

      if (mode === "edit" && personality) {
        const { error } = await supabase
          .from("personalities")
          .update(payload)
          .eq("id", personality.id);

        if (error) throw error;

        await saveCategoryLinks(supabase, personality.id);

        toast.success(
          status === "published"
            ? "Personnalité publiée avec succès !"
            : "Brouillon enregistré."
        );
      } else {
        const { data: newPersonality, error } = await supabase
          .from("personalities")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        if (newPersonality) {
          await saveCategoryLinks(supabase, newPersonality.id);
        }

        toast.success(
          status === "published"
            ? "Personnalité créée et publiée !"
            : "Brouillon créé avec succès."
        );
      }

      router.push("/admin/personalities");
      router.refresh();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  const addVideo = () => {
    setVideos([...videos, { title: "", youtube_id: "", description: "" }]);
  };

  const updateVideo = (index: number, field: keyof VideoEntry, value: string) => {
    const updated = [...videos];
    if (field === "youtube_id") {
      const match = value.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      updated[index] = { ...updated[index], youtube_id: match ? match[1] : value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setVideos(updated);
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const addSource = () => {
    setSources([...sources, { title: "", url: "", type: "web" }]);
  };

  const updateSource = (index: number, field: keyof SourceEntry, value: string) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value } as SourceEntry;
    setSources(updated);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-[#E5E5E5] mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === i
                ? "border-[#F5A623] text-[#F5A623]"
                : "border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <form className="space-y-6">
        {activeTab === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-5">
            <ImageUploader
              value={mainPhoto}
              onChange={setMainPhoto}
              onRemove={() => setMainPhoto("")}
              label="Photo principale"
              folder="portraits"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Nom complet <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  {...register("full_name")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                  placeholder="Prénom Nom"
                />
                {errors.full_name && (
                  <p className="text-xs text-[#EF4444]">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Nom d'affichage
                </label>
                <input
                  {...register("display_name")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                  placeholder="Nom tel qu'affiché sur le site"
                />
              </div>
            </div>

            <SlugInput
              value={slug}
              onChange={(v) => setValue("slug", v)}
              sourceValue={fullName}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Titre / Fonction <span className="text-[#EF4444]">*</span>
              </label>
              <input
                {...register("title")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                placeholder="Ex: Homme politique, Artiste, Sportif..."
              />
              {errors.title && (
                <p className="text-xs text-[#EF4444]">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Citation emblématique
              </label>
              <textarea
                {...register("famous_quote")}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] resize-none"
                placeholder="Une citation mémorable..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">Genre</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      value="M"
                      {...register("gender")}
                      className="accent-[#F5A623]"
                    />
                    Homme
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      value="F"
                      {...register("gender")}
                      className="accent-[#F5A623]"
                    />
                    Femme
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Date de naissance
                </label>
                <input
                  type="date"
                  {...register("birth_date")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Date de décès
                </label>
                <input
                  type="date"
                  {...register("death_date")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Lieu de naissance
                </label>
                <input
                  {...register("birth_place")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                  placeholder="Ville, pays"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Région d'origine <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  {...register("origin_region")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Époque <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  {...register("era")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                >
                  {ERAS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#1A1A1A]">
                  Résumé court <span className="text-[#EF4444]">*</span>
                </label>
                <span
                  className={cn(
                    "text-xs",
                    (shortBio?.length || 0) > 300
                      ? "text-[#EF4444]"
                      : "text-[#6B6B6B]"
                  )}
                >
                  {shortBio?.length || 0}/300
                </span>
              </div>
              <textarea
                {...register("short_bio")}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] resize-none"
                placeholder="Résumé concis de la personnalité..."
              />
              {errors.short_bio && (
                <p className="text-xs text-[#EF4444]">{errors.short_bio.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Biographie complète <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                {...register("full_bio")}
                rows={12}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] resize-y"
                placeholder="Biographie détaillée..."
              />
              {errors.full_bio && (
                <p className="text-xs text-[#EF4444]">{errors.full_bio.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Réalisations & contributions
              </label>
              <textarea
                {...register("achievements")}
                rows={6}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] resize-y"
                placeholder="Principales réalisations..."
              />
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-[#1A1A1A] mb-1">
                Catégories et sous-catégories
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Classez dans une catégorie directement, ou dans une sous-catégorie
                (avec ordre d&apos;affichage). Une sous-catégorie lie automatiquement
                la catégorie parente.
              </p>
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">
                Aucune catégorie disponible. Créez-en d&apos;abord dans le module Catégories.
              </p>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => {
                  const catSubs = (subsByCategory[cat.id] || []).sort(
                    (a, b) => a.order - b.order
                  );
                  const hasSubsSelected = selectedSubs.some((s) =>
                    catSubs.some((sub) => sub.id === s.subcategory_id)
                  );
                  const isCatSelected =
                    selectedCategories.includes(cat.id) && !hasSubsSelected;

                  return (
                    <div
                      key={cat.id}
                      className="rounded-lg border border-[#E5E5E5] overflow-hidden"
                    >
                      <label
                        className={cn(
                          "flex items-center gap-3 p-4 cursor-pointer transition-all",
                          isCatSelected
                            ? "bg-[#F5A623]/5 border-b border-[#F5A623]/20"
                            : "bg-[#FAFAFA] hover:bg-[#F8F8F8]"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isCatSelected}
                          disabled={hasSubsSelected}
                          onChange={() => toggleCategory(cat.id)}
                          className="accent-[#F5A623]"
                        />
                        <div>
                          <span className="text-sm font-semibold text-[#1A1A1A]">
                            {cat.name}
                          </span>
                          {hasSubsSelected && (
                            <p className="text-xs text-[#6B6B6B]">
                              Via sous-catégorie(s) sélectionnée(s)
                            </p>
                          )}
                        </div>
                      </label>

                      {catSubs.length > 0 && (
                        <div className="px-4 py-3 space-y-2 bg-white">
                          <p className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">
                            Sous-catégories
                          </p>
                          {catSubs.map((sub) => {
                            const link = selectedSubs.find(
                              (s) => s.subcategory_id === sub.id
                            );
                            const isSubSelected = !!link;

                            return (
                              <div
                                key={sub.id}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                  isSubSelected
                                    ? "border-[#F5A623] bg-[#F5A623]/5"
                                    : "border-[#E5E5E5] hover:border-[#F5A623]/30"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSubSelected}
                                  onChange={() => toggleSubcategory(sub)}
                                  className="accent-[#F5A623]"
                                />
                                <span className="flex-1 text-sm text-[#1A1A1A]">
                                  {sub.name}
                                </span>
                                {isSubSelected && (
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[#6B6B6B]">
                                      Ordre
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={link.order}
                                      onChange={(e) =>
                                        updateSubOrder(
                                          sub.id,
                                          parseInt(e.target.value, 10) || 1
                                        )
                                      }
                                      className="w-16 px-2 py-1 text-sm rounded border border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#F5A623]/30"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#1A1A1A]">
                Galerie photos ({galleryUrls.length}/20)
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden border border-[#E5E5E5] aspect-square"
                >
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))
                    }
                    className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full shadow hover:bg-white"
                  >
                    <X size={12} className="text-[#EF4444]" />
                  </button>
                </div>
              ))}

              {galleryUrls.length < 20 && (
                <ImageUploader
                  onChange={(url) => setGalleryUrls([...galleryUrls, url])}
                  folder="gallery"
                  label=""
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#1A1A1A]">
                Vidéos YouTube
              </h3>
              <button
                type="button"
                onClick={addVideo}
                className="text-sm text-[#F5A623] hover:text-[#E09010] font-medium"
              >
                + Ajouter une vidéo
              </button>
            </div>

            {videos.length === 0 ? (
              <p className="text-sm text-[#6B6B6B] py-4">
                Aucune vidéo ajoutée.
              </p>
            ) : (
              <div className="space-y-4">
                {videos.map((video, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-lg border border-[#E5E5E5]"
                  >
                    {video.youtube_id && (
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt=""
                        className="w-32 h-20 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => updateVideo(i, "title", e.target.value)}
                        placeholder="Titre de la vidéo"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                      />
                      <input
                        type="text"
                        value={video.youtube_id}
                        onChange={(e) =>
                          updateVideo(i, "youtube_id", e.target.value)
                        }
                        placeholder="URL YouTube ou ID de la vidéo"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      className="self-start p-1.5 text-[#6B6B6B] hover:text-[#EF4444]"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 5 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#1A1A1A]">
                Sources & Références
              </h3>
              <button
                type="button"
                onClick={addSource}
                className="text-sm text-[#F5A623] hover:text-[#E09010] font-medium"
              >
                + Ajouter une source
              </button>
            </div>

            {sources.length === 0 ? (
              <p className="text-sm text-[#6B6B6B] py-4">
                Aucune source ajoutée.
              </p>
            ) : (
              <div className="space-y-3">
                {sources.map((source, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3 rounded-lg border border-[#E5E5E5]"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={source.title}
                        onChange={(e) =>
                          updateSource(i, "title", e.target.value)
                        }
                        placeholder="Titre de la source"
                        className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                      />
                      <input
                        type="url"
                        value={source.url || ""}
                        onChange={(e) =>
                          updateSource(i, "url", e.target.value)
                        }
                        placeholder="URL (optionnelle)"
                        className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                      />
                      <select
                        value={source.type}
                        onChange={(e) =>
                          updateSource(i, "type", e.target.value)
                        }
                        className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                      >
                        <option value="web">Web</option>
                        <option value="livre">Livre</option>
                        <option value="article">Article</option>
                        <option value="documentaire">Documentaire</option>
                        <option value="archive">Archive</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSource(i)}
                      className="p-1.5 text-[#6B6B6B] hover:text-[#EF4444]"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="sticky bottom-0 bg-[#F8F8F8] border-t border-[#E5E5E5] -mx-6 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/personalities")}
            className="px-4 py-2.5 text-sm font-medium text-[#6B6B6B] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F8F8F8] transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit((data) => onSubmit(data, "draft"))}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F8F8F8] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            Enregistrer en brouillon
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit((data) => onSubmit(data, "published"))}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            Publier
          </button>
        </div>
      </form>
    </div>
  );
}
