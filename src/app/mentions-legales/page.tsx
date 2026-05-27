import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site PixMémoire, un projet de Pixel Nomade.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="font-serif text-xl font-bold text-noir md:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-gris-moyen leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Mentions légales" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 pt-12 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-noir md:text-5xl">
          Mentions légales
        </h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-primary" />

        <div className="mt-12">
          <Section title="Éditeur du site">
            <p>
              Le site <strong>PixMémoire</strong> (pixmemoire.com) est édité
              par :
            </p>
            <p>
              <strong>Pixel Nomade</strong>
              <br />
              Agence créative spécialisée dans le numérique et la communication
              <br />
              Saline Ouest, République de Djibouti
              <br />
              Email : pixelnomadedj@gmail.com
              <br />
              Téléphone : +253 77 36 60 07 / +253 21 25 19 89
            </p>
          </Section>

          <Section title="Directeur de la publication">
            <p>
              Le directeur de la publication est <strong>Pixel Nomade</strong>.
            </p>
          </Section>

          <Section title="Hébergement">
            <p>Le site est hébergé par :</p>
            <p>
              <strong>Vercel Inc.</strong>
              <br />
              340 S Lemon Ave #4133
              <br />
              Walnut, CA 91789, États-Unis
              <br />
              Site web : vercel.com
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble du contenu du site PixMémoire (textes,
              photographies, illustrations, logos, icônes, sons, logiciels,
              etc.) est protégé par le droit d&apos;auteur et le droit de la
              propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication,
              adaptation totale ou partielle des éléments du site, quel que soit
              le moyen ou le procédé utilisé, est interdite sans
              l&apos;autorisation écrite préalable de Pixel Nomade.
            </p>
            <p>
              Les photographies des personnalités sont utilisées à des fins
              documentaires et éducatives. Si vous êtes titulaire de droits sur
              l&apos;une d&apos;entre elles et souhaitez leur retrait, veuillez
              nous contacter.
            </p>
          </Section>

          <Section title="Responsabilité">
            <p>
              Les informations publiées sur PixMémoire sont fournies à titre
              informatif et documentaire. Pixel Nomade s&apos;efforce de
              maintenir les informations à jour et exactes, mais ne saurait
              garantir l&apos;exactitude, la complétude ou l&apos;actualité des
              informations diffusées sur le site.
            </p>
            <p>
              Pixel Nomade ne pourra être tenu responsable des dommages directs
              ou indirects résultant de l&apos;accès au site ou de
              l&apos;utilisation des informations qu&apos;il contient.
            </p>
          </Section>

          <Section title="Liens hypertextes">
            <p>
              Le site PixMémoire peut contenir des liens hypertextes vers
              d&apos;autres sites. Pixel Nomade n&apos;exerce aucun contrôle sur
              ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative aux mentions légales, vous pouvez
              nous contacter à l&apos;adresse suivante :
              pixelnomadedj@gmail.com
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
