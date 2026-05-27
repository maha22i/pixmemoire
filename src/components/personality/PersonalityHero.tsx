import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ShareButtons } from "@/components/personality/ShareButtons";
import { formatLifespan } from "@/lib/utils/date-format";
import type { Personality, Category } from "@/types/database.types";

interface PersonalityHeroProps {
  personality: Personality;
  categories?: Category[];
}

export function PersonalityHero({ personality, categories = [] }: PersonalityHeroProps) {
  const lifespan = formatLifespan(
    personality.birth_date,
    personality.death_date,
    personality.is_alive
  );

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Personnalités", href: "/personnalites" },
    { label: personality.full_name },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-accent-blue/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 pt-6 pb-12 lg:px-8 lg:pb-16">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 lg:items-start">
          {/* Portrait */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-primary/20 via-transparent to-accent-blue/10 blur-sm" />
              <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-blanc shadow-[0_24px_64px_-24px_rgba(15,15,18,0.35)]">
                <div className="aspect-[4/5] relative bg-gris-clair">
                  {personality.main_photo_url ? (
                    <>
                      <Image
                        src={personality.main_photo_url}
                        alt={personality.full_name}
                        fill
                        className="grayscale-photo object-cover"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-noir/50 via-transparent to-transparent opacity-60" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-light to-gris-clair">
                      <span className="font-serif text-8xl font-bold text-primary/25">
                        {personality.display_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {categories.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 lg:hidden">
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/categories/${cat.slug}`}>
                        <Badge variant="default" className="shadow-sm backdrop-blur-sm">
                          {cat.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="space-y-4">
              {categories.length > 0 && (
                <div className="hidden flex-wrap gap-2 lg:flex">
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary-light/60 px-3 py-1 text-xs uppercase tracking-wide hover:bg-primary hover:text-white hover:border-primary transition-colors"
                      >
                        {cat.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h1 className="font-serif text-4xl font-bold leading-[1.1] text-noir sm:text-5xl lg:text-[3.25rem]">
                  {personality.full_name}
                </h1>
                {personality.title && (
                  <p className="max-w-2xl text-lg leading-relaxed text-gris-moyen sm:text-xl">
                    {personality.title}
                  </p>
                )}
              </div>

              {personality.short_bio && (
                <p className="max-w-2xl text-base leading-relaxed text-noir/75 border-l-2 border-primary/40 pl-4">
                  {personality.short_bio}
                </p>
              )}
            </div>

            {/* Quick facts */}
            {(lifespan || personality.birth_place) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {lifespan && (
                  <div className="flex items-start gap-3 rounded-xl border border-gris-bordure/80 bg-blanc/80 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gris-moyen">
                        Période
                      </p>
                      <p className="mt-0.5 font-medium text-noir">{lifespan}</p>
                    </div>
                  </div>
                )}

                {personality.birth_place && (
                  <div className="flex items-start gap-3 rounded-xl border border-gris-bordure/80 bg-blanc/80 p-4 shadow-sm backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gris-moyen">
                        Lieu de naissance
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-noir">
                        {personality.birth_place}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {personality.famous_quote && (
              <figure className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-light/80 via-blanc to-blanc p-6 shadow-sm">
                <Quote className="absolute -right-2 -top-2 h-16 w-16 text-primary/10" />
                <blockquote className="relative">
                  <p className="font-serif text-lg italic leading-relaxed text-noir/80 sm:text-xl">
                    &laquo;&nbsp;{personality.famous_quote}&nbsp;&raquo;
                  </p>
                </blockquote>
              </figure>
            )}

            <div className="rounded-xl border border-gris-bordure/80 bg-blanc/60 px-4 py-3 backdrop-blur-sm">
              <ShareButtons
                url={`/personnalites/${personality.slug}`}
                title={personality.full_name}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
