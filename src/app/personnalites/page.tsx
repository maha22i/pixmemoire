import { Suspense } from "react";
import {
  getAllPersonalities,
  getAllCategories,
} from "@/lib/supabase/queries";
import { PersonnalitesContent } from "./PersonnalitesContent";

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
