import type { Metadata } from "next";
import Image from "next/image";
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
  ArrowRight,
  ExternalLink,
  Users,
  FolderOpen,
  Gift,
  Calendar,
  Building2,
  Sparkles,
  Library,
  FileCheck,
  PenLine,
  UsersRound,
  Rocket,
  Tv,
  Zap,
  Brain,
  Lock,
  RefreshCw,
  MessageSquare,
  Smartphone,
  HandHeart,
  MapPin,
  Mail,
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

const stats = [
  {
    icon: Users,
    label: "Personnalités",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FolderOpen,
    label: "Catégories",
    color: "bg-accent-teal/10 text-accent-teal",
  },
  {
    icon: Gift,
    label: "Gratuit",
    color: "bg-accent-blue/10 text-accent-blue",
  },
  {
    icon: Calendar,
    label: "Lancement",
    color: "bg-amber-500/10 text-amber-600",
  },
] as const;

const pillars = [
  {
    icon: BookOpen,
    title: "Patrimoine numérique",
    description: "Préserver les parcours qui font l'histoire de Djibouti.",
    color: "border-primary/20 bg-primary/5",
    iconColor: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Fiabilité éditoriale",
    description: "Des contenus vérifiés, sourcés et régulièrement mis à jour.",
    color: "border-accent-teal/20 bg-accent-teal/5",
    iconColor: "bg-accent-teal/10 text-accent-teal",
  },
  {
    icon: Globe,
    title: "Ouvert à tous",
    description: "Un annuaire gratuit, accessible partout dans le monde.",
    color: "border-accent-blue/20 bg-accent-blue/5",
    iconColor: "bg-accent-blue/10 text-accent-blue",
  },
];

const methodology = [
  {
    icon: Library,
    title: "Collecte d'informations",
    description:
      "Nous recueillons des données auprès de sources multiples : archives nationales, ouvrages de référence, témoignages de proches, presse locale et internationale.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: FileCheck,
    title: "Recoupement et vérification",
    description:
      "Chaque information est confrontée à au moins deux sources indépendantes. Les dates, faits marquants et affiliations sont minutieusement vérifiés.",
    accent: "bg-accent-teal/10 text-accent-teal",
  },
  {
    icon: PenLine,
    title: "Rédaction éditoriale",
    description:
      "Nos rédacteurs transforment les données brutes en biographies accessibles, structurées et respectueuses, adaptées à un large public.",
    accent: "bg-accent-blue/10 text-accent-blue",
  },
  {
    icon: UsersRound,
    title: "Relecture éditoriale",
    description:
      "Un comité éditorial relit chaque profil pour garantir la qualité rédactionnelle, l'exactitude factuelle et le respect de la personne concernée.",
    accent: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Rocket,
    title: "Publication et mise à jour",
    description:
      "Les profils sont publiés puis régulièrement actualisés. Les lecteurs peuvent signaler des erreurs via notre formulaire de contact.",
    accent: "bg-primary/10 text-primary",
  },
];

const values = [
  {
    icon: Shield,
    title: "Rigueur",
    description: "Chaque biographie repose sur des sources vérifiables et un processus éditorial exigeant.",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: Heart,
    title: "Respect",
    description: "Nous traitons chaque personnalité avec dignité, en valorisant son parcours sans sensationalisme.",
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Globe,
    title: "Accessibilité",
    description: "Un annuaire gratuit, en ligne, pensé pour être consulté par tous, partout dans le monde.",
    iconBg: "bg-accent-teal/20",
    iconColor: "text-accent-teal",
  },
  {
    icon: Award,
    title: "Exhaustivité",
    description: "Notre ambition : couvrir toutes les sphères de la vie publique djiboutienne, sans exception.",
    iconBg: "bg-accent-blue/20",
    iconColor: "text-accent-blue",
  },
];

const timeline = [
  { year: "2024", event: "Lancement du projet PixMémoire par Pixel Nomade à Djibouti." },
  { year: "2025", event: "Première version de l'annuaire avec les figures historiques majeures." },
  { year: "2026", event: "Extension à 8 catégories et ouverture aux contributions du public." },
];

const ecosystem = [
  {
    name: "PixTV",
    description: "Média audiovisuel djiboutien",
    icon: Tv,
    color: "bg-primary/10 text-primary",
  },
  {
    name: "PixEvent",
    description: "Organisation d'événements culturels",
    icon: Calendar,
    color: "bg-accent-teal/10 text-accent-teal",
  },
  {
    name: "PixInfluFlash",
    description: "Marketing d'influence local",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    name: "PixAI",
    description: "Solutions d'intelligence artificielle",
    icon: Brain,
    color: "bg-accent-blue/10 text-accent-blue",
  },
];

const commitments = [
  {
    text: "Contenus vérifiés et sourcés",
    icon: FileCheck,
    color: "text-primary",
  },
  {
    text: "Respect de la vie privée des personnalités",
    icon: Lock,
    color: "text-accent-teal",
  },
  {
    text: "Mise à jour régulière des profils",
    icon: RefreshCw,
    color: "text-accent-blue",
  },
  {
    text: "Ouverture aux contributions citoyennes",
    icon: MessageSquare,
    color: "text-primary",
  },
  {
    text: "Accessibilité sur tous les appareils",
    icon: Smartphone,
    color: "text-accent-teal",
  },
  {
    text: "Gratuité totale pour les visiteurs",
    icon: HandHeart,
    color: "text-amber-600",
  },
];

