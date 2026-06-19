import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ExternalLink, Heart, ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Personnalités", href: "/personnalites" },
  { label: "Catégories", href: "/categories" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

const poles = [
  { label: "PixTV", href: "#" },
  { label: "PixEvent", href: "#" },
  { label: "PixInfluFlash", href: "#" },
  { label: "PixAI", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-noir text-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] bg-accent-blue/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Top section with brand */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 pt-16 pb-12 border-b border-white/[0.06]">
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-3">
              <Image
                src="/images/logo-pixel.jpeg"
                alt="Pixel Nomade"
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-xl object-cover transition-opacity group-hover:opacity-90"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-xl font-bold text-blanc tracking-tight">
                  Pix<span className="text-primary">.</span>Mémoire
                </span>
                <span className="text-[10px] tracking-wider text-gray-500 uppercase">
                  by Pixel Nomade
                </span>
              </div>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-gray-400">
              La mémoire vivante de Djibouti. Un annuaire des personnalités qui
              ont façonné notre nation — accessible, vérifié et enrichi en continu.
            </p>
            <a
              href="https://pixel-nomade.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-primary/30 hover:text-primary"
            >
              pixel-nomade.com
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16">
            {/* Navigation */}
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-5">
                Navigation
              </h3>
              <ul className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors duration-200 hover:text-blanc"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pôles */}
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-5">
                Nos pôles
              </h3>
              <ul className="flex flex-col gap-3">
                {poles.map((pole) => (
                  <li key={pole.label}>
                    <a
                      href={pole.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors duration-200 hover:text-blanc"
                    >
                      {pole.label}
                      <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-5">
                Contact
              </h3>
              <ul className="flex flex-col gap-3.5">
                <li>
                  <a
                    href="mailto:pixelnomadedj@gmail.com"
                    className="group flex items-center gap-3 text-sm text-gray-400 transition-colors duration-200 hover:text-blanc"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-primary/15">
                      <Mail className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-primary" />
                    </div>
                    <span className="truncate">pixelnomadedj@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+25377366007"
                    className="group flex items-center gap-3 text-sm text-gray-400 transition-colors duration-200 hover:text-blanc"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-primary/15">
                      <Phone className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-primary" />
                    </div>
                    +253 77 36 60 07
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+25321251989"
                    className="group flex items-center gap-3 text-sm text-gray-400 transition-colors duration-200 hover:text-blanc"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-primary/15">
                      <Phone className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-primary" />
                    </div>
                    +253 21 25 19 89
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                    <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  Saline Ouest, Djibouti
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-xs text-gray-500">
          <p className="flex items-center gap-1.5">
            © 2026 Pixel Nomade — Développé par Netlink Solutions
          </p>
          <div className="flex items-center gap-1">
            <Link
              href="/mentions-legales"
              className="rounded-md px-2.5 py-1 transition-colors hover:text-gray-300 hover:bg-white/[0.04]"
            >
              Mentions légales
            </Link>
            <span className="text-gray-700">·</span>
            <Link
              href="/confidentialite"
              className="rounded-md px-2.5 py-1 transition-colors hover:text-gray-300 hover:bg-white/[0.04]"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
