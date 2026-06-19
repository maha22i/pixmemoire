"use client";

import Link from "next/link";
import Image from "next/image";
import type { Personality, Category } from "@/types/database.types";
import { formatLifespan } from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";

interface PersonalityCardProps {
  personality: Personality;
  categories?: Category[];
  variant?: "default" | "dark";
}

export function PersonalityCard({
  personality,
  categories = [],
  variant = "default",
}: PersonalityCardProps) {
  const lifespan = formatLifespan(
    personality.birth_date,
    personality.death_date,
    personality.is_alive,
  );

  const isDark = variant === "dark";

  return (
    <Link
      href={`/personnalites/${personality.slug}`}
      className={cn(
        "group block rounded-xl overflow-hidden transition-all duration-300",
        isDark
          ? "bg-white/5 hover:bg-white/8"
          : "bg-blanc hover:shadow-lg hover:shadow-black/6",
      )}
    >
      <div className="aspect-[3/4] overflow-hidden bg-gris-clair relative">
        {personality.main_photo_url ? (
          <>
            <Image
              src={personality.main_photo_url}
              alt={personality.full_name}
              width={400}
              height={530}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/5 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-3 md:p-4">
              <h3 className="font-serif text-sm md:text-base font-semibold text-blanc leading-snug line-clamp-1">
                {personality.display_name}
              </h3>
              {personality.title && (
                <p className="text-[11px] md:text-xs text-blanc/70 line-clamp-1 mt-0.5">
                  {personality.title}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gris-clair to-gris-bordure">
              <span className="font-serif text-4xl md:text-5xl font-bold text-gris-moyen/30">
                {personality.display_name.charAt(0)}
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-3 md:p-4 bg-gradient-to-t from-noir/70 to-transparent">
              <h3 className="font-serif text-sm md:text-base font-semibold text-blanc leading-snug line-clamp-1">
                {personality.display_name}
              </h3>
              {personality.title && (
                <p className="text-[11px] md:text-xs text-blanc/70 line-clamp-1 mt-0.5">
                  {personality.title}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className={cn("px-3 py-2.5 md:px-4 md:py-3 flex items-center justify-between gap-2", isDark && "text-blanc")}>
        <div className="flex flex-wrap gap-1 min-w-0">
          {categories.slice(0, 2).map((cat) => (
            <span
              key={cat.id}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                isDark ? "bg-white/10 text-gray-300" : "bg-primary/8 text-primary",
              )}
            >
              {cat.name}
            </span>
          ))}
        </div>
        {lifespan && (
          <span className={cn("text-[10px] md:text-[11px] shrink-0 tabular-nums", isDark ? "text-gray-500" : "text-gris-moyen")}>
            {lifespan}
          </span>
        )}
      </div>
    </Link>
  );
}
