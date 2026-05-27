import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AnimatedReveal } from "@/components/common/AnimatedReveal";
import {
  Target,
  Eye,
  BookOpen,
  Shield,
  Globe,
  Award,
  Heart,
  Search,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  getPersonalityCount,
  getCategoryCount,
} from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez PixMémoire, le premier annuaire en ligne des personnalités djiboutiennes. Un projet éditorial de Pixel Nomade.",
};

const methodology = [
  {
    title: "Collecte d'informations",
    description:
      "Nous recueillons des données auprès de sources multiples : archives nationales, ouvrages de référence, témoignages de proches, presse locale et internationale.",
  },
  {
    title: "Recoupement et vérification",
    description:
      "Chaque information est confrontée à au moins deux sources indépendantes. Les dates, faits marquants et affiliations sont minutieusement vérifiés.",
  },
  {
    title: "Rédaction éditoriale",
    description:
      "Nos rédacteurs transforment les données brutes en biographies accessibles, structurées et respectueuses, adaptées à un large public.",
  },
  {
    title: "Relecture éditoriale",
    description:
      "Un comité éditorial relit chaque profil pour garantir la qualité rédactionnelle, l'exactitude factuelle et le respect de la personne concernée.",
  },
  {
    title: "Publication et mise à jour",
    description:
      "Les profils sont publiés puis régulièrement actualisés. Les lecteurs peuvent signaler des erreurs via notre formulaire de contact.",
  },
];

const values = [
  {
    icon: Shield,
    title: "Rigueur",
    description: "Chaque biographie repose sur des sources vérifiables et un processus éditorial exigeant.",
  },
  {
    icon: Heart,
    title: "Respect",
    description: "Nous traitons chaque personnalité avec dignité, en valorisant son parcours sans sensationalisme.",
  },
  {
    icon: Globe,
    title: "Accessibilité",
    description: "Un annuaire gratuit, en ligne, pensé pour être consulté par tous, partout dans le monde.",
  },
  {
    icon: Award,
    title: "Exhaustivité",
    description: "Notre ambition : couvrir toutes les sphères de la vie publique djiboutienne, sans exception.",
  },
];

const timeline = [
  { year: "2024", event: "Lancement du projet PixMémoire par Pixel Nomade à Djibouti." },
  { year: "2025", event: "Première version de l'annuaire avec les figures historiques majeures." },
  { year: "2026", event: "Extension à 8 catégories et ouverture aux contributions du public." },
];

const ecosystem = [
  { name: "PixTV", description: "Média audiovisuel djiboutien" },
  { name: "PixEvent", description: "Organisation d'événements culturels" },
  { name: "PixInfluFlash", description: "Marketing d'influence local" },
  { name: "PixAI", description: "Solutions d'intelligence artificielle" },
];

