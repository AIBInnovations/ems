import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  ChevronRight,
  Megaphone,
  MessageSquare,
  NotebookPen,
  Receipt,
  UserCircle,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  Panel,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import { Button } from "@/components/ui/button";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { formatMoney } from "@/lib/format";
import { useAuthStore } from "@/store/auth";

type LeaveBadgeVariant = NonNullable<NonNullable<ListItem["badge"]>["variant"]>;

const LEAVE_BADGE: Record<string, LeaveBadgeVariant> = {
  approved: "success",
  rejected: "destructive",
  pending: "warning",
};

export function OtherStaffDashboard() {
  const staffId = useAuthStore((s) => s.user?.linkedProfileId) ?? "";

  const data = useMemo(() => {
    // ── My attendance ──────────────────────────────────────────────
    const myAttendance = db.query("staffAttendance", (a) => a.staffId === staffId);
    const presentDays = myAttendance.filter((a) => a.status === "present").length;
    const totalDays = myAttendance.length;
    const attendancePct = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;

    // ── My leave applications ──────────────────────────────────────
    const myLeaves = db
      .query("leaveApplications", (l) => l.applicantId === staffId)
      .sort((a, b) => b.fromDate.localeCompare(a.fromDate));
    const leavesCount = myLeaves.length;

    // ── My reimbursements (expenses I requested) ───────────────────
    const myExpenses = db
      .query("expenses", (e) => e.requestedByStaffId === staffId)
      .sort((a, b) => b.date.localeCompare(a.date));
    const pendingReimbursements = myExpenses.filter((e) => e.status === "pending").length;

    // ── Notices ────────────────────────────────────────────────────
    const notices = db
      .getAll("notices")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    const noticeItems: ListItem[] = notices.map((n) => ({
      id: n.id,
      title: n.title,
      subtitle: n.body.slice(0, 60),
      badge: { label: n.audience },
    }));

    const leaveItems: ListItem[] = myLeaves.map((l) => ({
      id: l.id,
      title: l.type,
      subtitle: `${l.fromDate} → ${l.toDate}`,
      badge: { label: l.status, variant: LEAVE_BADGE[l.status] ?? "secondary" },
    }));

    const reimbursementItems: ListItem[] = myExpenses.map((e) => ({
      id: e.id,
      title: e.description || e.paidTo,
      subtitle: e.status,
      badge: { label: formatMoney(e.amount) },
    }));

    return {
      presentDays,
      totalDays,
      attendancePct,
      leavesCount,
      pendingReimbursements,
      noticeCount: notices.length,
      noticeItems,
      leaveItems,
      reimbursementItems,
    };
  }, [staffId]);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Apply Leave", icon: NotebookPen, to: areaRoute("leave"), tone: "accent" },
              { label: "Upload Expense", icon: Receipt, to: areaRoute("expenses") },
              { label: "Chat", icon: MessageSquare, to: "/app/staff/communication" },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "My Attendance",
            value: `${data.attendancePct}%`,
            icon: CalendarCheck,
            tone: "success",
            hint: `${data.presentDays}/${data.totalDays} present`,
          },
          {
            label: "Leaves",
            value: data.leavesCount,
            icon: NotebookPen,
            tone: "info",
            to: areaRoute("leave"),
          },
          {
            label: "Pending Reimbursements",
            value: data.pendingReimbursements,
            icon: Receipt,
            tone: "warning",
            to: areaRoute("expenses"),
          },
          {
            label: "Notices",
            value: data.noticeCount,
            icon: Megaphone,
            tone: "primary",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Recent Notices"
            icon={Megaphone}
            items={data.noticeItems}
            emptyText="No notices yet"
          />
        </div>
        <ListCard
          title="My Leaves"
          icon={NotebookPen}
          items={data.leaveItems}
          emptyText="No leave applications"
          viewAllTo={areaRoute("leave")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="My Reimbursements"
            icon={Receipt}
            items={data.reimbursementItems}
            emptyText="No reimbursement requests"
            viewAllTo={areaRoute("expenses")}
          />
        </div>
        <Panel title="Profile" icon={UserCircle}>
          <p className="text-sm text-muted-foreground">
            View and manage your staff profile, contact details and documents.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
            <Link to="/app/staff/profile">
              Open my profile <ChevronRight className="size-4" />
            </Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
