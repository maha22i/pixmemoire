"use client";

import { useState } from "react";
import Link from "next/link";
import {
  isErrorEmailConfigured,
  isProposalEmailConfigured,
  sendErrorReport,
  sendPersonalityProposal,
} from "@/lib/emailjs";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AnimatedReveal } from "@/components/common/AnimatedReveal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  Send,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Clock,
  ExternalLink,
  Sparkles,
  Building2,
  Shield,
  Users,
  FileCheck,
  HandHeart,
  Search,
  BookOpen,
} from "lucide-react";

type Tab = "proposer" | "signaler";

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "pixelnomadedj@gmail.com",
    href: "mailto:pixelnomadedj@gmail.com",
  },
  {
    icon: Phone,
    label: "Téléphone",
    values: ["+253 77 36 60 07", "+253 21 25 19 89"],
    hrefs: ["tel:+25377366007", "tel:+25321251989"],
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Saline Ouest, République de Djibouti",
  },
  {
    icon: Globe,
    label: "Site web",
    value: "pixel-nomade.com",
    href: "https://pixel-nomade.com",
    external: true,
  },
];

const reasons = [
  {
    icon: Sparkles,
    title: "Proposer une figure",
    description: "Suggérez une personnalité méconnue ou oubliée qui mérite d'être dans l'annuaire.",
    color: "border-primary/20 bg-primary/5",
    iconColor: "bg-primary/10 text-primary",
  },
  {
    icon: AlertTriangle,
    title: "Corriger une erreur",
    description: "Signalez une information inexacte pour que nous puissions la corriger rapidement.",
    color: "border-amber-500/20 bg-amber-500/5",
    iconColor: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: MessageSquare,
    title: "Poser une question",
    description: "Besoin d'informations sur PixMémoire ou sur une collaboration ? Écrivez-nous.",
    color: "border-accent-teal/20 bg-accent-teal/5",
    iconColor: "bg-accent-teal/10 text-accent-teal",
  },
];

const quickStats = [
  {
    icon: Clock,
    value: "48h",
    label: "Délai de réponse",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Send,
    value: "2",
    label: "Formulaires",
    color: "bg-accent-teal/10 text-accent-teal",
  },
  {
    icon: Users,
    value: "100%",
    label: "Ouvert au public",
    color: "bg-accent-blue/10 text-accent-blue",
  },
  {
    icon: HandHeart,
    value: "Gratuit",
    label: "Sans frais",
    color: "bg-amber-500/10 text-amber-600",
  },
];

const assurances = [
  {
    text: "Réponse sous 48 heures ouvrées",
    icon: Clock,
    color: "text-primary",
  },
  {
    text: "Données traitées avec confidentialité",
    icon: Shield,
    color: "text-accent-teal",
  },
  {
    text: "Chaque signalement est examiné",
    icon: FileCheck,
    color: "text-accent-blue",
  },
  {
    text: "Contributions bienvenues de tous",
    icon: Users,
    color: "text-primary",
  },
];

const inputClass =
  "h-12 rounded-xl border-gris-bordure bg-gris-clair/50 text-base placeholder:text-gris-moyen/60 focus:bg-blanc focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

const textareaClass =
  "flex w-full rounded-xl border border-gris-bordure bg-gris-clair/50 px-4 py-3 text-base text-noir placeholder:text-gris-moyen/60 transition-all focus:border-primary focus:bg-blanc focus:outline-none focus:ring-2 focus:ring-primary/20";

const selectClass =
  "flex h-12 w-full rounded-xl border border-gris-bordure bg-gris-clair/50 px-4 text-base text-noir transition-all focus:border-primary focus:bg-blanc focus:outline-none focus:ring-2 focus:ring-primary/20";

interface ContactContentProps {
  categoryNames: string[];
}

