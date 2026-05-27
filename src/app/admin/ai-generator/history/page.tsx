import { requireAdmin } from "@/lib/admin/auth";
import { Bot, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GenerationHistory from "@/components/admin/ai/GenerationHistory";

export const metadata = {
  title: "Historique IA — PixMémoire Admin",
};

export default async function Page() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/ai-generator"
            className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-2"
          >
            <ArrowLeft size={14} />
            Retour au générateur
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Bot size={28} className="text-[#F5A623]" />
            Historique des générations
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Consultez toutes les fiches générées par IA
          </p>
        </div>
      </div>

      <GenerationHistory />
    </div>
  );
}
