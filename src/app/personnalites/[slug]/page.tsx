import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eye } from "lucide-react";
import {
  getPersonalityBySlug,
  getPersonalityCategories,
  getTimelineEvents,
  getRelatedPersonalities,
} from "@/lib/supabase/queries";
import { PersonalityHero } from "@/components/personality/PersonalityHero";
import { PersonalityCard } from "@/components/personality/PersonalityCard";
import { ProfileTabs } from "@/components/personality/ProfileTabs";
import { ReportErrorModal } from "@/components/personality/ReportErrorModal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const personality = await getPersonalityBySlug(slug);

  if (!personality) {
    return { title: "Personnalité non trouvée" };
  }

  return {
    title: `${personality.full_name} — ${personality.title}`,
    description: personality.short_bio,
    openGraph: {
      title: `${personality.full_name} — ${personality.title}`,
      description: personality.short_bio,
      images: personality.main_photo_url
        ? [{ url: personality.main_photo_url }]
        : [],
      type: "profile",
    },
  };
}

export default async function PersonnalitePage({ params }: PageProps) {
  const { slug } = await params;
  const personality = await getPersonalityBySlug(slug);

  if (!personality) {
    notFound();
  }

  const [categories, timelineEvents, relatedPersonalities] = await Promise.all([
    getPersonalityCategories(personality.id),
    getTimelineEvents(personality.id),
    getRelatedPersonalities(personality.id),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personality.full_name,
    jobTitle: personality.title,
    description: personality.short_bio,
    birthDate: personality.birth_date,
    ...(personality.death_date && { deathDate: personality.death_date }),
    birthPlace: {
      "@type": "Place",
      name: personality.birth_place,
    },
    image: personality.main_photo_url,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj"}/personnalites/${personality.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <PersonalityHero personality={personality} categories={categories} />

        <div className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <ProfileTabs
            personality={personality}
            timelineEvents={timelineEvents}
          />

          {relatedPersonalities.length > 0 && (
            <section className="mt-16 lg:mt-20">
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Explorer
                  </p>
                  <h2 className="font-serif text-2xl font-bold text-noir sm:text-3xl">
                    Personnalités liées
                  </h2>
                </div>
                <div className="section-divider hidden flex-1 mx-8 sm:block" />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPersonalities.map((rp) => (
                  <PersonalityCard
                    key={rp.id}
                    personality={rp}
                    categories={rp.categories}
                  />
                ))}
              </div>
            </section>
          )}

          <footer className="mt-16 flex flex-col items-center gap-5 rounded-2xl border border-gris-bordure/80 bg-gris-clair/40 px-6 py-8 text-center">
            <ReportErrorModal personalityName={personality.full_name} />
            <div className="flex items-center gap-2 text-sm text-gris-moyen">
              <Eye className="h-4 w-4 text-primary" />
              <span>
                {personality.views_count.toLocaleString("fr-FR")} consultations
              </span>
            </div>
          </footer>
        </div>
      </article>
    </>
  );
}
