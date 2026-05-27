"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Category,
  FilterState,
  PersonalityWithCategories,
} from "@/types/database.types";
import { PersonalityCard } from "@/components/personality/PersonalityCard";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/EmptyState";

const ITEMS_PER_PAGE = 12;

const REGION_OPTIONS = [
  { value: "djibouti-ville", label: "Djibouti-ville" },
  { value: "tadjourah", label: "Tadjourah" },
  { value: "dikhil", label: "Dikhil" },
  { value: "ali-sabieh", label: "Ali Sabieh" },
  { value: "obock", label: "Obock" },
  { value: "arta", label: "Arta" },
];

const ERA_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "pre_independence", label: "Pré-indépendance" },
  { value: "post_independence", label: "Post-indépendance" },
  { value: "contemporary", label: "Contemporain" },
];

const SORT_OPTIONS = [
  { value: "alpha-asc", label: "Alphabétique A-Z" },
  { value: "recent", label: "Plus récents" },
  { value: "views", label: "Plus consultés" },
];

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  era: "",
  status: "",
  regions: [],
  gender: "",
  sortBy: "alpha-asc",
};

interface PersonnalitesContentProps {
  initialPersonalities: PersonalityWithCategories[];
  categories: Category[];
}

export function PersonnalitesContent({
  initialPersonalities,
  categories,
}: PersonnalitesContentProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredPersonalities = useMemo(() => {
    let result = [...initialPersonalities];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.display_name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.short_bio.toLowerCase().includes(q)
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter((p) =>
        p.categories.some((c) => filters.categories.includes(c.id))
      );
    }

    if (filters.era) {
      result = result.filter((p) => p.era === filters.era);
    }

    if (filters.gender) {
      const genderMap: Record<string, string> = { homme: "M", femme: "F" };
      result = result.filter((p) => p.gender === genderMap[filters.gender]);
    }

    if (filters.status) {
      result = result.filter((p) =>
        filters.status === "vivant" ? p.is_alive : !p.is_alive
      );
    }

    if (filters.regions.length > 0) {
      result = result.filter((p) =>
        filters.regions.includes(p.origin_region)
      );
    }

    switch (filters.sortBy || "alpha-asc") {
      case "alpha-asc":
        result.sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));
        break;
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
      case "views":
        result.sort((a, b) => b.views_count - a.views_count);
        break;
    }

    return result;
  }, [initialPersonalities, searchQuery, filters]);

  const visiblePersonalities = filteredPersonalities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPersonalities.length;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length) count += filters.categories.length;
    if (filters.era) count++;
    if (filters.status) count++;
    if (filters.regions.length) count += filters.regions.length;
    if (filters.gender) count++;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const filterSections = useMemo(
    () => [
      {
        key: "categories",
        title: "Catégorie",
        type: "checkbox" as const,
        options: categories.map((c) => ({
          value: c.id,
          label: c.name,
        })),
      },
      {
        key: "era",
        title: "Époque",
        type: "radio" as const,
        options: ERA_OPTIONS,
      },
      {
        key: "status",
        title: "Statut",
        type: "radio" as const,
        options: [
          { value: "", label: "Tous" },
          { value: "vivant", label: "Vivant" },
          { value: "decede", label: "Décédé" },
        ],
      },
      {
        key: "regions",
        title: "Région",
        type: "checkbox" as const,
        options: REGION_OPTIONS,
      },
      {
        key: "gender",
        title: "Genre",
        type: "radio" as const,
        options: [
          { value: "", label: "Tous" },
          { value: "homme", label: "Homme" },
          { value: "femme", label: "Femme" },
        ],
      },
    ],
    [categories]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Personnalités" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-noir">
            Personnalités
          </h1>
          <p className="text-gris-moyen">
            Explorez l&apos;annuaire des personnalités djiboutiennes
          </p>
        </div>

        <SearchBar
          placeholder="Rechercher une personnalité..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-2xl"
        />
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              sections={filterSections}
              className="!block !w-full"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 rounded-lg border border-gris-bordure px-3 py-2 text-sm text-noir hover:border-primary transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtres</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <p className="text-sm text-gris-moyen">
                <span className="font-semibold text-noir">
                  {filteredPersonalities.length}
                </span>{" "}
                personnalité{filteredPersonalities.length !== 1 ? "s" : ""}{" "}
                trouvée{filteredPersonalities.length !== 1 ? "s" : ""}
              </p>
            </div>

            <select
              value={filters.sortBy || "alpha-asc"}
              onChange={(e) =>
                handleFilterChange({ ...filters, sortBy: e.target.value })
              }
              className="rounded-lg border border-gris-bordure bg-blanc px-3 py-2 text-sm text-noir focus:border-primary focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {visiblePersonalities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePersonalities.map((p) => (
                  <PersonalityCard
                    key={p.id}
                    personality={p}
                    categories={p.categories}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() =>
                      setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                    }
                    className="rounded-lg border border-gris-bordure px-8 py-3 text-sm font-medium text-noir hover:border-primary hover:text-primary transition-colors"
                  >
                    Voir plus
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="Aucune personnalité trouvée"
              description="Aucun résultat ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre recherche."
              icon={Users}
              action={{
                label: "Réinitialiser les filtres",
                onClick: resetFilters,
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-noir/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-blanc p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-semibold text-noir">
                Filtres
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-1.5 hover:bg-gris-clair transition-colors"
              >
                <X className="h-5 w-5 text-noir" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              sections={filterSections}
              className="!block !w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
