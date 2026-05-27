import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole, AdminUser } from "@/types/admin.types";

export interface AdminSession {
  user: { id: string; email: string };
  adminUser: AdminUser;
}

/**
 * Récupère la session admin courante.
 * Vérifie que l'utilisateur est authentifié ET présent dans admin_users.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (!adminUser) return null;

  return {
    user: { id: user.id, email: user.email! },
    adminUser: adminUser as AdminUser,
  };
}

/**
 * Exige une session admin valide.
 * Redirige vers /admin/login si non authentifié.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Exige un rôle spécifique parmi la liste fournie.
 * Redirige si le rôle ne correspond pas.
 */
export async function requireRole(
  allowedRoles: AdminRole[]
): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!allowedRoles.includes(session.adminUser.role)) {
    redirect("/admin?error=access_denied");
  }
  return session;
}
