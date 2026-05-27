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
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "PixMémoire — La mémoire vivante de Djibouti",
    template: "%s | PixMémoire",
  },
  description:
    "Découvrez les femmes et les hommes qui ont façonné Djibouti. Un annuaire des personnalités djiboutiennes — politiques, artistes, sportifs, historiens et plus encore.",
  keywords: [
    "Djibouti",
    "personnalités",
    "annuaire",
    "biographies",
    "histoire",
    "culture djiboutienne",
    "Pixel Nomade",
  ],
  authors: [{ name: "Pixel Nomade", url: "https://pixel-nomade.com" }],
  creator: "Pixel Nomade",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "PixMémoire",
    title: "PixMémoire — La mémoire vivante de Djibouti",
    description:
      "Découvrez les femmes et les hommes qui ont façonné Djibouti.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "PixMémoire — La mémoire vivante de Djibouti",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PixMémoire — La mémoire vivante de Djibouti",
    description:
      "Découvrez les femmes et les hommes qui ont façonné Djibouti.",
  },
  robots: {
    index: true,
    follow: true,
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
