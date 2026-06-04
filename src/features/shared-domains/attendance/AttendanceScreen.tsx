import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Fingerprint, Loader2, Lock, Save } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { attendanceService } from "@/data/services";
import { useCan } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth";
import { db } from "@/data/db";
import { todayKey } from "@/lib/clock";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

const OPTIONS: { value: AttendanceStatus; label: string; on: string }[] = [
  { value: "present", label: "P", on: "bg-success text-success-foreground" },
  { value: "absent", label: "A", on: "bg-destructive text-destructive-foreground" },
  { value: "late", label: "L", on: "bg-warning text-amber-950" },
  { value: "leave", label: "Lv", on: "bg-info text-info-foreground" },
];

export function AttendanceScreen() {
  const can = useCan();
  const user = useAuthStore((s) => s.user);
  const staffId = user?.linkedProfileId ?? "";
  const myClassSection = user?.roleKey === "class_teacher" ? db.getById("staff", staffId)?.classTeacherOf : null;
  const canEditPast = can({ permission: "attendance.student.editLate" }) && (user?.roleKey === "principal" || user?.roleKey === "admin");

  const sections = myClassSection ? db.getAll("sections").filter((s) => s.id === myClassSection.sectionId) : db.getAll("sections");
  const [sectionId, setSectionId] = useState(myClassSection?.sectionId ?? sections[0]?.id ?? "");
  const [date, setDate] = useState(todayKey());
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [busy, setBusy] = useState(false);

  const students = useMemo(() => db.query("students", (s) => s.sectionId === sectionId).sort((a, b) => a.rollNo.localeCompare(b.rollNo)), [sectionId]);
  const isToday = date === todayKey();
  const locked = !isToday && !canEditPast;

  useEffect(() => {
    const existing = db.query("studentAttendance", (a) => a.sectionId === sectionId && a.date === date);
    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { map[s.id] = existing.find((a) => a.studentId === s.id)?.status ?? "present"; });
    setMarks(map);
  }, [sectionId, date, students]);

  const counts = OPTIONS.map((o) => ({ ...o, n: Object.values(marks).filter((v) => v === o.value).length }));

  const save = async () => {
    setBusy(true);
    try {
      await attendanceService.markSection(sectionId, date, marks, staffId);
      toast.success("Attendance saved — absentees' parents notified");
    } finally {
      setBusy(false);
    }
  };

  const canBiometric = can({ permission: "attendance.biometric.import" });
  const [syncing, setSyncing] = useState(false);
  const syncBiometric = async () => {
    setSyncing(true);
    try {
      const n = await attendanceService.importBiometric();
      toast.success(`Biometric device synced — ${n} staff punches imported → payroll`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        icon={<CalendarCheck className="size-5" />}
        description="Mark daily attendance. Same-day edits only — later changes need Principal/Admin."
        actions={canBiometric ? <div className="flex items-center gap-2"><DemoBadge label="Biometric" /><Button variant="outline" size="sm" onClick={syncBiometric} disabled={syncing}>{syncing ? <Loader2 className="size-4 animate-spin" /> : <Fingerprint className="size-4" />} Sync device</Button></div> : undefined}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={sectionId} onValueChange={setSectionId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Section" /></SelectTrigger>
          <SelectContent>
            {sections.map((s) => { const c = db.getById("classes", s.classId); return <SelectItem key={s.id} value={s.id}>{c?.name} - {s.name}</SelectItem>; })}
          </SelectContent>
        </Select>
        <Input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} className="w-44" />
        <div className="flex flex-wrap gap-1.5">
          {counts.map((c) => <Badge key={c.value} variant="secondary" className="gap-1">{c.label}: {c.n}</Badge>)}
        </div>
        {locked ? <Badge variant="warning" className="gap-1"><Lock className="size-3" /> Locked (past day)</Badge> : null}
        <Button className="ml-auto" onClick={save} disabled={busy || locked}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save</Button>
      </div>

      {students.length === 0 ? (
        <EmptyState title="No students" description="This section has no enrolled students." />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <InitialsAvatar first={s.firstName} last={s.lastName} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{fullName(s.firstName, s.lastName)}</p>
                    <p className="font-mono text-xs text-muted-foreground">{s.rollNo}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      disabled={locked}
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: o.value }))}
                      className={cn("flex size-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors disabled:opacity-50", marks[s.id] === o.value ? o.on + " border-transparent" : "border-border hover:bg-muted")}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
