const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj";

export function SiteJsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      name: "PixMémoire",
      url: BASE_URL,
      description:
        "Le premier répertoire numérique des personnalités qui ont marqué l'histoire de la République de Djibouti.",
      inLanguage: "fr",
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/personnalites?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Pixel Nomade",
      url: "https://pixel-nomade.com",
      logo: `${BASE_URL}/images/logo-pixel.jpeg`,
      description:
        "Agence de communication multimédia agréée, Djibouti.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Saline Ouest",
        addressCountry: "DJ",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+253-77-36-60-07",
        email: "pixelnomadedj@gmail.com",
        contactType: "customer service",
      },
      sameAs: ["https://www.facebook.com/pixelnomade"],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
