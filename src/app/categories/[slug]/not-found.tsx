import Link from "next/link";
import { FolderX } from "lucide-react";

export default function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-gris-clair p-5 mb-6">
        <FolderX className="h-10 w-10 text-gris-moyen" />
      </div>

      <h1 className="font-serif text-3xl font-bold text-noir mb-3">
        Catégorie introuvable
      </h1>

      <p className="text-gris-moyen max-w-md mb-8">
        La catégorie que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>

      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
