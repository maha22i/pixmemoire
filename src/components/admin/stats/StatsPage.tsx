"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Eye, Users, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import StatCard from "@/components/admin/dashboard/StatCard";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface StatsData {
  stats: {
    totalPublished: number;
    totalDrafts: number;
    pendingSuggestions: number;
    totalViewsThisMonth: number;
  };
  viewsPerDay: { date: string; views: number }[];
  topPersonalities: Array<{
    id: string;
    full_name: string;
    views_count: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    color: string;
    value: number;
  }>;
}

const PERIODS = [
  { label: "7j", value: "7" },
  { label: "30j", value: "30" },
  { label: "90j", value: "90" },
  { label: "1 an", value: "365" },
];

const PIE_COLORS = [
  "#F5A623",
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#06B6D4",
];

export default function StatsPage() {
  const [period, setPeriod] = useState("30");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/stats?period=${period}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch {
        // erreur silencieuse
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner label="Chargement des statistiques..." />
      </div>
    );
  }

  const stats = data?.stats || {
    totalPublished: 0,
    totalDrafts: 0,
    pendingSuggestions: 0,
    totalViewsThisMonth: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Statistiques</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Analysez les performances de la plateforme.
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-[#F8F8F8] rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                period === p.value
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vues totales"
          value={stats.totalViewsThisMonth}
          icon={Eye}
          color="#F5A623"
        />
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
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Évolution des vues
        </h2>
        {data?.viewsPerDay && data.viewsPerDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.viewsPerDay}>
              <defs>
                <linearGradient id="statsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })
                }
                axisLine={{ stroke: "#E5E5E5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E5E5",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#F5A623"
                strokeWidth={2}
                fill="url(#statsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-sm text-[#6B6B6B]">
            Aucune donnée disponible pour cette période.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Top 10 — Personnalités les plus vues
          </h2>
          {data?.topPersonalities && data.topPersonalities.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.topPersonalities}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6B6B6B" }} />
                <YAxis
                  type="category"
                  dataKey="full_name"
                  tick={{ fontSize: 11, fill: "#1A1A1A" }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views_count" fill="#F5A623" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-[#6B6B6B]">
              Aucune donnée disponible.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Répartition par catégorie
          </h2>
          {data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-[#6B6B6B]">
              Aucune donnée disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
