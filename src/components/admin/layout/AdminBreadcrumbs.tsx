"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Correspondance segment → libellé français */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Dashboard",
  personalities: "Personnalités",
  categories: "Catégories",
  suggestions: "Suggestions",
  media: "Médiathèque",
  stats: "Statistiques",
  users: "Utilisateurs",
  settings: "Paramètres",
  new: "Nouvelle",
  edit: "Édition",
  login: "Connexion",
};

function labelFor(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

/** UUID v4 simplifié — on masque les IDs dans le breadcrumb */
function isUuid(segment: string): boolean {
  return /^[0-9a-f]{8}-/.test(segment);
}

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const label = isUuid(segment) ? "Détail" : labelFor(segment);

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          {isLast ? (
            <span className="font-medium text-[#1A1A1A]">{label}</span>
          ) : (
            <>
              <Link
                href={href}
                className="text-[#6B6B6B] transition-colors hover:text-[#1A1A1A]"
              >
                {label}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-[#6B6B6B]" />
            </>
          )}
        </span>
      ))}
    </nav>
  );
}