export function ContactContent({ categoryNames }: ContactContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>("proposer");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProposerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isProposalEmailConfigured()) {
      setSubmitError(
        "L'envoi par email n'est pas configuré. Contactez l'administrateur du site.",
      );
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    try {
      await sendPersonalityProposal({
        from_name: String(data.get("name") ?? ""),
        from_email: String(data.get("email") ?? ""),
        personality_name: String(data.get("personality_name") ?? ""),
        category: String(data.get("category") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      setSubmitted(true);
      form.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setSubmitError(
        "L'envoi a échoué. Vérifiez votre connexion et réessayez, ou écrivez-nous à pixelnomadedj@gmail.com.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignalerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isErrorEmailConfigured()) {
      setSubmitError(
        "L'envoi par email n'est pas configuré. Contactez l'administrateur du site.",
      );
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    try {
      await sendErrorReport({
        from_name: String(data.get("name") ?? ""),
        from_email: String(data.get("email") ?? ""),
        page_url: String(data.get("page_url") ?? ""),
        description: String(data.get("description") ?? ""),
      });
      setSubmitted(true);
      form.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setSubmitError(
        "L'envoi a échoué. Vérifiez votre connexion et réessayez, ou écrivez-nous à pixelnomadedj@gmail.com.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[44vh] flex items-end overflow-hidden">
        <Image
          src="/images/contact.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-blanc/40 backdrop-blur-[2px]" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] right-[8%] w-72 h-72 rounded-full bg-primary/15 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] left-[5%] w-64 h-64 rounded-full bg-accent-teal/10 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-7xl w-full px-4 pt-24 pb-16 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Contact" },
            ]}
          />

          <AnimatedReveal className="mt-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary tracking-widest uppercase">
                Restons en contact
              </p>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-noir leading-tight">
              Contactez<span className="gradient-text">-nous</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gris-moyen leading-relaxed">
              Une personnalité à proposer, une erreur à signaler, une question ?
              Notre équipe vous répond sous 48 heures.
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
                href="/a-propos"
                className="inline-flex items-center gap-2 rounded-xl border border-gris-bordure bg-blanc/80 backdrop-blur px-5 py-2.5 text-sm font-medium text-noir hover:border-primary hover:text-primary transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                À propos de PixMémoire
              </Link>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* Raisons de nous contacter */}
      <section className="border-b border-gris-bordure bg-blanc">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {reasons.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <AnimatedReveal key={reason.title} delay={i * 0.08}>
                  <div
                    className={`flex items-start gap-4 rounded-2xl border p-5 card-3d h-full ${reason.color}`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${reason.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-noir">{reason.title}</h3>
                      <p className="mt-1 text-sm text-gris-moyen leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                </AnimatedReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="border-y border-gris-bordure bg-gris-clair/40">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {quickStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <AnimatedReveal key={stat.label} delay={i * 0.1}>
                  <div className="rounded-2xl border border-gris-bordure bg-blanc p-6 text-center card-3d">
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-4 font-serif text-3xl md:text-4xl font-bold gradient-text">
                      {stat.value}
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

      {/* Formulaire + Sidebar */}
      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
         

          <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
            {/* Formulaire */}
            <AnimatedReveal className="lg:col-span-3">
              <div className="rounded-3xl border border-gris-bordure bg-blanc p-6 md:p-10 shadow-xl shadow-black/5 card-3d">
                {/* Tabs animés */}
                <div className="relative flex gap-2 rounded-2xl bg-gris-clair p-1.5">
                  <motion.div
                    layout
                    className="absolute inset-y-1.5 rounded-xl bg-blanc shadow-md"
                    style={{
                      width: "calc(50% - 6px)",
                      left: activeTab === "proposer" ? "6px" : "calc(50% + 0px)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  {(
                    [
                      { id: "proposer" as Tab, icon: Send, label: "Proposer une personnalité" },
                      { id: "signaler" as Tab, icon: AlertTriangle, label: "Signaler une erreur" },
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSubmitted(false);
                          setSubmitError(null);
                        }}
                        className={cn(
                          "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          activeTab === tab.id ? "text-noir" : "text-gris-moyen hover:text-noir",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">
                          {tab.id === "proposer" ? "Proposer" : "Signaler"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Message succès */}
                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                        <div>
                          <p className="font-semibold">Message envoyé avec succès !</p>
                          <p className="mt-0.5 text-green-700">
                            Nous vous répondrons dans les plus brefs délais.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                        <p>{submitError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {activeTab === "proposer" ? (
                    <motion.form
                      key="proposer"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleProposerSubmit}
                      className="mt-8 space-y-6"
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="prop-name" className="mb-2 block text-sm font-semibold text-noir">
                            Votre nom
                          </label>
                          <Input id="prop-name" name="name" required placeholder="Votre nom complet" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="prop-email" className="mb-2 block text-sm font-semibold text-noir">
                            Votre email
                          </label>
                          <Input id="prop-email" name="email" type="email" required placeholder="exemple@email.com" className={inputClass} />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="prop-personality" className="mb-2 block text-sm font-semibold text-noir">
                            Nom de la personnalité
                          </label>
                          <Input id="prop-personality" name="personality_name" required placeholder="Nom complet de la personnalité" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="prop-category" className="mb-2 block text-sm font-semibold text-noir">
                            Catégorie
                          </label>
                          <select id="prop-category" name="category" required className={selectClass}>
                            <option value="">Sélectionner une catégorie</option>
                            {categoryNames.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="prop-message" className="mb-2 block text-sm font-semibold text-noir">
                          Message / Description
                        </label>
                        <textarea
                          id="prop-message"
                          name="message"
                          required
                          rows={6}
                          placeholder="Décrivez brièvement la personnalité, son parcours et pourquoi elle devrait figurer sur PixMémoire..."
                          className={textareaClass}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-primary-hover transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            Envoyer la proposition
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signaler"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleSignalerSubmit}
                      className="mt-8 space-y-6"
                    >
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
                        <p className="font-medium">Merci de votre vigilance</p>
                        <p className="mt-1 text-amber-800/80">
                          Indiquez précisément l&apos;erreur constatée et, si possible, la source correcte.
                        </p>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="err-name" className="mb-2 block text-sm font-semibold text-noir">
                            Votre nom
                          </label>
                          <Input id="err-name" name="name" required placeholder="Votre nom complet" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="err-email" className="mb-2 block text-sm font-semibold text-noir">
                            Votre email
                          </label>
                          <Input id="err-email" name="email" type="email" required placeholder="exemple@email.com" className={inputClass} />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="err-page" className="mb-2 block text-sm font-semibold text-noir">
                          Page concernée
                        </label>
                        <Input id="err-page" name="page_url" required placeholder="URL ou nom de la personnalité concernée" className={inputClass} />
                      </div>

                      <div>
                        <label htmlFor="err-description" className="mb-2 block text-sm font-semibold text-noir">
                          Description de l&apos;erreur
                        </label>
                        <textarea
                          id="err-description"
                          name="description"
                          required
                          rows={6}
                          placeholder="Décrivez l'erreur constatée et proposez la correction si vous la connaissez..."
                          className={textareaClass}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-noir px-8 py-4 text-base font-semibold text-white hover:bg-noir-soft transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            Signaler l&apos;erreur
                            <AlertTriangle className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedReveal>

            {/* Sidebar */}
            <AnimatedReveal delay={0.15} className="lg:col-span-2 space-y-6">
              {/* Pixel Nomade */}
              <div className="rounded-3xl border border-gris-bordure bg-gradient-to-br from-gris-clair/80 to-blanc p-6 card-3d relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary tracking-widest uppercase">
                      Porteur du projet
                    </p>
                    <h3 className="font-serif text-xl font-bold text-noir mt-1">
                      Pixel Nomade
                    </h3>
                    <p className="mt-2 text-sm text-gris-moyen leading-relaxed">
                      Agence créative basée à Djibouti, à l&apos;origine de PixMémoire.
                    </p>
                    <Link
                      href="https://pixel-nomade.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary-hover transition-colors"
                    >
                      En savoir plus
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="relative rounded-3xl overflow-hidden bg-noir p-8 text-white card-3d">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-teal/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold">Nos coordonnées</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Pixel Nomade — Djibouti
                  </p>

                  <div className="mt-8 space-y-5">
                    {contactItems.map((item) => {
                      const Icon = item.icon;
                      const content = (
                        <div className="flex items-start gap-4 group rounded-xl border border-white/5 bg-white/5 p-4 hover:border-primary/20 transition-colors">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                              {item.label}
                            </p>
                            {"value" in item && item.value && (
                              <p className="mt-1 text-sm text-gray-200 group-hover:text-white transition-colors flex items-center gap-1">
                                {item.value}
                                {"external" in item && item.external && (
                                  <ExternalLink className="h-3 w-3 opacity-50" />
                                )}
                              </p>
                            )}
                            {"values" in item && item.values && (
                              <div className="mt-1 space-y-0.5">
                                {item.values.map((v) => (
                                  <p key={v} className="text-sm text-gray-200 group-hover:text-white transition-colors">
                                    {v}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );

                      if ("href" in item && item.href) {
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            target={"external" in item && item.external ? "_blank" : undefined}
                            rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                            className="block transition-transform hover:translate-x-1"
                          >
                            {content}
                          </a>
                        );
                      }

                      if ("hrefs" in item && item.hrefs) {
                        return (
                          <div
                            key={item.label}
                            className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                {item.label}
                              </p>
                              <div className="mt-1 space-y-0.5">
                                {item.values!.map((v, idx) => (
                                  <a
                                    key={v}
                                    href={item.hrefs![idx]}
                                    className="block text-sm text-gray-200 hover:text-primary transition-colors"
                                  >
                                    {v}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return <div key={item.label}>{content}</div>;
                    })}
                  </div>

                  <div className="mt-8 flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-gray-400">
                      Délai de réponse habituel : <span className="text-white font-medium">48 h ouvrées</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Carte / localisation */}
              {/* <div className="relative rounded-3xl overflow-hidden border border-gris-bordure card-3d">
                <div className="relative aspect-[4/3] bg-gris-clair flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
                    <p className="font-serif text-xl font-bold text-noir">Djibouti</p>
                    <p className="text-sm text-gris-moyen mt-1">Afrique de l&apos;Est — Corne de l&apos;Afrique</p>
                    <p className="text-sm text-gris-moyen mt-0.5">Saline Ouest</p>
                  </div>
                </div>
              </div> */}
            </AnimatedReveal>
          </div>
        </div>
      </section>

      {/* Nos engagements */}
      <section className="py-10 md:py-16 bg-gris-clair border-t border-gris-bordure">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <AnimatedReveal className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-noir">
              Ce que nous vous garantissons
            </h2>
            <p className="mt-3 text-gris-moyen max-w-lg mx-auto">
              Chaque message reçu est traité avec attention par notre équipe éditoriale.
            </p>
          </AnimatedReveal>

          <div className="rounded-3xl border border-gris-bordure bg-blanc p-6 md:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              {assurances.map((item, i) => {
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
              href="/a-propos"
              className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-hover transition-colors"
            >
              Découvrir notre démarche éditoriale
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedReveal>
        </div>
      </section>
    </div>
  );
}
