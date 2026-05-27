"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HeroSearch } from "./HeroSearch";

interface HeroSectionProps {
  personalityCount: number;
}

export function HeroSection({ personalityCount }: HeroSectionProps) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Image d'arrière-plan */}
      <Image
        src="/images/hero.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-blanc/40 backdrop-blur-[2px]" />

      {/* Orbes flottants 3D */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-96 h-96 rounded-full bg-accent-blue/8 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[30%] w-64 h-64 rounded-full bg-accent-teal/8 blur-3xl"
        />

        {/* Grille décorative */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Anneaux 3D rotatifs */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-primary/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-accent-blue/10"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-gris-bordure bg-blanc/60 backdrop-blur-sm px-4 py-1.5 text-xs tracking-[0.25em] uppercase text-gris-moyen mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Annuaire des personnalités djiboutiennes
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-noir leading-[1.05] tracking-tight"
        >
          La mémoire{" "}
          <span className="relative inline-block">
            <span className="gradient-text">vivante</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-hover to-primary rounded-full origin-left"
            />
          </span>
          <br />
          <span className="text-noir/90">de Djibouti</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gris-moyen max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Découvrez les femmes et les hommes qui ont façonné notre nation.
          <span className="block mt-1 text-noir/70 font-medium">
            Utilisez la barre de recherche ci-dessous pour explorer l&apos;annuaire.
          </span>
        </motion.p>

        <div className="mt-12 md:mt-14">
          <HeroSearch personalityCount={personalityCount} />
        </div>
      </div>

      {/* Indicateur scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-gris-moyen"
        >
          
        </motion.div>
      </motion.div>
    </section>
  );
}
