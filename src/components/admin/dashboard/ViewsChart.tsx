"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ViewsChartProps {
  data: { date: string; views: number }[];
}

export default function ViewsChart({ data }: ViewsChartProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const hasData = data.length > 0 && data.some((d) => d.views > 0);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
        Évolution des vues (30 jours)
      </h2>

      {!hasData ? (
        <div className="flex items-center justify-center h-[250px] text-sm text-[#6B6B6B]">
          Aucune donnée de vues disponible pour le moment.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E5E5"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
              axisLine={{ stroke: "#E5E5E5" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E5E5",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelFormatter={(label) => formatDate(String(label))}
              formatter={(value) => [value, "Vues"]}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#F5A623"
              strokeWidth={2}
              fill="url(#viewsGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#F5A623", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
