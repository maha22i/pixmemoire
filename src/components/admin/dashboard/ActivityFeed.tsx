"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Pencil, Trash2, Upload, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  admin_users?: { full_name: string } | null;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ACTION_CONFIG: Record<
  string,
  { icon: typeof Plus; color: string; bgColor: string; verb: string }
> = {
  create: {
    icon: Plus,
    color: "#10B981",
    bgColor: "bg-emerald-50",
    verb: "a créé",
  },
  update: {
    icon: Pencil,
    color: "#3B82F6",
    bgColor: "bg-blue-50",
    verb: "a modifié",
  },
  delete: {
    icon: Trash2,
    color: "#EF4444",
    bgColor: "bg-red-50",
    verb: "a supprimé",
  },
  publish: {
    icon: Upload,
    color: "#F5A623",
    bgColor: "bg-amber-50",
    verb: "a publié",
  },
  login: {
    icon: LogIn,
    color: "#6B6B6B",
    bgColor: "bg-gray-100",
    verb: "s'est connecté",
  },
};

const ENTITY_LABELS: Record<string, string> = {
  personality: "une personnalité",
  category: "une catégorie",
  user: "un utilisateur",
  suggestion: "une suggestion",
  media: "un média",
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
        Activités récentes
      </h2>

      {activities.length === 0 ? (
        <p className="text-sm text-[#6B6B6B] py-4">
          Aucune activité récente.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.update;
            const Icon = config.icon;
            const adminName =
              activity.admin_users?.full_name || "Administrateur";
            const entityName =
              (activity.details?.name as string) ||
              ENTITY_LABELS[activity.entity_type] ||
              "";

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-2"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    config.bgColor
                  )}
                >
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1A1A1A]">
                    <span className="font-medium">{adminName}</span>{" "}
                    {config.verb}{" "}
                    {activity.action !== "login" && (
                      <span className="text-[#6B6B6B]">{entityName}</span>
                    )}
                  </p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
