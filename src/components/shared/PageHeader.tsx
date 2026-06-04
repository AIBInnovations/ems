import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  icon,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div> : null}
        <div className="space-y-1">
          <h1 className="font-display text-h1 tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function DemoBadge({ label = "Simulated" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
      {label}
    </span>
  );
}
