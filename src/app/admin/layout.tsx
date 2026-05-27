import { Toaster } from "sonner";
import { getAdminSession } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin — PixMémoire",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Pas authentifié — afficher uniquement le contenu (page login)
  if (!session) {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    );
  }

  let pendingSuggestions = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("suggestions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pendingSuggestions = count || 0;
  } catch {
    // table peut ne pas exister
  }

  return (
    <div className="flex h-screen bg-[#F8F8F8]">
      <AdminSidebar
        user={session.adminUser}
        pendingSuggestions={pendingSuggestions}
      />
      <div className="flex-1 flex flex-col ml-[260px]">
        <AdminHeader user={session.adminUser} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
