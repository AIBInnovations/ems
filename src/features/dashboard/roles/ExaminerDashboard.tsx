import { useMemo } from "react";
import { format } from "date-fns";
import {
  GraduationCap,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  ClipboardEdit,
  FileCheck,
  FileText,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ListCard,
  ChartCard,
  Donut,
  type ListItem,
} from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { useAuthStore } from "@/store/auth";

type BadgeVariant = NonNullable<NonNullable<ListItem["badge"]>["variant"]>;

const STAGE_VARIANT: Record<string, BadgeVariant> = {
  entered: "warning",
  verified: "info",
  approved: "success",
  published: "success",
};

export function ExaminerDashboard() {
  const staffId = useAuthStore((s) => s.user?.linkedProfileId) ?? null;

  const stats = useMemo<StatCardProps[]>(() => {
    const activeExams = db.query("exams", (e) => e.status === "ongoing" || e.status === "planned").length;
    const marksEntered = db.getAll("marksEntries").length;
    const pendingVerification = db.query("markVerifications", (v) => v.stage === "entered").length;
    const published = db.query("exams", (e) => e.status === "published").length;
    return [
      { label: "Active Exams", value: activeExams, icon: GraduationCap, tone: "primary", to: areaRoute("exams") },
      { label: "Marks Entered", value: marksEntered, icon: ClipboardCheck, tone: "info" },
      { label: "Pending Verification", value: pendingVerification, icon: Clock, tone: "warning", to: areaRoute("verification") },
      { label: "Published", value: published, icon: CheckCircle2, tone: "success" },
    ];
  }, []);

  const marksStatus = useMemo<ListItem[]>(() => {
    return [...db.getAll("markVerifications")]
      .sort((a, b) => (b.actedAt ?? b.createdAt).localeCompare(a.actedAt ?? a.createdAt))
      .slice(0, 6)
      .map((v) => ({
        id: v.id,
        title: (v.subjectId ? db.getById("subjects", v.subjectId)?.name : null) ?? "All subjects",
        subtitle: "Section marks",
        badge: { label: v.stage, variant: STAGE_VARIANT[v.stage] ?? "secondary" },
        to: areaRoute("marks"),
      }));
  }, []);

  const duties = useMemo<ListItem[]>(() => {
    const rows = staffId
      ? db.query("examDuties", (d) => d.staffId === staffId)
      : db.getAll("examDuties");
    return [...rows]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6)
      .map((d) => ({
        id: d.id,
        title: `${d.role} duty`,
        subtitle: format(new Date(d.date), "EEE, dd MMM yyyy"),
        badge: { label: d.room || "—", variant: "outline" },
      }));
  }, [staffId]);

  const outcomes = useMemo(() => {
    const cards = db.getAll("reportCards");
    const pass = cards.filter((c) => c.result === "pass").length;
    const compartment = cards.filter((c) => c.result === "compartment").length;
    const fail = cards.filter((c) => c.result === "fail").length;
    return [
      { name: "Pass", value: pass, color: "hsl(var(--success))" },
      { name: "Compartment", value: compartment, color: "hsl(var(--warning))" },
      { name: "Fail", value: fail, color: "hsl(var(--destructive))" },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Enter Marks", icon: ClipboardEdit, to: areaRoute("marks"), tone: "accent" },
              { label: "Evaluation", icon: FileCheck, to: areaRoute("evaluation") },
              { label: "Papers", icon: FileText, to: areaRoute("papers") },
            ]}
          />
        }
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Marks Entry Status"
            icon={ListChecks}
            items={marksStatus}
            emptyText="No marks entries yet"
            viewAllTo={areaRoute("verification")}
          />
        </div>
        <ListCard
          title="Exam Duty"
          icon={ShieldCheck}
          items={duties}
          emptyText="No duties assigned"
        />
      </div>

      <div className="grid gap-4">
        <ChartCard title="Exam Outcomes">
          <Donut data={outcomes} />
        </ChartCard>
      </div>
    </div>
  );
}
