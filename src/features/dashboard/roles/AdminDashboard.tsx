import { useMemo } from "react";
import {
  BarChart3,
  Bell,
  CalendarCheck,
  ClipboardList,
  Inbox,
  MessageSquareWarning,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ChartCard,
  Donut,
  ListCard,
  attendanceTodayStat,
  recentActivityItems,
  type ListItem,
} from "@/features/dashboard/blocks";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { formatNumber } from "@/lib/format";

const COMPLAINT_VARIANT = {
  open: "destructive",
  "in-progress": "warning",
  resolved: "success",
} as const;

export function AdminDashboard() {
  const data = useMemo(() => {
    const studentsCount = db.count("students");

    // Staff present today: latest staffAttendance date, status === "present".
    const staffAtt = db.getAll("staffAttendance");
    const latestStaffDate = staffAtt.reduce((m, a) => (a.date > m ? a.date : m), "");
    const staffPresent = staffAtt.filter((a) => a.date === latestStaffDate && a.status === "present").length;

    const newInquiries = db.query("inquiries", (i) => i.status === "new");
    const openComplaints = db.query("complaints", (c) => c.status !== "resolved");

    const att = attendanceTodayStat();

    const admissionItems: ListItem[] = newInquiries.map((i) => ({
      id: i.id,
      title: i.name,
      subtitle: i.subject,
      badge: { label: i.source },
      to: areaRoute("inquiries"),
    }));

    const complaintItems: ListItem[] = openComplaints.map((c) => ({
      id: c.id,
      title: c.subject,
      subtitle: c.fromName,
      badge: { label: c.status, variant: COMPLAINT_VARIANT[c.status] ?? "secondary" },
    }));

    return {
      studentsCount,
      staffPresent,
      newInquiriesCount: newInquiries.length,
      att,
      admissionItems,
      complaintItems,
      activity: recentActivityItems(6),
    };
  }, []);

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Add Student", icon: UserPlus, to: areaRoute("students"), tone: "accent" },
              { label: "Approve Admissions", icon: UserCheck, to: areaRoute("admissions") },
              { label: "Notify", icon: Bell, to: areaRoute("notifications") },
              { label: "Reports", icon: BarChart3, to: areaRoute("reports") },
            ]}
          />
        }
      />

      <StatGrid
        cols={4}
        items={[
          {
            label: "Students",
            value: formatNumber(data.studentsCount),
            icon: Users,
            tone: "primary",
            to: areaRoute("students"),
            hint: "Enrolled this session",
          },
          {
            label: "Staff Present Today",
            value: data.staffPresent,
            icon: UserCheck,
            tone: "success",
            hint: "Checked in today",
          },
          {
            label: "New Inquiries",
            value: data.newInquiriesCount,
            icon: Inbox,
            tone: "warning",
            to: areaRoute("inquiries"),
            hint: "Awaiting response",
          },
          {
            label: "Attendance Today",
            value: `${data.att.pct}%`,
            icon: CalendarCheck,
            tone: "info",
            to: areaRoute("attendance"),
            hint: `${data.att.present} of ${data.att.total} present`,
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Admissions to Review"
            icon={ClipboardList}
            items={data.admissionItems}
            emptyText="No new admission inquiries"
            viewAllTo={areaRoute("inquiries")}
            max={6}
          />
        </div>
        <ChartCard title="Today's Attendance">
          <Donut data={data.att.split} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard
          title="Open Complaints"
          icon={MessageSquareWarning}
          items={data.complaintItems}
          emptyText="No open complaints"
          viewAllTo={areaRoute("complaints")}
          max={6}
        />
        <ListCard
          title="Recent Activity"
          icon={Inbox}
          items={data.activity}
          emptyText="No recent activity"
          max={6}
        />
      </div>
    </div>
  );
}
