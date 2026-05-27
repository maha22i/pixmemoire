import { requireAdmin } from "@/lib/admin/auth";
import SettingsPage from "@/components/admin/settings/SettingsPage";

export default async function AdminSettingsPage() {
  const session = await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Paramètres</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Configurez votre profil et les paramètres du site.
        </p>
      </div>

      <SettingsPage user={session.adminUser} />
    </div>
  );
}
