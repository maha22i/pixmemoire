"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Bell,
  ChevronRight,
  Home,
} from "lucide-react";
import type { AdminUser } from "@/types/admin.types";
import UserMenu from "./UserMenu";

interface AdminHeaderProps {
  user: AdminUser;
}

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/personalities": "Personnalités",
  "/admin/personalities/new": "Nouvelle personnalité",
  "/admin/categories": "Catégories",
  "/admin/suggestions": "Suggestions",
  "/admin/media": "Médiathèque",
  "/admin/stats": "Statistiques",
  "/admin/users": "Utilisateurs",
  "/admin/settings": "Paramètres",
};

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;

    if (currentPath === "/admin") {
      crumbs.push({ label: "Dashboard", href: "/admin" });
      continue;
    }

    const label =
      BREADCRUMB_MAP[currentPath] ||
      (segment === "edit"
        ? "Édition"
        : segment === "new"
          ? "Nouvelle"
          : segment === "preview"
            ? "Aperçu"
            : segment);

    if (
      currentPath !== "/admin" &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}/.test(segment)
    ) {
      crumbs.push({ label, href: currentPath });
    }
  }

  return crumbs;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6">
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/admin"
          className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
        >
          <Home size={15} />
        </Link>
        {breadcrumbs.slice(1).map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-[#E5E5E5]" />
            {i === breadcrumbs.length - 2 ? (
              <span className="text-[#1A1A1A] font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-[#6B6B6B] text-sm cursor-pointer hover:border-[#F5A623]/50 transition-colors">
          <Search size={15} />
          <span>Rechercher...</span>
          <kbd className="hidden xl:inline-flex ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-[#F8F8F8] rounded border border-[#E5E5E5]">
            ⌘K
          </kbd>
        </div>

        <Link
          href="/admin/personalities/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-[#F5A623] text-white text-sm font-medium rounded-lg hover:bg-[#E09010] transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nouvelle personnalité</span>
        </Link>

        <button className="relative p-2 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] transition-colors">
          <Bell size={18} />
        </button>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
