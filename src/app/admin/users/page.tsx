import { requireRole } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import UsersManager from "@/components/admin/users/UsersManager";

export default async function UsersPage() {
  const session = await requireRole(["super_admin"]);
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Utilisateurs admin
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Gérez les comptes administrateurs de la plateforme.
        </p>
      </div>

      <UsersManager
        users={users || []}
        currentUserId={session.adminUser.id}
      />
    </div>
  );
}
