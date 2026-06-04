import { useMemo } from "react";
import { format } from "date-fns";
import {
  Users,
  CalendarCheck,
  ClipboardCheck,
  NotebookPen,
  Trophy,
  BookOpen,
  CalendarDays,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import {
  DashHeader,
  StatGrid,
  QuickActions,
  ListCard,
  type ListItem,
} from "@/features/dashboard/blocks";
import type { StatCardProps } from "@/components/shared/StatCard";
import { db } from "@/data/db";
import { areaRoute } from "@/lib/routes";
import { fullName } from "@/lib/format";
import { useAuthStore } from "@/store/auth";

export function TeacherDashboard() {
  const staffId = useAuthStore((s) => s.user?.linkedProfileId) ?? null;

  const today = format(new Date(), "yyyy-MM-dd");
  const currentWeekdayIndex = new Date().getDay(); // 0=Sun .. 6=Sat

  const staff = useMemo(() => (staffId ? db.getById("staff", staffId) : null), [staffId]);
  const ct = staff?.classTeacherOf ?? null;
  const mySectionId = ct?.sectionId ?? null;

  const myStudents = useMemo(
    () => (mySectionId ? db.query("students", (s) => s.sectionId === mySectionId) : []),
    [mySectionId],
  );

  const myStudentIds = useMemo(() => new Set(myStudents.map((s) => s.id)), [myStudents]);

  const pendingLeaves = useMemo(
    () =>
      mySectionId
        ? db.query(
            "leaveApplications",
            (l) => l.status === "pending" && !!l.studentId && myStudentIds.has(l.studentId),
          )
        : [],
    [mySectionId, myStudentIds],
  );

  const stats = useMemo<StatCardProps[]>(() => {
    // Today's attendance % for my section (latest date), else school-wide latest.
    let attendancePct = 0;
    if (mySectionId) {
      const sectionAtt = db.query("studentAttendance", (a) => a.sectionId === mySectionId);
      const latest = sectionAtt.reduce((m, a) => (a.date > m ? a.date : m), "");
      const todays = sectionAtt.filter((a) => a.date === latest);
      const present = todays.filter((a) => a.status === "present").length;
      attendancePct = todays.length ? Math.round((present / todays.length) * 100) : 0;
    } else {
      const att = db.getAll("studentAttendance");
      const latest = att.reduce((m, a) => (a.date > m ? a.date : m), "");
      const todays = att.filter((a) => a.date === latest);
      const present = todays.filter((a) => a.status === "present").length;
      attendancePct = todays.length ? Math.round((present / todays.length) * 100) : 0;
    }

    const pendingMarks = mySectionId
      ? db.query(
          "markVerifications",
          (v) => v.stage === "entered" && v.sectionId === mySectionId,
        ).length
      : 0;

    const classHint = ct
      ? [db.getById("classes", ct.classId)?.name, db.getById("sections", mySectionId!)?.name]
          .filter(Boolean)
          .join(" ")
      : "Subject teacher";

    return [
      {
        label: "My Class",
        value: ct ? myStudents.length : "—",
        icon: Users,
        tone: "primary",
        to: areaRoute("students"),
        hint: classHint,
      },
      {
        label: "Today's Attendance",
        value: `${attendancePct}%`,
        icon: CalendarCheck,
        tone: "info",
        to: areaRoute("attendance"),
      },
      {
        label: "Pending Marks",
        value: pendingMarks,
        icon: ClipboardCheck,
        tone: "warning",
        to: areaRoute("marks"),
      },
      {
        label: "Leave Requests",
        value: pendingLeaves.length,
        icon: NotebookPen,
        tone: "accent",
        to: areaRoute("students"),
      },
    ];
  }, [ct, mySectionId, myStudents.length, pendingLeaves.length]);

  const leaveItems = useMemo<ListItem[]>(
    () =>
      pendingLeaves
        .slice()
        .sort((a, b) => (b.fromDate ?? "").localeCompare(a.fromDate ?? ""))
        .map((l) => {
          const student = l.studentId ? db.getById("students", l.studentId) : null;
          return {
            id: l.id,
            title: student ? fullName(student.firstName, student.lastName) : "Student",
            subtitle: l.reason,
            badge: { label: l.type },
            avatar: { first: student?.firstName, last: student?.lastName },
            to: areaRoute("students"),
          };
        }),
    [pendingLeaves],
  );

  const topStudents = useMemo<ListItem[]>(() => {
    if (!mySectionId) return [];
    return db
      .query("reportCards", (r) => r.sectionId === mySectionId && r.rank <= 5)
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((r) => {
        const student = db.getById("students", r.studentId);
        return {
          id: r.id,
          title: student ? fullName(student.firstName, student.lastName) : "Student",
          subtitle: `Rank #${r.rank}`,
          badge: { label: `${r.percentage}%`, variant: "success" as const },
          avatar: { first: student?.firstName, last: student?.lastName },
        };
      });
  }, [mySectionId]);

  const homeworkItems = useMemo<ListItem[]>(() => {
    if (!mySectionId) return [];
    return db
      .query("homework", (h) => h.sectionId === mySectionId && h.status === "open")
      .slice()
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
      .map((h) => ({
        id: h.id,
        title: h.title,
        subtitle: `${db.getById("subjects", h.subjectId)?.name ?? "Subject"} · due ${h.dueDate}`,
        badge: { label: "Open", variant: "info" as const },
        to: areaRoute("homework"),
      }));
  }, [mySectionId]);

  const scheduleItems = useMemo<ListItem[]>(() => {
    if (!mySectionId) return [];
    return db
      .query(
        "timetable",
        (t) => t.sectionId === mySectionId && t.dayOfWeek === currentWeekdayIndex,
      )
      .slice()
      .sort((a, b) => a.periodNo - b.periodNo)
      .slice(0, 6)
      .map((t) => ({
        id: t.id,
        title: (t.subjectId ? db.getById("subjects", t.subjectId)?.name : null) ?? "Free / Break",
        subtitle: `P${t.periodNo} · ${t.startTime}`,
        badge: t.room ? { label: t.room, variant: "outline" as const } : undefined,
      }));
  }, [mySectionId, currentWeekdayIndex]);

  // touch `today` so it's part of the render (keeps date computation co-located).
  void today;

  return (
    <div className="space-y-6">
      <DashHeader
        actions={
          <QuickActions
            actions={[
              { label: "Mark Attendance", icon: CalendarCheck, to: areaRoute("attendance"), tone: "accent" },
              { label: "Verify Marks", icon: ClipboardCheck, to: areaRoute("marks") },
              { label: "Homework", icon: ClipboardList, to: areaRoute("homework") },
              { label: "Class Chat", icon: MessageSquare, to: "/app/teacher/communication" },
            ]}
          />
        }
      />

      <StatGrid cols={4} items={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Leave Requests"
            icon={NotebookPen}
            items={leaveItems}
            emptyText="No pending leave requests"
            viewAllTo={areaRoute("students")}
          />
        </div>
        <ListCard
          title="Top Students"
          icon={Trophy}
          items={topStudents}
          emptyText="No results published yet"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListCard
            title="Homework Due"
            icon={BookOpen}
            items={homeworkItems}
            emptyText="No open homework"
            viewAllTo={areaRoute("homework")}
          />
        </div>
        <ListCard
          title="Today's Schedule"
          icon={CalendarDays}
          items={scheduleItems}
          emptyText="No periods scheduled today"
          max={6}
        />
      </div>
    </div>
  );
}
