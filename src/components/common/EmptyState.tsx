import { SearchX, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  title = "Aucun résultat",
  description = "Aucune personnalité ne correspond à votre recherche.",
  icon: Icon = SearchX,
  actionLabel,
  actionHref,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-gris-clair p-4 mb-6">
        <Icon className="h-8 w-8 text-gris-moyen" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-noir mb-2">
        {title}
      </h3>
      <p className="text-gris-moyen max-w-md">{description}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
