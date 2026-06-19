import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Landmark,
  Palette,
  Trophy,
  BookOpen,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  ChevronRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { PersonalityCard } from "@/components/personality/PersonalityCard";
import { EmptyState } from "@/components/common/EmptyState";
import { getCategoryPageStructure } from "@/lib/supabase/queries";
import { CategoryJsonLd } from "@/components/seo/CategoryJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj";

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

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryPageStructure(slug);
  if (!data) return { title: "Catégorie introuvable" };

  const totalCount =
    data.directPersonalities.length +
    data.subSections.reduce((n, s) => n + s.personalities.length, 0);

  return {
    title: `${data.category.name} — Personnalités djiboutiennes`,
    description: `${data.category.description} Découvrez les ${totalCount} personnalités djiboutiennes dans la catégorie ${data.category.name} sur PixMémoire.`,
    keywords: [
      `${data.category.name} Djibouti`,
      "personnalités djiboutiennes",
      `${data.category.name.toLowerCase()} djiboutien`,
      "histoire Djibouti",
    ],
    openGraph: {
      title: `${data.category.name} — Personnalités djiboutiennes | PixMémoire`,
      description: data.category.description,
      url: `${BASE_URL}/categories/${slug}`,
    },
    alternates: {
      canonical: `${BASE_URL}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const data = await getCategoryPageStructure(slug);
  if (!data) notFound();

  const { category, subSections, directPersonalities } = data;
  const Icon = iconMap[category.icon];
  const totalCount =
    directPersonalities.length +
    subSections.reduce((n, s) => n + s.personalities.length, 0);

  const allPersonalities = [
    ...directPersonalities,
    ...subSections.flatMap((s) => s.personalities),
  ];

  return (
    <div className="bg-blanc min-h-screen">
      <CategoryJsonLd category={category} persons={allPersonalities} />
      <BreadcrumbJsonLd
        items={[
          { label: "PixMémoire", url: BASE_URL },
          { label: "Catégories", url: `${BASE_URL}/#categories` },
          {
            label: category.name,
            url: `${BASE_URL}/categories/${slug}`,
          },
        ]}
      />

      <section className="border-b border-gris-bordure bg-blanc py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Catégories", href: "/#categories" },
              { label: category.name },
            ]}
          />

          <div className="flex flex-col items-center text-center gap-4">
            {Icon && (
              <div className="rounded-full bg-primary-light p-5">
                <Icon className="h-10 w-10 text-primary" />
              </div>
            )}

            <h1 className="font-serif text-4xl md:text-5xl font-bold text-noir">
              {category.name}
            </h1>

            <p className="text-lg text-gris-moyen max-w-xl">
              {category.description}
            </p>

            <p className="text-sm text-gris-moyen">
              <span className="text-primary font-semibold">{totalCount}</span>{" "}
              {totalCount > 1 ? "personnalités" : "personnalité"}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 space-y-16">
          {subSections.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {subSections.map(({ subcategory }) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${slug}/${subcategory.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gris-bordure px-4 py-2 text-sm text-noir hover:border-primary hover:text-primary transition-colors"
                >
                  {subcategory.name}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          )}

          {subSections.map(({ subcategory, personalities }) =>
            personalities.length > 0 ? (
              <div key={subcategory.id}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold text-noir">
                    {subcategory.name}
                  </h2>
                  <Link
                    href={`/categories/${slug}/${subcategory.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {personalities.map((personality) => (
                    <PersonalityCard
                      key={personality.id}
                      personality={personality}
                      categories={personality.categories}
                    />
                  ))}
                </div>
              </div>
            ) : null
          )}

          {directPersonalities.length > 0 && (
            <div>
              {subSections.length > 0 && (
                <h2 className="font-serif text-2xl font-bold text-noir mb-6">
                  Autres personnalités
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {directPersonalities.map((personality) => (
                  <PersonalityCard
                    key={personality.id}
                    personality={personality}
                    categories={personality.categories}
                  />
                ))}
              </div>
            </div>
          )}

          {totalCount === 0 && (
            <EmptyState
              title="Aucune personnalité"
              description={`Aucune personnalité n'est encore répertoriée dans la catégorie « ${category.name} ».`}
              actionLabel="Retour à l'accueil"
              actionHref="/"
            />
          )}
        </div>
      </section>
    </div>
  );
}
