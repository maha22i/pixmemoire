import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PersonalityCard } from "@/components/personality/PersonalityCard";
import { AnimatedReveal } from "@/components/common/AnimatedReveal";
import {
  getFeaturedSubcategories,
  getPersonalitiesForSubcategoryHome,
} from "@/lib/supabase/queries";

export async function FeaturedSubcategoriesSection() {
  const featuredSubs = await getFeaturedSubcategories(3);
  if (featuredSubs.length === 0) return null;

  const sections = await Promise.all(
    featuredSubs.map(async (sub) => ({
      sub,
      personalities: await getPersonalitiesForSubcategoryHome(sub.id, 4),
    }))
  );

  return (
    <section id="categories" className="py-14 md:py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedReveal className="mb-12 md:mb-16">
          <div className="flex items-end justify-between border-b border-gris-bordure pb-6">
            <div>
              <span className="text-[11px] font-semibold text-primary tracking-[0.2em] uppercase">
                Explorer
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir mt-1.5 leading-tight">
                Par thème
              </h2>
            </div>
            <p className="hidden md:block text-sm text-gris-moyen max-w-xs text-right leading-relaxed">
              Parcourez les personnalités par domaine et sous-catégorie.
            </p>
          </div>
        </AnimatedReveal>

        <div className="space-y-14 md:space-y-20">
          {sections.map(({ sub, personalities }, sectionIndex) => (
            <AnimatedReveal key={sub.id} delay={sectionIndex * 0.08}>
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-primary" />
                    <div>
                      <p className="text-[10px] font-semibold text-gris-moyen tracking-[0.15em] uppercase leading-none mb-1">
                        {sub.category.name}
                      </p>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-noir leading-tight">
                        {sub.name}
                      </h3>
                    </div>
                  </div>
                  <Link
                    href={`/categories/${sub.category.slug}/${sub.slug}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-noir hover:text-primary transition-colors shrink-0"
                  >
                    <span className="hidden sm:inline">Voir tout</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {sub.description && (
                  <p className="text-sm text-gris-moyen mb-6 max-w-2xl leading-relaxed">
                    {sub.description}
                  </p>
                )}

                {personalities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {personalities.map((personality) => (
                      <PersonalityCard
                        key={personality.id}
                        personality={personality}
                        categories={personality.categories}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gris-moyen py-8">
                    Aucune personnalité dans cette sous-catégorie pour le moment.
                  </p>
                )}
              </div>
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
