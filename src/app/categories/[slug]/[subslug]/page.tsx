import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { PersonalityCard } from "@/components/personality/PersonalityCard";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getCategoryBySlug,
  getSubcategoryBySlug,
  getPersonalitiesBySubcategory,
} from "@/lib/supabase/queries";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj";

type Params = Promise<{ slug: string; subslug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, subslug } = await params;
  const [category, subcategory] = await Promise.all([
    getCategoryBySlug(slug),
    getSubcategoryBySlug(slug, subslug),
  ]);

  if (!subcategory || !category) return { title: "Sous-catégorie introuvable" };

  return {
    title: `${subcategory.name} — ${category.name}`,
    description:
      subcategory.description ||
      `Personnalités djiboutiennes dans la sous-catégorie ${subcategory.name} (${category.name}).`,
    keywords: [
      `${subcategory.name} Djibouti`,
      `${category.name} Djibouti`,
      "personnalités djiboutiennes",
    ],
    openGraph: {
      title: `${subcategory.name} — ${category.name} | PixMémoire`,
      description: subcategory.description,
      url: `${BASE_URL}/categories/${slug}/${subslug}`,
    },
    alternates: {
      canonical: `${BASE_URL}/categories/${slug}/${subslug}`,
    },
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Params;
}) {
  const { slug, subslug } = await params;
  const [category, subcategory] = await Promise.all([
    getCategoryBySlug(slug),
    getSubcategoryBySlug(slug, subslug),
  ]);

  if (!category || !subcategory) notFound();

  const personalities = await getPersonalitiesBySubcategory(slug, subslug);

  return (
    <div className="bg-background min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { label: "PixMémoire", url: BASE_URL },
          { label: "Catégories", url: `${BASE_URL}/#categories` },
          {
            label: category.name,
            url: `${BASE_URL}/categories/${slug}`,
          },
          {
            label: subcategory.name,
            url: `${BASE_URL}/categories/${slug}/${subslug}`,
          },
        ]}
      />

      <section className="bg-blanc border-b border-gris-bordure">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-8 md:pb-10">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Catégories", href: "/#categories" },
              { label: category.name, href: `/categories/${slug}` },
              { label: subcategory.name },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-primary tracking-[0.2em] uppercase">
                {category.name}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-noir mt-1.5 leading-tight">
                {subcategory.name}
              </h1>
              {subcategory.description && (
                <p className="text-sm text-gris-moyen mt-2 max-w-lg leading-relaxed">
                  {subcategory.description}
                </p>
              )}
            </div>
            <p className="text-sm text-gris-moyen shrink-0 pb-0.5">
              <span className="text-noir font-semibold">
                {personalities.length}
              </span>{" "}
              {personalities.length > 1 ? "personnalités" : "personnalité"}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {personalities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {personalities.map((personality) => (
                <PersonalityCard
                  key={personality.id}
                  personality={personality}
                  categories={personality.categories}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucune personnalité"
              description={`Aucune personnalité dans « ${subcategory.name} » pour le moment.`}
              actionLabel={`Retour à ${category.name}`}
              actionHref={`/categories/${slug}`}
            />
          )}
        </div>
      </section>
    </div>
  );
}
