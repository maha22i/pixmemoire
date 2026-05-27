import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import StatCard from "@/components/admin/dashboard/StatCard";
import ViewsChart from "@/components/admin/dashboard/ViewsChart";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import { Users, FileText, MessageSquare, Eye, Bot } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [publishedRes, draftRes] = await Promise.all([
    supabase
      .from("personalities")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("personalities")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
  ]);

  let suggestionsCount = 0;
  try {
    const { count } = await supabase
      .from("suggestions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    suggestionsCount = count || 0;
  } catch {
    // table peut ne pas exister
  }

  let viewsCount = 0;
  try {
    const { count } = await supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("viewed_at", monthStart.toISOString());
    viewsCount = count || 0;
  } catch {
    // table peut ne pas exister
  }

  const stats = {
    totalPublished: publishedRes.count || 0,
    totalDrafts: draftRes.count || 0,
    pendingSuggestions: suggestionsCount,
    totalViewsThisMonth: viewsCount,
  };

  let recentActivities: Array<{
    id: string;
    admin_id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: Record<string, unknown>;
    created_at: string;
    admin_users?: { full_name: string } | null;
  }> = [];

  try {
    const { data } = await supabase
      .from("activity_logs")
      .select("*, admin_users(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);
    recentActivities = data || [];
  } catch {
    // table peut ne pas exister
  }

  let recentPersonalities: Array<{
    id: string;
    full_name: string;
    main_photo_url: string;
    status: string;
    created_at: string;
    slug: string;
  }> = [];

  try {
    const { data } = await supabase
      .from("personalities")
      .select("id, full_name, main_photo_url, status, created_at, slug")
      .order("created_at", { ascending: false })
      .limit(5);
    recentPersonalities = data || [];
  } catch {
    // gestion silencieuse
  }

  let viewsData: { date: string; views: number }[] = [];
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from("page_views")
      .select("viewed_at")
      .gte("viewed_at", thirtyDaysAgo.toISOString());

    if (data && data.length > 0) {
      const grouped: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        grouped[d.toISOString().split("T")[0]] = 0;
      }
      data.forEach((v) => {
        const date = new Date(v.viewed_at).toISOString().split("T")[0];
        if (date in grouped) grouped[date]++;
      });
      viewsData = Object.entries(grouped).map(([date, views]) => ({
        date,
        views,
      }));
    }
  } catch {
    // données non disponibles
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Bonjour, {session.adminUser.full_name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Personnalités publiées"
          value={stats.totalPublished}
          icon={Users}
          color="#10B981"
        />
        <StatCard
          title="Brouillons"
          value={stats.totalDrafts}
          icon={FileText}
          color="#F59E0B"
        />
        <StatCard
          title="Suggestions en attente"
          value={stats.pendingSuggestions}
          icon={MessageSquare}
          color="#3B82F6"
        />
        <StatCard
          title="Vues ce mois"
          value={stats.totalViewsThisMonth}
          icon={Eye}
          color="#F5A623"
        />
      </div>

      <ViewsChart data={viewsData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Dernières personnalités
          </h2>
          {recentPersonalities.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] py-4">
              Aucune personnalité créée pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {recentPersonalities.map((p) => (
                <a
                  key={p.id}
                  href={`/admin/personalities/${p.id}/edit`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8F8F8] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F8F8F8] overflow-hidden flex-shrink-0">
                    {p.main_photo_url ? (
                      <img
                        src={p.main_photo_url}
                        alt={p.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
                        <Users size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {p.full_name}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      p.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <ActivityFeed activities={recentActivities} />
      </div>

      {/* Card Génération IA */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5A623]/20 flex items-center justify-center">
              <Bot size={24} className="text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Générateur IA</h2>
              <p className="text-sm text-white/60">
                Créez des fiches de personnalités en quelques secondes avec Claude
              </p>
            </div>
          </div>
          <Link
            href="/admin/ai-generator"
            className="px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] bg-[#F5A623] rounded-lg hover:bg-[#E09010] transition-colors"
          >
            Générer une fiche
          </Link>
        </div>
      </div>

      <QuickActions />
    </div>
  );
}
