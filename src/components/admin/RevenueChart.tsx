"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: Array<{ label: string; revenue: number; orderCount: number }>;
  currency: string;
}

export function RevenueChart({ data, currency }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number) => [
            new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(value),
            "Ciro",
          ]}
          labelFormatter={(label) => label}
        />
        <Bar dataKey="revenue" fill="var(--color-primary, #2563eb)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
