import Link from "next/link";
import { Heart, Users, ArrowRight, Sparkles } from "lucide-react";
import { PersonalityCard } from "@/components/personality/PersonalityCard";
import { HeroSection } from "@/components/home/HeroSection";
import { AnimatedReveal } from "@/components/common/AnimatedReveal";
import { FeaturedSubcategoriesSection } from "@/components/home/FeaturedSubcategoriesSection";
import {
  getAllPersonalities,
  getFeaturedPersonalities,
  getRecentPersonalities,
} from "@/lib/supabase/queries";

export default async function Home() {
  const allPersonalities = await getAllPersonalities();
  const displayFeatured = await getFeaturedPersonalities(6);
  const recent = await getRecentPersonalities(4);

  const hasPersonalities = allPersonalities.length > 0;

  return (
    <>
      <HeroSection personalityCount={allPersonalities.length} />

      {/* À la une — personnalités choisies dans Admin → À la une */}
      {displayFeatured.length > 0 && (
        <section className="relative py-12 md:py-12 bg-noir overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-teal/15 rounded-full blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4">
            <AnimatedReveal className="text-center mb-14">
              <div className="inline-flex items-center gap-2 text-primary mb-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium tracking-widest uppercase">
                  À la une
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-blanc">
                Personnalités emblématiques
              </h2>
              <p className="text-gray-400 mt-3 max-w-xl mx-auto">
                Les figures qui ont marqué l&apos;histoire et la culture de
                Djibouti.
              </p>
            </AnimatedReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFeatured.map((personality, i) => (
                <AnimatedReveal key={personality.id} delay={i * 0.08}>
                  <PersonalityCard
                    personality={personality}
                    categories={
                      "categories" in personality ? personality.categories : []
                    }
                    variant="dark"
                  />
                </AnimatedReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* À découvrir — sous-catégories mises en avant dans Admin → Catégories */}
      <FeaturedSubcategoriesSection />

      {/* Récemment ajoutées */}
      {recent.length > 0 && (
        <section className="py-10 md:py-16 bg-gris-clair">
          <div className="mx-auto max-w-6xl px-4">
            <AnimatedReveal>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div>
                  <p className="text-sm font-medium text-primary tracking-widest uppercase mb-2">
                    Nouveautés
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
                    Récemment ajoutées
                  </h2>
                </div>
                <Link
                  href="/personnalites"
                  className="inline-flex items-center gap-2 rounded-full border border-gris-bordure bg-blanc px-5 py-2.5 text-sm font-medium text-noir hover:border-primary hover:text-primary transition-all hover:scale-105"
                >
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimatedReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recent.map((personality, i) => (
                <AnimatedReveal key={personality.id} delay={i * 0.08}>
                  <PersonalityCard
                    personality={personality}
                    categories={
                      "categories" in personality ? personality.categories : []
                    }
                  />
                </AnimatedReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {!hasPersonalities && (
        <section className="py-20 md:py-28 bg-gris-clair">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir mb-4">
              L&apos;annuaire est en construction
            </h2>
            <p className="text-gris-moyen text-lg leading-relaxed">
              Les personnalités djiboutiennes seront bientôt ajoutées par notre
              équipe éditoriale. Revenez bientôt pour découvrir les figures qui
              ont façonné notre nation.
            </p>
          </div>
        </section>
      )}

      {/* CTA contribution */}
      <section className="relative py-12 md:py-12 bg-noir overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent-teal/[0.05] blur-[100px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-accent-blue/[0.06] blur-[80px]" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4">
          <AnimatedReveal>
            <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-primary mb-8">
                <Heart className="h-3.5 w-3.5" />
                Contribuer
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-blanc leading-tight mb-5">
                Participez à la
                <span className="block gradient-text">mémoire collective</span>
              </h2>

              <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
                Vous connaissez une personnalité djiboutienne qui mérite
                d&apos;être reconnue ? Aidez-nous à préserver notre patrimoine.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-primary-hover transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  Proposer une personnalité
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/personnalites"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-medium text-gray-300 hover:border-primary/40 hover:text-blanc transition-all duration-300"
                >
                  Parcourir l&apos;annuaire
                </Link>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </AnimatedReveal>
        </div>
      </section>
    </>
  );
}
