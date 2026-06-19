import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj"
  ),
  title: {
    template: "%s | PixMémoire — Mémoire vivante de Djibouti",
    default: "PixMémoire — Répertoire des personnalités djiboutiennes",
  },
  description:
    "PixMémoire est le premier répertoire numérique des personnalités qui ont marqué l'histoire de Djibouti. Figures politiques, culturelles, sportives et intellectuelles.",
  keywords: [
    "Djibouti",
    "personnalités djiboutiennes",
    "histoire de Djibouti",
    "figures politiques Djibouti",
    "indépendance Djibouti",
    "mémoire Djibouti",
    "patrimoine djiboutien",
    "biographies Djibouti",
    "culture djiboutienne",
    "personnalités africaines",
  ],
  authors: [{ name: "Pixel Nomade", url: "https://pixel-nomade.com" }],
  creator: "Pixel Nomade — Agence de communication multimédia, Djibouti",
  publisher: "PixMémoire by Pixel Nomade",
  openGraph: {
    type: "website",
    locale: "fr_DJ",
    url: "https://pixmemoire.dj",
    siteName: "PixMémoire",
    title: "PixMémoire — Répertoire des personnalités djiboutiennes",
    description:
      "Le premier répertoire numérique des personnalités qui ont fait l'histoire de Djibouti.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "PixMémoire — Mémoire vivante de Djibouti",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PixMémoire — Répertoire des personnalités djiboutiennes",
    description:
      "Le premier répertoire numérique des personnalités djiboutiennes.",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://pixmemoire.dj",
  },
  icons: {
    icon: "/images/logo-pixel.ico",
    shortcut: "/images/logo-pixel.ico",
    apple: "/images/logo-pixel.ico",
  },
  verification: {
    google: "google706852c95ea96bcf",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
