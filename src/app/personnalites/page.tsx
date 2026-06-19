import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getAllPersonalities,
  getAllCategories,
} from "@/lib/supabase/queries";
import { PersonnalitesContent } from "./PersonnalitesContent";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixmemoire.dj";

export const metadata: Metadata = {
  title: "Toutes les personnalités djiboutiennes",
  description:
    "Parcourez le répertoire complet des personnalités qui ont marqué l'histoire de Djibouti. Figures politiques, culturelles, sportives et intellectuelles.",
  keywords: [
    "personnalités djiboutiennes",
    "répertoire Djibouti",
    "biographies Djibouti",
    "figures historiques Djibouti",
  ],
  openGraph: {
    title: "Toutes les personnalités djiboutiennes | PixMémoire",
    description:
      "Parcourez le répertoire complet des personnalités qui ont marqué l'histoire de Djibouti.",
    url: `${BASE_URL}/personnalites`,
  },
  alternates: {
    canonical: `${BASE_URL}/personnalites`,
  },
};

export default async function PersonnalitesPage() {
  const [personalities, categories] = await Promise.all([
    getAllPersonalities(),
    getAllCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-gris-clair" />
            <div className="h-10 w-64 rounded bg-gris-clair" />
            <div className="h-12 max-w-2xl rounded bg-gris-clair" />
          </div>
        </div>
      }
    >
      <PersonnalitesContent
        initialPersonalities={personalities}
        categories={categories}
      />
    </Suspense>
  );
}