export default async function AProposPage() {
  const [personalityCount, categoryCount] = await Promise.all([
    getPersonalityCount(),
    getCategoryCount(),
  ]);

  const statValues = [
    personalityCount,
    categoryCount,
    "100%",
    "2024",
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[44vh] flex items-end overflow-hidden">
        <Image
          src="/images/propos.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-blanc/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] right-[8%] w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-[20%] left-[5%] w-64 h-64 rounded-full bg-accent-teal/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl w-full px-4 pt-24 pb-16 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "À propos" },
            ]}
          />

          <AnimatedReveal className="mt-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary tracking-widest uppercase">
                Notre histoire
              </p>
            </div>
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
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                <Search className="h-4 w-4" />
                Explorer l&apos;annuaire
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-gris-bordure bg-blanc/80 backdrop-blur px-5 py-2.5 text-sm font-medium text-noir hover:border-primary hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                Nous contacter
              </Link>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* Piliers */}
      <section className="border-b border-gris-bordure bg-blanc">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <AnimatedReveal key={pillar.title} delay={i * 0.08}>
                  <div
                    className={`flex items-start gap-4 rounded-2xl border p-5 card-3d h-full ${pillar.color}`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pillar.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-noir">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-sm text-gris-moyen leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gris-bordure bg-gris-clair/40">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <AnimatedReveal key={stat.label} delay={i * 0.1}>
                  <div className="rounded-2xl border border-gris-bordure bg-blanc p-6 text-center card-3d">
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-4 font-serif text-4xl md:text-5xl font-bold gradient-text">
                      {statValues[i]}
                    </p>
                    <p className="mt-2 text-sm text-gris-moyen uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">
              Qui sommes-nous
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              Mission, vision &amp; porteur du projet
            </h2>
          </AnimatedReveal>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            <div className="space-y-6">
              <AnimatedReveal>
                <div className="rounded-3xl border border-gris-bordure border-l-4 border-l-primary bg-blanc p-8 card-3d">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                      <Target className="h-7 w-7 text-primary" />
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
                </div>
              </AnimatedReveal>

              <AnimatedReveal delay={0.1}>
                <div className="rounded-3xl border border-gris-bordure border-l-4 border-l-accent-teal bg-blanc p-8 card-3d">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-teal/10">
                      <Eye className="h-7 w-7 text-accent-teal" />
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
                </div>
              </AnimatedReveal>
            </div>

            <AnimatedReveal delay={0.15}>
              <div className="rounded-3xl border border-gris-bordure bg-gradient-to-br from-gris-clair/80 to-blanc p-8 h-full flex flex-col justify-center card-3d relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
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
                  <div className="mt-6 flex items-center gap-2 text-sm text-gris-moyen">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>Saline Ouest, République de Djibouti</span>
                  </div>
                  <a
                    href="https://pixel-nomade.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-3 text-primary font-medium hover:bg-primary/15 transition-colors"
                  >
                    Visiter pixel-nomade.com
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-10 md:py-16 bg-noir relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-teal/20 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/20 mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
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
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 card-3d h-full hover:border-primary/30 transition-colors">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${value.iconBg} mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${value.iconColor}`} />
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
      <section className="py-10 md:py-16 bg-gris-clair">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedReveal className="max-w-2xl mb-14">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-gris-bordure bg-blanc px-4 py-2 mb-5">
              <BookOpen className="h-5 w-5 text-primary" />
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

          <div className="space-y-4">
            {methodology.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimatedReveal key={step.title} delay={i * 0.06}>
                  <div className="flex gap-5 rounded-2xl border border-gris-bordure bg-blanc p-6 md:p-8 card-3d">
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-noir text-sm font-bold text-blanc">
                        {i + 1}
                      </span>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.accent}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-serif text-xl font-semibold text-noir">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-gris-moyen leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {/* <section className="py-20 md:py-28">
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
      </section> */}

      {/* Ecosystem Pixel Nomade */}
      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              L&apos;écosystème Pixel Nomade
            </h2>
            <p className="text-gris-moyen mt-3 max-w-xl mx-auto">
              PixMémoire fait partie d&apos;un ensemble de projets portés par Pixel Nomade.
            </p>
          </AnimatedReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ecosystem.map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedReveal key={item.name} delay={i * 0.06}>
                  <div className="rounded-2xl border border-gris-bordure bg-blanc p-6 card-3d h-full hover:border-primary/30 transition-colors group">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} mb-4 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-noir">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm text-gris-moyen leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engagements */}
      <section className="py-10 md:py-16 bg-gris-clair">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              Nos engagements
            </h2>
            <p className="mt-3 text-gris-moyen max-w-lg mx-auto">
              Des promesses concrètes envers nos lecteurs et les personnalités que nous documentons.
            </p>
          </AnimatedReveal>

          <div className="rounded-3xl border border-gris-bordure bg-blanc p-6 md:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              {commitments.map((item, i) => {
                const Icon = item.icon;
                return (
                  <AnimatedReveal key={item.text} delay={i * 0.05}>
                    <div className="flex items-center gap-3 rounded-xl bg-gris-clair/50 border border-gris-bordure/60 px-5 py-4 card-3d">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blanc border border-gris-bordure">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <span className="text-noir font-medium text-sm leading-snug">
                        {item.text}
                      </span>
                    </div>
                  </AnimatedReveal>
                );
              })}
            </div>
          </div>

          <AnimatedReveal delay={0.2} className="mt-8 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-hover transition-colors"
            >
              Une question ou une contribution ?
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedReveal>
        </div>
      </section>

      {/* CTA */}
      {/* <section className="py-10 md:py-16">
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
      </section> */}
    </div>
  );
}
