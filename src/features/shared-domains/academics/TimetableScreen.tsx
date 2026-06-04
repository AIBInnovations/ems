import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/data/db";
import { useAuthStore } from "@/store/auth";
import { formatTime } from "@/lib/format";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TINTS = ["bg-chart-1/10", "bg-chart-2/10", "bg-chart-3/15", "bg-chart-4/10", "bg-chart-5/10", "bg-primary/10"];

export function TimetableScreen() {
  const user = useAuthStore((s) => s.user);

  // resolve a default section: class teacher's class, student's section, parent's child section, else first
  const defaultSection = useMemo(() => {
    if (!user) return "";
    if (user.linkedProfileType === "staff") {
      const st = db.getById("staff", user.linkedProfileId ?? "");
      if (st?.classTeacherOf) return st.classTeacherOf.sectionId;
    }
    if (user.linkedProfileType === "student") return db.getById("students", user.linkedProfileId ?? "")?.sectionId ?? "";
    if (user.linkedProfileType === "guardian") {
      const g = db.getById("guardians", user.linkedProfileId ?? "");
      const child = g?.studentIds[0] ? db.getById("students", g.studentIds[0]) : null;
      return child?.sectionId ?? "";
    }
    return db.getAll("sections")[0]?.id ?? "";
  }, [user]);

  const sections = db.getAll("sections");
  const [sectionId, setSectionId] = useState(defaultSection || sections[0]?.id || "");

  const periods = useMemo(() => {
    const rows = db.query("timetable", (t) => t.sectionId === sectionId);
    const byPeriod = new Map<number, { startTime: string; endTime: string }>();
    rows.forEach((r) => { if (!byPeriod.has(r.periodNo)) byPeriod.set(r.periodNo, { startTime: r.startTime, endTime: r.endTime }); });
    const periodNos = [...byPeriod.keys()].sort((a, b) => a - b);
    const cell = (day: number, period: number) => rows.find((r) => r.dayOfWeek === day && r.periodNo === period);
    return { periodNos, byPeriod, cell };
  }, [sectionId]);

  const cls = sections.find((s) => s.id === sectionId);
  const className = cls ? `${db.getById("classes", cls.classId)?.name} - ${cls.name}` : "";

  return (
    <div className="space-y-5">
      <PageHeader title="Timetable" icon={<CalendarRange className="size-5" />} description={`Weekly class schedule${className ? " · " + className : ""}`} />

      <Select value={sectionId} onValueChange={setSectionId}>
        <SelectTrigger className="w-64"><SelectValue placeholder="Section" /></SelectTrigger>
        <SelectContent>
          {sections.map((s) => { const c = db.getById("classes", s.classId); return <SelectItem key={s.id} value={s.id}>{c?.name} - {s.name}</SelectItem>; })}
        </SelectContent>
      </Select>

      {periods.periodNos.length === 0 ? (
        <EmptyState icon={CalendarRange} title="No timetable" description="No periods scheduled for this section." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Period</th>
                  {DAYS.map((d) => <th key={d} className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {periods.periodNos.map((pn) => {
                  const t = periods.byPeriod.get(pn)!;
                  return (
                    <tr key={pn} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap p-3">
                        <p className="font-semibold">P{pn}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(t.startTime)}</p>
                      </td>
                      {DAYS.map((_, di) => {
                        const c = periods.cell(di + 1, pn);
                        const subj = c?.subjectId ? db.getById("subjects", c.subjectId) : null;
                        const teacher = c?.teacherStaffId ? db.getById("staff", c.teacherStaffId) : null;
                        return (
                          <td key={di} className="p-2 text-center">
                            {subj ? (
                              <div className={`rounded-lg p-2 ${TINTS[(subj.code.charCodeAt(0)) % TINTS.length]}`}>
                                <p className="text-sm font-medium">{subj.name}</p>
                                <p className="text-[11px] text-muted-foreground">{teacher ? `${teacher.firstName} ${teacher.lastName?.[0] ?? ""}.` : ""}</p>
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
