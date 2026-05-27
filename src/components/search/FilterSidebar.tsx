"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gris-bordure pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-noir hover:text-primary transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
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

  const handleCheckboxChange = (key: string, value: string, checked: boolean) => {
    const current = (filters as Record<string, any>)[key] as string[];
    const updated = checked
      ? [...current, value]
      : current.filter((v: string) => v !== value);
    onFilterChange({ ...filters, [key]: updated });
  };

  const handleRadioChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const filterContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-noir">Filtres</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
          <RotateCcw className="h-3 w-3 mr-1" />
          Réinitialiser
        </Button>
      </div>

      {sections.map((section) => (
        <CollapsibleSection key={section.key} title={section.title}>
          {section.options.length === 0 ? (
            <p className="text-xs text-gris-moyen italic">Aucune option</p>
          ) : (
            section.options.map((option) => {
              const filterKey = section.key as keyof FilterState;

              if (section.type === "checkbox") {
                const checked = (
                  filters[filterKey] as string[]
                ).includes(option.value);

                return (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer text-sm text-noir hover:text-primary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleCheckboxChange(section.key, option.value, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gris-bordure accent-primary"
                    />
                    <span className="flex-1">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gris-moyen">
                        ({option.count})
                      </span>
                    )}
                  </label>
                );
              }

              const selected = filters[filterKey] === option.value;

              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer text-sm text-noir hover:text-primary transition-colors"
                >
                  <input
                    type="radio"
                    name={section.key}
                    checked={selected}
                    onChange={() => handleRadioChange(section.key, option.value)}
                    className="h-4 w-4 border-gris-bordure accent-primary"
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gris-moyen">
                      ({option.count})
                    </span>
                  )}
                </label>
              );
            })
          )}
        </CollapsibleSection>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={cn("hidden md:block w-64 shrink-0", className)}>
        {filterContent}
      </aside>

      {/* Mobile : bouton d'ouverture */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-white shadow-lg"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-sm font-medium">Filtres</span>
      </button>

      {/* Mobile : drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-noir/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-blanc p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold">Filtres</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-1 hover:bg-gris-clair"
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
