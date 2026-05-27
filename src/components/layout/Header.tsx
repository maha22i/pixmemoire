"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Landmark,
  Palette,
  Trophy,
  BookOpen,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database.types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Palette,
  Trophy,
  BookOpen,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
};

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Personnalités", href: "/personnalites" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .order("order", { ascending: true })
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isCategoryActive = categories.some((c) =>
    pathname.startsWith(`/categories/${c.slug}`),
  );

  const openDropdown = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setCategoriesOpen(true);
  };

  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setCategoriesOpen(false), 150);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-blanc/70 backdrop-blur-xl border-b border-gris-bordure/40 shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center px-4 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <span className="font-serif text-lg font-bold text-primary">P</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-lg font-bold text-noir tracking-tight">
                Pix<span className="text-primary">.</span>Mémoire
              </span>
              <span className="text-[10px] tracking-wider text-gris-moyen/70 uppercase">
                by Pixel Nomade
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-noir/70 hover:text-noir hover:bg-noir/[0.03]",
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-primary" />
                )}
              </Link>
            ))}

            {/* Categories dropdown */}
            {categories.length > 0 && (
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <button
                  type="button"
                  className={cn(
                    "relative flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                    isCategoryActive
                      ? "text-primary"
                      : "text-noir/70 hover:text-noir hover:bg-noir/[0.03]",
                  )}
                  onClick={() => setCategoriesOpen((v) => !v)}
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  Catégories
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      categoriesOpen && "rotate-180",
                    )}
                  />
                  {isCategoryActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-primary" />
                  )}
                </button>

                <div
                  className={cn(
                    "absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl border border-gris-bordure/60 bg-blanc p-2 shadow-2xl shadow-black/[0.08] transition-all duration-200",
                    categoriesOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-3 opacity-0",
                  )}
                >
                  <div className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 border-l border-t border-gris-bordure/60 bg-blanc" />
                  <p className="px-3 pt-2 pb-2.5 text-[11px] font-semibold tracking-widest uppercase text-gris-moyen/60">
                    Explorer par catégorie
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {categories.map((cat) => {
                      const Icon = iconMap[cat.icon] || Users;
                      return (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
                            pathname === `/categories/${cat.slug}`
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-noir/80 hover:bg-gris-clair hover:text-noir",
                          )}
                        >
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            pathname === `/categories/${cat.slug}`
                              ? "bg-primary/15 text-primary"
                              : "bg-gris-clair text-gris-moyen",
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-noir/70 hover:text-noir hover:bg-noir/[0.03]",
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-primary" />
                )}
              </Link>
            ))}

            <div className="ml-3 h-5 w-px bg-gris-bordure" />

            <Link
              href="/contact"
              className="ml-3 inline-flex items-center gap-2 rounded-xl bg-noir px-5 py-2.5 text-sm font-semibold text-blanc transition-all duration-300 hover:bg-noir/90 hover:scale-[1.02] shadow-sm"
            >
              Contribuer
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-noir transition-colors hover:bg-gris-clair lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-noir/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-blanc shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between border-b border-gris-bordure/50 px-5">
          <span className="font-serif text-lg font-bold text-noir">
            Pix<span className="text-primary">.</span>Mémoire
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gris-clair text-noir transition-colors hover:bg-gris-bordure"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto px-5 py-6" style={{ maxHeight: "calc(100dvh - 4.5rem)" }}>
          <nav className="flex flex-col gap-1">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-150",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-noir hover:bg-gris-clair",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile categories accordion */}
            {categories.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen((v) => !v)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-150",
                    isCategoryActive
                      ? "bg-primary/10 text-primary"
                      : "text-noir hover:bg-gris-clair",
                  )}
                >
                  Catégories
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      mobileCategoriesOpen && "rotate-180",
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    mobileCategoriesOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-primary/20 pl-4 py-1">
                    {categories.map((cat) => {
                      const Icon = iconMap[cat.icon] || Users;
                      return (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                            pathname === `/categories/${cat.slug}`
                              ? "text-primary font-medium"
                              : "text-gris-moyen hover:text-noir",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-150",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-noir hover:bg-gris-clair",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gris-bordure/50">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white transition-all hover:bg-primary-hover shadow-lg shadow-primary/20"
            >
              Proposer une personnalité
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-xs text-gris-moyen/60 text-center">
              by Pixel Nomade
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
