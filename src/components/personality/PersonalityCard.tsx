"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isDark = variant === "dark";

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="perspective-1000"
    >
      <Link
        href={`/personnalites/${personality.slug}`}
        className={cn(
          "group block rounded-2xl border overflow-hidden transition-shadow duration-300",
          isDark
            ? "border-white/10 bg-white/5 hover:shadow-2xl hover:shadow-primary/10"
            : "border-gris-bordure bg-blanc hover:shadow-xl hover:shadow-black/8",
        )}
      >
        <div className="aspect-[4/5] overflow-hidden bg-gris-clair relative">
          {personality.main_photo_url ? (
            <>
              <Image
                src={personality.main_photo_url}
                alt={personality.full_name}
                width={400}
                height={500}
                className="grayscale-photo h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-light to-gris-clair">
              <span className="font-serif text-5xl font-bold text-primary/30">
                {personality.display_name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className={cn("p-5 space-y-2", isDark && "text-blanc")}>
          <h3 className="font-serif text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {personality.display_name}
          </h3>

          {personality.title && (
            <p className={cn("text-sm line-clamp-1", isDark ? "text-gray-400" : "text-gris-moyen")}>
              {personality.title}
            </p>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.slice(0, 2).map((cat) => (
                <Badge key={cat.id} variant="default" className="text-[10px]">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          {lifespan && (
            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gris-moyen")}>
              {lifespan}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
