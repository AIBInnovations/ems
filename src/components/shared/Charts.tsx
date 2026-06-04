import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHART = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 10,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
  boxShadow: "0 6px 18px hsl(222 30% 11% / 0.10)",
};

export function ChartCard({ title, action, children, height = 280 }: { title: string; action?: ReactNode; children: ReactNode; height?: number }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>{children}</div>
      </CardContent>
    </Card>
  );
}

export function AreaTrend({ data, xKey, series }: { data: Record<string, number | string>[]; xKey: string; series: { key: string; label: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART[i % CHART.length]} stopOpacity={0.35} />
              <stop offset="95%" stopColor={CHART[i % CHART.length]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={CHART[i % CHART.length]} strokeWidth={2} fill={`url(#g-${s.key})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarSeries({ data, xKey, series }: { data: Record<string, number | string>[]; xKey: string; series: { key: string; label: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={CHART[i % CHART.length]} radius={[6, 6, 0, 0]} maxBarSize={42} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({ data, xKey, series }: { data: Record<string, number | string>[]; xKey: string; series: { key: string; label: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={CHART[i % CHART.length]} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data }: { data: { name: string; value: number; color?: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.color ?? CHART[i % CHART.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold tabular-nums">{total}</span>
          <span className="text-xs text-muted-foreground">total</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-3 text-xs">
        {data.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: d.color ?? CHART[i % CHART.length] }} />
            {d.name} <span className="font-medium tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
