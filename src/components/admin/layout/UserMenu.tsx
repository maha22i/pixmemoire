"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/types/admin.types";
import { getRoleLabel } from "@/lib/admin/permissions";

interface UserMenuProps {
  user: AdminUser;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623] text-xs font-bold hover:bg-[#F5A623]/25 transition-colors"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 z-50">
          <div className="px-4 py-3 border-b border-[#E5E5E5]">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {user.full_name}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-[#F5A623]/10 text-[#F5A623] rounded-full">
              {getRoleLabel(user.role)}
            </span>
          </div>

          <div className="py-1">
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#1A1A1A] transition-colors"
            >
              <User size={15} />
              Mon profil
            </Link>
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#1A1A1A] transition-colors"
            >
              <Settings size={15} />
              Paramètres
            </Link>
          </div>

          <div className="border-t border-[#E5E5E5] pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
