"use client";

import { useState } from "react";
import {
  ChevronDown,
  RotateCcw,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterState } from "@/types/database.types";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSection {
  key: string;
  title: string;
  type: "checkbox" | "radio";
  options: FilterOption[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  sections?: FilterSection[];
  className?: string;
}

const defaultSections: FilterSection[] = [
  {
    key: "categories",
    title: "Catégorie",
    type: "checkbox",
    options: [],
  },
  {
    key: "era",
    title: "Époque",
    type: "radio",
    options: [
      { value: "", label: "Toutes" },
      { value: "antiquite", label: "Antiquité" },
      { value: "moyen-age", label: "Moyen Âge" },
      { value: "moderne", label: "Époque moderne" },
      { value: "contemporain", label: "Contemporain" },
    ],
  },
  {
    key: "status",
    title: "Statut",
    type: "radio",
    options: [
      { value: "", label: "Tous" },
      { value: "vivant", label: "Vivant" },
      { value: "decede", label: "Décédé" },
    ],
  },
  {
    key: "regions",
    title: "Région",
    type: "checkbox",
    options: [],
  },
  {
    key: "gender",
    title: "Genre",
    type: "radio",
    options: [
      { value: "", label: "Tous" },
      { value: "homme", label: "Homme" },
      { value: "femme", label: "Femme" },
    ],
  },
];

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  activeCount = 0,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-noir hover:bg-gris-clair/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gris-moyen transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-1 space-y-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  sections = defaultSections,
  className,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCheckboxChange = (
    key: string,
    value: string,
    checked: boolean
  ) => {
    const current = (filters as Record<string, any>)[key] as string[];
    const updated = checked
      ? [...current, value]
      : current.filter((v: string) => v !== value);
    onFilterChange({ ...filters, [key]: updated });
  };

  const handleRadioChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const getActiveCount = (section: FilterSection): number => {
    const filterKey = section.key as keyof FilterState;
    const val = filters[filterKey];
    if (Array.isArray(val)) return val.length;
    if (typeof val === "string" && val) return 1;
    return 0;
  };

  const totalActive = sections.reduce(
    (sum, s) => sum + getActiveCount(s),
    0
  );

  const filterContent = (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 pb-3 border-b border-gris-bordure/50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-noir uppercase tracking-wider">
            Filtres
          </h3>
          {totalActive > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gris-moyen hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Effacer
          </button>
        )}
      </div>

      {sections.map((section) => {
        const activeCount = getActiveCount(section);

        return (
          <CollapsibleSection
            key={section.key}
            title={section.title}
            activeCount={activeCount}
          >
            {section.options.length === 0 ? (
              <p className="text-xs text-gris-moyen italic py-1">
                Aucune option
              </p>
            ) : section.type === "checkbox" ? (
              section.options.map((option) => {
                const checked = (
                  filters[section.key as keyof FilterState] as string[]
                ).includes(option.value);

                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-all",
                      checked
                        ? "bg-primary/8 text-noir"
                        : "text-gris-moyen hover:bg-gris-clair/50 hover:text-noir"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all",
                        checked
                          ? "border-primary bg-primary"
                          : "border-gris-bordure bg-blanc"
                      )}
                    >
                      {checked && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span className="flex-1 leading-tight">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gris-moyen tabular-nums">
                        {option.count}
                      </span>
                    )}
                  </label>
                );
              })
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {section.options.map((option) => {
                  const selected =
                    filters[section.key as keyof FilterState] === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleRadioChange(section.key, option.value)
                      }
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                        selected
                          ? "bg-primary text-white shadow-sm"
                          : "bg-gris-clair/60 text-gris-moyen hover:bg-gris-clair hover:text-noir"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden md:block w-64 shrink-0 rounded-2xl border border-gris-bordure/50 bg-blanc p-4 shadow-sm",
          className
        )}
      >
        {filterContent}
      </aside>

      {/* Mobile : bouton d'ouverture */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-shadow"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-sm font-medium">Filtres</span>
      </button>

      {/* Mobile : drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-noir/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-blanc p-6 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gris-bordure" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold">Filtres</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 hover:bg-gris-clair transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}
