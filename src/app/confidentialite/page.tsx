import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du site PixMémoire. Découvrez comment nous protégeons vos données personnelles.",
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

export default function ConfidentialitePage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Politique de confidentialité" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 pt-12 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-noir md:text-5xl">
          Politique de confidentialité
        </h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-6 text-gris-moyen">
          Dernière mise à jour : mai 2026
        </p>

        <div className="mt-12">
          <Section title="Introduction">
            <p>
              La présente politique de confidentialité décrit la manière dont
              Pixel Nomade collecte, utilise et protège les informations
              personnelles des utilisateurs du site PixMémoire
              (pixmemoire.com).
            </p>
            <p>
              En utilisant notre site, vous acceptez les pratiques décrites dans
              la présente politique.
            </p>
          </Section>

          <Section title="Collecte des données">
            <p>
              Nous collectons uniquement les données que vous nous fournissez
              volontairement via nos formulaires de contact :
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Contenu de votre message</li>
            </ul>
            <p>
              Nous ne collectons aucune donnée personnelle de manière
              automatique, à l&apos;exception des données techniques de
              navigation (adresse IP, type de navigateur, pages consultées) à
              des fins statistiques.
            </p>
          </Section>

          <Section title="Utilisation des données">
            <p>Les données collectées sont utilisées pour :</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Répondre à vos demandes et suggestions concernant le contenu du
                site
              </li>
              <li>
                Améliorer la qualité de notre service et l&apos;exactitude des
                informations publiées
              </li>
              <li>
                Vous recontacter dans le cadre d&apos;une proposition de
                personnalité ou d&apos;un signalement d&apos;erreur
              </li>
            </ul>
            <p>
              Vos données ne sont jamais vendues, louées ou cédées à des tiers
              à des fins commerciales.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Le site PixMémoire utilise des cookies strictement nécessaires au
              fonctionnement du site. Ces cookies ne collectent aucune donnée
              personnelle à des fins publicitaires.
            </p>
            <p>
              Des cookies analytiques peuvent être utilisés pour mesurer
              l&apos;audience du site de manière anonyme. Vous pouvez
              désactiver ces cookies dans les paramètres de votre navigateur.
            </p>
          </Section>

          <Section title="Conservation des données">
            <p>
              Les données personnelles collectées via les formulaires de contact
              sont conservées pour une durée maximale de 12 mois, sauf
              obligation légale contraire.
            </p>
          </Section>

          <Section title="Droits des utilisateurs">
            <p>
              Conformément à la réglementation en vigueur, vous disposez des
              droits suivants :
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Droit d&apos;accès</strong> : obtenir la confirmation
                que des données vous concernant sont traitées et en obtenir une
                copie
              </li>
              <li>
                <strong>Droit de rectification</strong> : demander la
                correction de données inexactes
              </li>
              <li>
                <strong>Droit de suppression</strong> : demander
                l&apos;effacement de vos données personnelles
              </li>
              <li>
                <strong>Droit d&apos;opposition</strong> : vous opposer au
                traitement de vos données
              </li>
              <li>
                <strong>Droit à la portabilité</strong> : recevoir vos données
                dans un format structuré et lisible
              </li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à l&apos;adresse
              suivante : pixelnomadedj@gmail.com
            </p>
          </Section>

          <Section title="Sécurité">
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et
              organisationnelles appropriées pour protéger vos données
              personnelles contre l&apos;accès non autorisé, la modification, la
              divulgation ou la destruction.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative à la présente politique de
              confidentialité, vous pouvez nous contacter :
            </p>
            <p>
              <strong>Pixel Nomade</strong>
              <br />
              Saline Ouest, République de Djibouti
              <br />
              Email : pixelnomadedj@gmail.com
              <br />
              Téléphone : +253 77 36 60 07
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
