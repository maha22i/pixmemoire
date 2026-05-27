import Link from "next/link";
import { Plus, Tag, MessageSquare, ExternalLink, Bot } from "lucide-react";

const ACTIONS = [
  {
    label: "Ajouter une personnalité",
    icon: Plus,
    href: "/admin/personalities/new",
  },
  {
    label: "Générer avec IA",
    icon: Bot,
    href: "/admin/ai-generator",
  },
  {
    label: "Gérer les catégories",
    icon: Tag,
    href: "/admin/categories",
  },
  {
    label: "Voir les suggestions",
    icon: MessageSquare,
    href: "/admin/suggestions",
  },
  {
    label: "Voir le site",
    icon: ExternalLink,
    href: "/",
    external: true,
  },
];

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
        Actions rapides
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const Comp = action.external ? "a" : Link;
          const extraProps = action.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};

          return (
            <Comp
              key={action.label}
              href={action.href}
              {...extraProps}
              className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-[#E5E5E5] hover:border-[#F5A623] hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center group-hover:bg-[#F5A623]/20 transition-colors">
                <Icon size={20} className="text-[#F5A623]" />
              </div>
              <span className="text-sm font-medium text-[#1A1A1A] text-center">
                {action.label}
              </span>
            </Comp>
          );
        })}
      </div>
    </div>
  );
}
