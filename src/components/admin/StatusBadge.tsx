import { cn } from "@/lib/utils";

type BadgeVariant = "published" | "draft" | "pending" | "accepted" | "rejected" | "active" | "inactive";

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

const variants: Record<BadgeVariant, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  published: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-[#10B981]",
    defaultLabel: "Publié",
  },
  draft: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-[#F59E0B]",
    defaultLabel: "Brouillon",
  },
  pending: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-[#3B82F6]",
    defaultLabel: "En attente",
  },
  accepted: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-[#10B981]",
    defaultLabel: "Acceptée",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-[#EF4444]",
    defaultLabel: "Refusée",
  },
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-[#10B981]",
    defaultLabel: "Actif",
  },
  inactive: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    defaultLabel: "Inactif",
  },
};

export default function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const config = variants[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {label || config.defaultLabel}
    </span>
  );
}
