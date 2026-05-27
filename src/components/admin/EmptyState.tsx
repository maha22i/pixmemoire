import { type LucideIcon, FileQuestion } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-[#F8F8F8] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#6B6B6B]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B6B6B] text-center max-w-sm">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-4">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] text-white text-sm font-medium rounded-lg hover:bg-[#E09010] transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] text-white text-sm font-medium rounded-lg hover:bg-[#E09010] transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
