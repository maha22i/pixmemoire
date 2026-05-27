import { requireRole } from "@/lib/admin/auth";
import { Bot, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AISettingsPage from "@/components/admin/ai/AISettingsPage";

export const metadata = {
  title: "Paramètres IA — PixMémoire Admin",
};

export default async function Page() {
  await requireRole(["super_admin"]);

  return (
    <div className="space-y-6">
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
          Paramètres IA
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Configurez le comportement du générateur IA
        </p>
      </div>

      <AISettingsPage />
    </div>
  );
}
