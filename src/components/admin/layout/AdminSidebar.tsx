"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Tag,
  MessageSquare,
  Image,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  ChevronRight,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/types/admin.types";
import { getRoleLabel } from "@/lib/admin/permissions";

interface AdminSidebarProps {
  user: AdminUser;
  pendingSuggestions?: number;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Personnalités",
    href: "/admin/personalities",
    icon: Users,
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    label: "Suggestions",
    href: "/admin/suggestions",
    icon: MessageSquare,
    badge: true,
  },
  {
    label: "Médiathèque",
    href: "/admin/media",
    icon: Image,
  },
  {
    label: "Générateur IA",
    href: "/admin/ai-generator",
    icon: Bot,
  },
  {
    label: "Statistiques",
    href: "/admin/stats",
    icon: BarChart3,
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: UserCog,
    superAdminOnly: true,
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  user,
  pendingSuggestions = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#1A1A1A] text-white flex flex-col z-40">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F5A623] flex items-center justify-center font-bold text-sm text-white">
            PM
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight">
              PixMémoire
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-[#F5A623] font-medium">
              Admin
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.superAdminOnly && user.role !== "super_admin") return null;

          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-white/10 text-white border-l-[3px] border-[#F5A623] -ml-px"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                size={18}
                className={cn(
                  "flex-shrink-0",
                  active ? "text-[#F5A623]" : "text-white/40 group-hover:text-white/70"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && pendingSuggestions > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#EF4444] text-white text-[11px] font-semibold flex items-center justify-center">
                  {pendingSuggestions > 99 ? "99+" : pendingSuggestions}
                </span>
              )}
              {active && (
                <ChevronRight size={14} className="text-white/30" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] text-xs font-bold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-[11px] text-white/40">
              {getRoleLabel(user.role)}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/50 hover:text-[#EF4444] hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
