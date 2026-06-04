import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: number; positiveIsGood?: boolean };
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "accent";
  to?: string;
  hint?: string;
}

const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-amber-700 dark:text-amber-300",
  danger: "bg-destructive/12 text-destructive",
  info: "bg-info/12 text-info",
  accent: "bg-accent/15 text-amber-700 dark:text-amber-300",
};

export function StatCard({ label, value, icon: Icon, delta, tone = "primary", to, hint }: StatCardProps) {
  const positive = delta ? (delta.positiveIsGood === false ? delta.value < 0 : delta.value >= 0) : true;
  const className = cn(
    "group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs transition-all",
    to && "hover:-translate-y-0.5 hover:shadow-sm",
  );
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", TONE[tone])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="font-display text-3xl font-bold tabular-nums leading-none tracking-tight">{value}</span>
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
              positive ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
            )}
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(delta.value)}%
          </span>
        ) : null}
      </div>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </>
  );
  return to ? (
    <Link to={to} className={className}>{inner}</Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
