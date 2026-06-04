import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  CircleDashed,
  Clock,
  XCircle,
  AlertTriangle,
  CircleSlash,
  Ban,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-amber-700 dark:text-amber-300",
  danger: "bg-destructive/12 text-destructive",
  info: "bg-info/12 text-info",
  neutral: "bg-muted text-muted-foreground",
};

interface Spec {
  tone: Tone;
  icon: LucideIcon;
  label: string;
}

const MAP: Record<string, Spec> = {
  // attendance
  present: { tone: "success", icon: CheckCircle2, label: "Present" },
  absent: { tone: "danger", icon: XCircle, label: "Absent" },
  late: { tone: "warning", icon: Clock, label: "Late" },
  half_day: { tone: "warning", icon: CircleDashed, label: "Half-day" },
  leave: { tone: "info", icon: CircleDashed, label: "Leave" },
  // fee
  paid: { tone: "success", icon: CheckCircle2, label: "Paid" },
  partial: { tone: "warning", icon: CircleDashed, label: "Partial" },
  due: { tone: "warning", icon: Clock, label: "Due" },
  overdue: { tone: "danger", icon: AlertTriangle, label: "Overdue" },
  // generic
  active: { tone: "success", icon: CheckCircle2, label: "Active" },
  inactive: { tone: "neutral", icon: Ban, label: "Inactive" },
  alumni: { tone: "info", icon: CircleDashed, label: "Alumni" },
  pending: { tone: "warning", icon: Clock, label: "Pending" },
  approved: { tone: "success", icon: CheckCircle2, label: "Approved" },
  rejected: { tone: "danger", icon: XCircle, label: "Rejected" },
  published: { tone: "success", icon: CheckCircle2, label: "Published" },
  draft: { tone: "neutral", icon: CircleDashed, label: "Draft" },
  sent: { tone: "success", icon: CheckCircle2, label: "Sent" },
  queued: { tone: "info", icon: Loader2, label: "Queued" },
  new: { tone: "info", icon: CircleDashed, label: "New" },
  replied: { tone: "success", icon: CheckCircle2, label: "Replied" },
  closed: { tone: "neutral", icon: CircleSlash, label: "Closed" },
  open: { tone: "warning", icon: CircleDashed, label: "Open" },
  resolved: { tone: "success", icon: CheckCircle2, label: "Resolved" },
  "in-progress": { tone: "info", icon: Loader2, label: "In progress" },
  pass: { tone: "success", icon: CheckCircle2, label: "Pass" },
  fail: { tone: "danger", icon: XCircle, label: "Fail" },
  compartment: { tone: "warning", icon: AlertTriangle, label: "Compartment" },
  issued: { tone: "info", icon: CircleDashed, label: "Issued" },
  returned: { tone: "success", icon: CheckCircle2, label: "Returned" },
  lost: { tone: "danger", icon: XCircle, label: "Lost" },
  available: { tone: "success", icon: CheckCircle2, label: "Available" },
  scheduled: { tone: "info", icon: Clock, label: "Scheduled" },
  started: { tone: "warning", icon: Loader2, label: "Started" },
  completed: { tone: "success", icon: CheckCircle2, label: "Completed" },
  maintenance: { tone: "warning", icon: AlertTriangle, label: "Maintenance" },
  confirmed: { tone: "success", icon: CheckCircle2, label: "Confirmed" },
  requested: { tone: "info", icon: Clock, label: "Requested" },
  recorded: { tone: "neutral", icon: CircleDashed, label: "Recorded" },
  reimbursed: { tone: "success", icon: CheckCircle2, label: "Reimbursed" },
  finalized: { tone: "success", icon: CheckCircle2, label: "Finalized" },
};

export function StatusPill({ status, label, className }: { status: string; label?: string; className?: string }) {
  const spec = MAP[status] ?? { tone: "neutral" as Tone, icon: CircleDashed, label: status };
  const Icon = spec.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS[spec.tone],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {label ?? spec.label}
    </span>
  );
}
