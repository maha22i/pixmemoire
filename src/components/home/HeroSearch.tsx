"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles } from "lucide-react";

interface HeroSearchProps {
  personalityCount?: number;
}

export function HeroSearch({ personalityCount = 0 }: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/personnalites?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-3xl mx-auto"
    >
      {/* Badge d'appel à l'action */}
      <div className="flex justify-center mb-5">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary"
        >
          <Sparkles className="h-4 w-4" />
          Commencez votre recherche ici
        </motion.div>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSubmit}>
        <div
          className={`relative rounded-2xl search-glow transition-all duration-300 ${
            focused ? "scale-[1.02]" : ""
          }`}
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent-teal/10 blur-sm -z-10" />

          <div className="relative flex items-center rounded-2xl bg-blanc border border-gris-bordure/80 overflow-hidden">
            <div className="flex items-center justify-center pl-6 pr-2">
              <Search className={`h-6 w-6 transition-colors duration-200 ${focused ? "text-primary" : "text-gris-moyen"}`} />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Rechercher une personnalité, un domaine..."
              autoFocus
              className="flex-1 py-5 pr-4 text-lg md:text-xl text-noir placeholder:text-gris-moyen/70 bg-transparent focus:outline-none"
            />

            <button
              type="submit"
              className="mr-3 flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
            >
              <span className="hidden sm:inline">Rechercher</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {personalityCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-gris-moyen mt-5"
        >
          <span className="text-primary font-bold text-base">{personalityCount}</span>{" "}
          personnalités répertoriées dans l&apos;annuaire
        </motion.p>
      )}
    </motion.div>
  );
}