export default async function AProposPage() {
  const [personalityCount, categoryCount] = await Promise.all([
    getPersonalityCount(),
    getCategoryCount(),
  ]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-end mesh-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

        <div className="relative mx-auto max-w-7xl w-full px-4 pt-24 pb-16 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "À propos" },
            ]}
          />

          <AnimatedReveal className="mt-10 max-w-3xl">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">
              Notre histoire
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-noir leading-tight">
              À propos de Pix<span className="gradient-text">.</span>Mémoire
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-gris-moyen">
              Le premier annuaire en ligne exhaustif des personnalités djiboutiennes.
              Un projet éditorial porté par{" "}
              <span className="text-noir font-medium">Pixel Nomade</span>, agence
              créative basée à Djibouti, pour préserver et transmettre la mémoire
              collective de notre nation.
            </p>
          </AnimatedReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gris-bordure bg-blanc">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: personalityCount, label: "Personnalités" },
              { value: categoryCount, label: "Catégories" },
              { value: "100%", label: "Gratuit" },
              { value: "2024", label: "Lancement" },
            ].map((stat, i) => (
              <AnimatedReveal key={stat.label} delay={i * 0.1} className="text-center">
                <p className="font-serif text-4xl md:text-5xl font-bold gradient-text">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-gris-moyen uppercase tracking-wider">
                  {stat.label}
                </p>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-12">
              <AnimatedReveal>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-noir">
                      Notre mission
                    </h2>
                    <p className="mt-4 text-gris-moyen leading-relaxed text-lg">
                      PixMémoire vise à constituer le premier annuaire en ligne exhaustif
                      des personnalités djiboutiennes. Notre mission est de préserver et
                      de valoriser la mémoire collective de Djibouti en documentant les
                      parcours des femmes et des hommes — connus ou méconnus — qui ont
                      façonné notre nation à travers la politique, la culture, le sport,
                      la religion, l&apos;entrepreneuriat et bien d&apos;autres domaines.
                    </p>
                    <p className="mt-4 text-gris-moyen leading-relaxed">
                      Nous croyons que chaque figure mérite d&apos;être reconnue et que
                      la transmission de ces histoires est essentielle pour les générations
                      futures. PixMémoire est un outil pédagogique, un patrimoine numérique
                      et un pont entre le passé et le présent.
                    </p>
                  </div>
                </div>
              </AnimatedReveal>

              <AnimatedReveal delay={0.1}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-teal/10">
                    <Eye className="h-6 w-6 text-accent-teal" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-noir">
                      Notre vision
                    </h2>
                    <p className="mt-4 text-gris-moyen leading-relaxed text-lg">
                      Devenir la référence incontournable pour quiconque souhaite découvrir
                      l&apos;histoire et les acteurs de Djibouti — chercheurs, étudiants,
                      journalistes, diaspora ou simples curieux. Nous aspirons à un annuaire
                      vivant, enrichi en continu par notre équipe et par les contributions
                      de la communauté.
                    </p>
                  </div>
                </div>
              </AnimatedReveal>
            </div>

            <AnimatedReveal delay={0.15}>
              <div className="rounded-3xl border border-gris-bordure bg-gris-clair/30 p-8 h-full flex flex-col justify-center">
                <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">
                  L&apos;agence derrière le projet
                </p>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-noir">
                  Pixel Nomade
                </h3>
                <p className="mt-4 text-gris-moyen leading-relaxed">
                  Pixel Nomade est une agence créative basée à Djibouti, spécialisée
                  dans le numérique, la communication et les médias. Fondée avec la
                  conviction que le digital peut transformer la visibilité de l&apos;Afrique
                  de l&apos;Est, l&apos;agence développe des projets à fort impact culturel
                  et social.
                </p>
                <p className="mt-4 text-gris-moyen leading-relaxed">
                  PixMémoire s&apos;inscrit dans un écosystème plus large de marques
                  portées par Pixel Nomade, chacune répondant à un besoin spécifique
                  de la société djiboutienne et de la diaspora.
                </p>
                <a
                  href="https://pixel-nomade.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-primary font-medium hover:text-primary-hover transition-colors"
                >
                  Visiter pixel-nomade.com
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 md:py-28 bg-noir relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-blanc">
              Nos valeurs
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Les principes qui guident chacune de nos publications.
            </p>
          </AnimatedReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <AnimatedReveal key={value.title} delay={i * 0.08}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 card-3d h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-blanc mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Méthodologie */}
      <section className="py-20 md:py-28 bg-gris-clair">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedReveal className="max-w-2xl mb-14">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-primary tracking-widest uppercase">
                Processus éditorial
              </p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              Notre méthodologie
            </h2>
            <p className="mt-4 text-gris-moyen text-lg leading-relaxed">
              Chaque biographie publiée sur PixMémoire suit un processus rigoureux
              en cinq étapes, garantissant la qualité et la fiabilité de nos contenus.
            </p>
          </AnimatedReveal>

          <div className="space-y-6">
            {methodology.map((step, i) => (
              <AnimatedReveal key={step.title} delay={i * 0.06}>
                <div className="flex gap-6 rounded-2xl border border-gris-bordure bg-blanc p-6 md:p-8 card-3d">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/25">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-noir">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-gris-moyen leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              Chronologie du projet
            </h2>
          </AnimatedReveal>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gris-bordure md:left-1/2" />
            {timeline.map((item, i) => (
              <AnimatedReveal key={item.year} delay={i * 0.1}>
                <div className={`relative flex gap-8 mb-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="hidden md:block md:w-1/2" />
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 z-10">
                    {item.year.slice(2)}
                  </div>
                  <div className="ml-16 md:ml-0 md:w-1/2 rounded-2xl border border-gris-bordure bg-blanc p-6 card-3d">
                    <p className="text-primary font-bold text-lg">{item.year}</p>
                    <p className="mt-2 text-gris-moyen leading-relaxed">{item.event}</p>
                  </div>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Pixel Nomade */}
      <section className="py-20 md:py-28 bg-gris-clair">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              L&apos;écosystème Pixel Nomade
            </h2>
            <p className="text-gris-moyen mt-3 max-w-xl mx-auto">
              PixMémoire fait partie d&apos;un ensemble de projets portés par Pixel Nomade.
            </p>
          </AnimatedReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ecosystem.map((item) => (
              <AnimatedReveal key={item.name}>
                <div className="rounded-2xl border border-gris-bordure bg-blanc p-5 card-3d">
                  <h3 className="font-serif text-lg font-semibold text-noir">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-gris-moyen">{item.description}</p>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Engagements */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              Nos engagements
            </h2>
          </AnimatedReveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Contenus vérifiés et sourcés",
              "Respect de la vie privée des personnalités",
              "Mise à jour régulière des profils",
              "Ouverture aux contributions citoyennes",
              "Accessibilité sur tous les appareils",
              "Gratuité totale pour les visiteurs",
            ].map((item, i) => (
              <AnimatedReveal key={item} delay={i * 0.05}>
                <div className="flex items-center gap-3 rounded-xl bg-blanc border border-gris-bordure px-5 py-4">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-noir font-medium">{item}</span>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 mesh-bg">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <AnimatedReveal>
            <Search className="h-10 w-10 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir mb-4">
              Explorez l&apos;annuaire dès maintenant
            </h2>
            <p className="text-gris-moyen text-lg mb-8 leading-relaxed">
              Recherchez une personnalité ou parcourez nos catégories pour
              découvrir l&apos;histoire de Djibouti.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-primary-hover transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                Lancer une recherche
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-gris-bordure bg-blanc px-8 py-4 text-base font-medium text-noir hover:border-primary hover:text-primary transition-all"
              >
                Nous contacter
              </Link>
            </div>
          </AnimatedReveal>
        </div>
      </section>
    </div>
  );
}
