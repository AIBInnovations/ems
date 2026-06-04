import { useMemo, useState, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  UserCog,
  Wallet,
  CalendarCheck,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  GraduationCap,
  Receipt,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatGrid, Panel } from "@/features/dashboard/blocks";
import { StatusPill } from "@/components/shared/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/shared/dialogs";
import { toast } from "@/components/ui/sonner";
import { db } from "@/data/db";
import { schoolMetrics, platformService } from "@/data/services";
import { formatMoney, formatMoneyCompact, formatDate } from "@/lib/format";
import { NotFound } from "@/pages/NotFound";

/** A label + value row used inside the info panels. */
function Row({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm font-medium"}>{value}</span>
    </div>
  );
}

const PLAN_VARIANT: Record<string, "secondary" | "info" | "success" | "warning"> = {
  basic: "secondary",
  standard: "info",
  premium: "success",
  enterprise: "warning",
};

export function SchoolDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm } = useDialogs();
  const [tick, setTick] = useState(0);

  const school = id ? db.getById("schools", id) : null;

  // Recompute live metrics whenever an action bumps `tick`.
  const m = useMemo(() => (school ? schoolMetrics(school) : null), [school, tick]);

  if (!school || !m) return <NotFound />;

  const plan = school.plan ?? "basic";
  const status = school.subscriptionStatus ?? "active";

  const toggleActive = () => {
    const willSuspend = school.isActive;
    confirm({
      title: willSuspend ? `Suspend ${school.name}?` : `Activate ${school.name}?`,
      body: willSuspend
        ? "Members of this school will lose access until it is reactivated. The school's data is retained."
        : "This school and its members will regain access to the platform.",
      confirmLabel: willSuspend ? "Suspend School" : "Activate School",
      destructive: willSuspend,
      onConfirm: async () => {
        await platformService.setSchoolActive(school.id, !willSuspend);
        setTick((t) => t + 1);
        toast.success(willSuspend ? `${school.name} suspended` : `${school.name} activated`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={school.name}
        icon={<Building2 className="size-5" />}
        description={`${school.city} · ${school.region ?? school.state}`}
        actions={
          <Button variant={school.isActive ? "destructive" : "default"} onClick={toggleActive}>
            {school.isActive ? "Suspend School" : "Activate School"}
          </Button>
        }
      />

      <StatGrid
        cols={4}
        items={[
          { label: "Students", value: m.students.toLocaleString("en-IN"), icon: Users, tone: "primary", hint: "enrolled" },
          { label: "Staff", value: m.staff.toLocaleString("en-IN"), icon: UserCog, tone: "info", hint: "on payroll" },
          { label: "Monthly Revenue", value: formatMoneyCompact(m.monthlyRevenue), icon: Wallet, tone: "success", hint: "fee collection" },
          { label: "Attendance", value: `${m.attendancePct}%`, icon: CalendarCheck, tone: "accent", hint: "latest day" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Subscription & Billing" icon={CreditCard}>
          <div className="-mt-1">
            <Row label="Plan" value={<Badge variant={PLAN_VARIANT[plan]} className="capitalize">{plan}</Badge>} />
            <Row label="Annual Fee" value={formatMoney(school.subscriptionAmount ?? 0)} />
            <Row label="Status" value={<StatusPill status={status} label={status === "trial" ? "Trial" : undefined} />} />
            <Row label="Next Billing" value={formatDate(school.nextBillingDate)} />
            <Row label="Onboarded" value={formatDate(school.onboardedAt)} />
          </div>
        </Panel>

        <Panel title="Institution" icon={Building2}>
          <div className="-mt-1">
            <Row label="Principal" value={school.principalName} />
            <Row label="DISE Code" value={school.diseCode} mono />
            <Row label="License" value={school.licenseNo} mono />
            <Row label="Established" value={school.establishedYear} />
            <Row label="Email" value={school.email} />
            <Row label="Phone" value={school.phone} />
          </div>
        </Panel>
      </div>

      {school.isPrimary ? (
        <Panel title="Quick Links" icon={LayoutDashboard}>
          <p className="mb-3 text-sm text-muted-foreground">
            This is the fully-managed primary school — drill into the live Admin views.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate("/app/admin/dashboard")}>
              <LayoutDashboard className="size-4" /> Admin Dashboard <ExternalLink className="size-3.5 text-muted-foreground" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/app/admin/students")}>
              <GraduationCap className="size-4" /> Students <ExternalLink className="size-3.5 text-muted-foreground" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/app/admin/staff")}>
              <UserCog className="size-4" /> Staff <ExternalLink className="size-3.5 text-muted-foreground" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate("/app/admin/fees")}>
              <Receipt className="size-4" /> Fees <ExternalLink className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </Panel>
      ) : (
        <Panel title="Managed School" icon={Info}>
          <p className="text-sm text-muted-foreground">
            Summary-only portfolio record. Metrics are reported by the school; drill-in into operational
            (Admin) views is available for the primary school only.
          </p>
        </Panel>
      )}
    </div>
  );
}
