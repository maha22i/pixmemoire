import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
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
    <section id="categories" className="py-10 md:py-16 bg-blanc">
      <div className="mx-auto max-w-6xl px-4">
        <AnimatedReveal className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <Star className="h-4 w-4 fill-primary" />
            <span className="text-sm font-medium tracking-widest uppercase">
              À découvrir
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
            Explorer par thème
          </h2>
          <p className="text-gris-moyen mt-3 max-w-xl mx-auto">
            Parcourez les personnalités par domaine et sous-catégorie.
          </p>
        </AnimatedReveal>

        <div className="space-y-16">
          {sections.map(({ sub, personalities }, sectionIndex) => (
            <AnimatedReveal key={sub.id} delay={sectionIndex * 0.1}>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                  <div>
                    <p className="text-xs font-medium text-primary tracking-widest uppercase mb-1">
                      {sub.category.name}
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-noir">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-gris-moyen mt-2 max-w-lg text-sm">
                        {sub.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/categories/${sub.category.slug}/${sub.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-gris-bordure bg-blanc px-5 py-2.5 text-sm font-medium text-noir hover:border-primary hover:text-primary transition-all"
                  >
                    Voir tout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {personalities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {personalities.map((personality) => (
                      <PersonalityCard
                        key={personality.id}
                        personality={personality}
                        categories={personality.categories}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gris-moyen">
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
