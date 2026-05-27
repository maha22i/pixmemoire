import { requireAdmin } from "@/lib/admin/auth";
import StatsPage from "@/components/admin/stats/StatsPage";

export default async function AdminStatsPage() {
  await requireAdmin();
  return <StatsPage />;
}
