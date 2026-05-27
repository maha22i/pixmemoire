import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Landmark,
  Palette,
  Trophy,
  BookOpen,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { PersonalityCard } from "@/components/personality/PersonalityCard";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getCategoryBySlug,
  getPersonalitiesByCategory,
} from "@/lib/supabase/queries";

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
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const personalities = await getPersonalitiesByCategory(slug);
  const Icon = iconMap[category.icon];

  return (
    <div className="bg-blanc min-h-screen">
      {/* Banner */}
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
              <span className="text-primary font-semibold">
                {personalities.length}
              </span>{" "}
              {personalities.length > 1 ? "personnalités" : "personnalité"}
            </p>
          </div>
        </div>
      </section>

      {/* Personality grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          {personalities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
