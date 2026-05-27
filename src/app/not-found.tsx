import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-8xl font-bold text-noir md:text-9xl">
        4<span className="text-primary">0</span>4
      </h1>
      <h2 className="mt-4 font-serif text-2xl font-semibold text-noir md:text-3xl">
        Page introuvable
      </h2>
      <p className="mt-4 max-w-md text-gris-moyen">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </Button>
    </div>
  );
}
