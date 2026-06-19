import type { Category, PersonalityWithCategories } from "@/types/database.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj";

interface CategoryJsonLdProps {
  category: Category;
  persons: PersonalityWithCategories[];
}

export function CategoryJsonLd({ category, persons }: CategoryJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Personnalités djiboutiennes — ${category.name}`,
    description: `Liste des personnalités djiboutiennes dans la catégorie ${category.name} référencées sur PixMémoire.`,
    numberOfItems: persons.length,
    itemListElement: persons.map((person, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        "@id": `${BASE_URL}/personnalites/${person.slug}#person`,
        name: person.full_name,
        url: `${BASE_URL}/personnalites/${person.slug}`,
        description: person.short_bio,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
