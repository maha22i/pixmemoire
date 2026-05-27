import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  trend?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B6B6B] mb-1">{title}</p>
          <p className="text-3xl font-bold text-[#1A1A1A]">{value}</p>
          {trend !== undefined && (
            <p
              className={`text-xs mt-1 font-medium ${
                trend >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
              }`}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% ce mois
            </p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}
