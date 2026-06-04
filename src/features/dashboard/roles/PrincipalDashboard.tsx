import { useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  BarChart3,
  CalendarCheck,
  Check,
  GraduationCap,
  NotebookPen,
  UserCog,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ChartCard,
  AreaTrend,
  Donut,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { fullName } from "@/lib/format";

export function PrincipalDashboard() {
  const data = useMemo(() => {
    const students = db.getAll("students");
    const studentById = new Map(students.map((s) => [s.id, s]));

    /* ── Stat: Attendance today (latest snapshot date) ── */
    const attendance = db.getAll("studentAttendance");
    const latestDate = attendance.reduce((m, a) => (a.date > m ? a.date : m), "");
    const todays = attendance.filter((a) => a.date === latestDate);
    const presentToday = todays.filter((a) => a.status === "present").length;
    const attendancePct = todays.length ? Math.round((presentToday / todays.length) * 100) : 0;

    /* ── Stat: Pending leave ── */
    const pendingLeaves = db.query("leaveApplications", (l) => l.status === "pending");

    /* ── Stat: Results to publish ──
       distinct sections in markVerifications at stage verified/approved,
       plus sections of report cards still lacking publishedAt. */
    const readyStages = new Set(["verified", "approved"]);
    const sectionsToPublish = new Set<string>();
    db.getAll("markVerifications").forEach((mv) => {
      if (readyStages.has(mv.stage)) sectionsToPublish.add(mv.sectionId);
    });
    db.getAll("reportCards").forEach((rc) => {
      if (!rc.publishedAt) sectionsToPublish.add(rc.sectionId);
    });

    /* ── Stat: Staff (exclude super_admin) ── */
    const staffCount = db.query("staff", (s) => s.roleKey !== "super_admin").length;

    /* ── Chart: Attendance trend — present% per last 7 days ── */
    const trend = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = format(d, "yyyy-MM-dd");
      const dayRows = attendance.filter((a) => a.date === key);
      const present = dayRows.filter((a) => a.status === "present").length;
      return {
        day: format(d, "EEE"),
        Present: dayRows.length ? Math.round((present / dayRows.length) * 100) : 0,
      };
    });

    /* ── Chart: Exam outcomes (pass / compartment / fail) from report cards ── */
    const reportCards = db.getAll("reportCards");
    const outcomes = [
      { name: "Pass", value: reportCards.filter((r) => r.result === "pass").length, color: "hsl(var(--success))" },
      { name: "Compartment", value: reportCards.filter((r) => r.result === "compartment").length, color: "hsl(var(--warning))" },
      { name: "Fail", value: reportCards.filter((r) => r.result === "fail").length, color: "hsl(var(--destructive))" },
    ];

    /* ── List: Leave requests (pending) ── */
    const leaveItems: ListItem[] = pendingLeaves
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((l) => {
        const student = l.studentId ? studentById.get(l.studentId) : undefined;
        const title = student
          ? fullName(student.firstName, student.lastName)
          : l.applicantType === "staff"
            ? "Staff member"
            : l.applicantType === "parent-for-student"
              ? "Parent"
              : "Student";
        return {
          id: l.id,
          title,
          subtitle: l.reason,
          badge: { label: l.type },
          to: areaRoute("leave"),
        };
      });

    /* ── List: Top performers (rank <= 5) ── */
    const topPerformers: ListItem[] = reportCards
      .filter((r) => r.rank >= 1 && r.rank <= 5)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 6)
      .map((r) => {
        const student = studentById.get(r.studentId);
        return {
          id: r.id,
          title: student ? fullName(student.firstName, student.lastName) : "Student",
          subtitle: `Rank #${r.rank}`,
          badge: { label: `${Math.round(r.percentage)}%`, variant: "success" as const },
        };
      });

    return {
      attendancePct,
      pendingLeaveCount: pendingLeaves.length,
      resultsToPublish: sectionsToPublish.size,
      staffCount,
      trend,
      outcomes,
      leaveItems,
      topPerformers,
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Approve Leave", icon: Check, to: areaRoute("leave"), tone: "accent" },
              { label: "Publish Results", icon: GraduationCap, to: areaRoute("exams") },
              { label: "Reports", icon: BarChart3, to: areaRoute("reports") },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Attendance Today",
            value: `${data.attendancePct}%`,
            icon: CalendarCheck,
            tone: "info",
            to: areaRoute("attendance"),
            hint: "Present students",
          },
          {
            label: "Pending Leave",
            value: data.pendingLeaveCount,
            icon: NotebookPen,
            tone: "warning",
            to: areaRoute("leave"),
            hint: "Awaiting approval",
          },
          {
            label: "Results to Publish",
            value: data.resultsToPublish,
            icon: GraduationCap,
            tone: "accent",
            to: areaRoute("exams"),
            hint: "Sections ready",
          },
          {
            label: "Staff",
            value: data.staffCount,
            icon: UserCog,
            to: areaRoute("staff"),
            hint: "Active members",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Attendance Trend (7 days)">
            <AreaTrend data={data.trend} xKey="day" series={[{ key: "Present", label: "Present %" }]} />
          </ChartCard>
        </div>
        <ChartCard title="Exam Outcomes">
          <Donut data={data.outcomes} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Leave Requests"
            icon={NotebookPen}
            items={data.leaveItems}
            emptyText="No pending leave requests"
            viewAllTo={areaRoute("leave")}
          />
        </div>
        <ListCard
          title="Top Performers"
          icon={GraduationCap}
          items={data.topPerformers}
          emptyText="No published results yet"
          viewAllTo={areaRoute("exams")}
        />
      </div>
    </div>
  );
}
