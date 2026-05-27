"use client";

import { useState } from "react";
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
  },
  {
    icon: AlertTriangle,
    title: "Corriger une erreur",
    description: "Signalez une information inexacte pour que nous puissions la corriger rapidement.",
  },
  {
    icon: MessageSquare,
    title: "Poser une question",
    description: "Besoin d'informations sur PixMémoire ou sur une collaboration ? Écrivez-nous.",
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative mesh-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] left-[5%] w-64 h-64 rounded-full bg-accent-teal/8 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-16 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Contact" },
            ]}
          />

          <AnimatedReveal className="mt-10 max-w-2xl">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">
              Restons en contact
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-noir leading-tight">
              Contactez<span className="gradient-text">-nous</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-gris-moyen leading-relaxed">
              Une personnalité à proposer, une erreur à signaler, une question ?
              Notre équipe vous répond sous 48 heures.
            </p>
          </AnimatedReveal>
        </div>
      </section>

      {/* Raisons de nous contacter */}
      <section className="border-y border-gris-bordure bg-blanc">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {reasons.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <AnimatedReveal key={reason.title} delay={i * 0.08}>
                  <div className="flex items-start gap-4 rounded-2xl border border-gris-bordure bg-gris-clair/30 p-5 card-3d">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
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

      {/* Formulaire + Sidebar */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
            {/* Formulaire */}
            <AnimatedReveal className="lg:col-span-3">
              <div className="rounded-3xl border border-gris-bordure bg-blanc p-6 md:p-10 shadow-xl shadow-black/5">
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

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {activeTab === "proposer" ? (
                    <motion.form
                      key="proposer"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleSubmit}
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
                      onSubmit={handleSubmit}
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
              {/* Coordonnées */}
              <div className="relative rounded-3xl overflow-hidden bg-noir p-8 text-white">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <h2 className="font-serif text-2xl font-bold">Nos coordonnées</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Pixel Nomade — Djibouti
                  </p>

                  <div className="mt-8 space-y-6">
                    {contactItems.map((item) => {
                      const Icon = item.icon;
                      const content = (
                        <div className="flex items-start gap-4 group">
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
                          <div key={item.label}>
                            <div className="flex items-start gap-4">
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
              <div className="relative rounded-3xl overflow-hidden border border-gris-bordure card-3d">
                <div className="relative aspect-[4/3] bg-gris-clair flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
                    <p className="font-serif text-xl font-bold text-noir">Djibouti</p>
                    <p className="text-sm text-gris-moyen mt-1">Afrique de l&apos;Est — Corne de l&apos;Afrique</p>
                    <p className="text-sm text-gris-moyen mt-0.5">Saline Ouest</p>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
