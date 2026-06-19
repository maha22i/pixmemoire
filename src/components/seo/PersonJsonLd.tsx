import type { Personality, Category, TimelineEvent } from "@/types/database.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj";

interface PersonJsonLdProps {
  person: Personality;
  categories: Category[];
  timelineEvents?: TimelineEvent[];
}

export function PersonJsonLd({
  person,
  categories,
  timelineEvents,
}: PersonJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/personnalites/${person.slug}#person`,
    name: person.full_name,
    description: person.short_bio,
    birthDate: person.birth_date,
    ...(person.death_date && { deathDate: person.death_date }),
    birthPlace: {
      "@type": "Place",
      name: person.birth_place,
      address: {
        "@type": "PostalAddress",
        addressCountry: "DJ",
      },
    },
    nationality: {
      "@type": "Country",
      name: "Djibouti",
    },
    jobTitle: person.title,
    ...(person.main_photo_url && {
      image: {
        "@type": "ImageObject",
        url: person.main_photo_url,
        caption: `Portrait de ${person.full_name}`,
      },
    }),
    url: `${BASE_URL}/personnalites/${person.slug}`,
    ...(categories.length > 0 && {
      hasOccupation: categories.map((cat) => ({
        "@type": "Occupation",
        name: cat.name,
      })),
    }),
    ...(timelineEvents &&
      timelineEvents.length > 0 && {
        performerIn: timelineEvents.map((evt) => ({
          "@type": "Event",
          name: evt.title,
          description: evt.description,
          startDate: evt.event_date,
          location: {
            "@type": "Place",
            name: "Djibouti",
          },
        })),
      }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/personnalites/${person.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
