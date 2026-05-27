import Link from "next/link";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PersonnaliteNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24">
      <div className="flex flex-col items-center text-center">
        <UserX className="h-20 w-20 text-gris-moyen mb-6" strokeWidth={1.5} />

        <h1 className="font-serif text-3xl font-bold text-noir mb-3">
          Personnalité non trouvée
        </h1>

        <p className="text-gris-moyen max-w-md mb-8">
          La personnalité que vous recherchez n&apos;existe pas ou a été
          retirée de notre annuaire.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/personnalites">Parcourir l&apos;annuaire</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
