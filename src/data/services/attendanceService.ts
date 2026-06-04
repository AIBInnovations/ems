import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO, todayKey } from "@/lib/clock";
import { logActivity } from "@/lib/activity";
import { newId } from "@/lib/id";
import { notificationService } from "./notificationService";
import type { AttendanceStatus } from "@/types";

export const attendanceService = {
  /** Mark/replace a student's attendance for a date. Same-day edit rule enforced. */
  async markStudent(
    studentId: string,
    date: string,
    status: AttendanceStatus,
    markedByStaffId: string,
    opts: { allowPastEdit?: boolean } = {},
  ) {
    await latency(60, 160);
    const existing = db.query("studentAttendance", (a) => a.studentId === studentId && a.date === date)[0];
    if (existing) {
      const isToday = date === todayKey();
      if (!isToday && !opts.allowPastEdit) throw new Error("Past attendance can only be edited by Principal/Admin.");
      db.update("studentAttendance", existing.id, { status, markedByStaffId, markedAt: nowISO() });
    } else {
      const st = db.getById("students", studentId);
      db.insert("studentAttendance", {
        studentId,
        classId: st?.classId ?? "",
        sectionId: st?.sectionId ?? "",
        date,
        status,
        markedByStaffId,
        markedAt: nowISO(),
        source: "manual",
      });
    }
  },

  /** Bulk-mark a section for today, then notify parents of absentees. */
  async markSection(sectionId: string, date: string, map: Record<string, AttendanceStatus>, staffId: string) {
    await latency(150, 400);
    const absentees: string[] = [];
    for (const [studentId, status] of Object.entries(map)) {
      await this.markStudent(studentId, date, status, staffId, { allowPastEdit: true });
      if (status === "absent" || status === "leave") absentees.push(studentId);
    }
    logActivity("attendance", "studentAttendance", sectionId, `Marked attendance for ${Object.keys(map).length} students`);
    if (absentees.length) {
      await notificationService.quick(
        "Attendance Alert",
        "Your child was marked absent today. Please contact the school if this is unexpected.",
        "member",
        "attendance",
        absentees,
      );
    }
  },

  /** Simulated biometric device sync → staff attendance for today. */
  async importBiometric(): Promise<number> {
    await latency(400, 900);
    const batchId = newId();
    const staff = db.getAll("staff").filter((s) => s.roleKey !== "super_admin");
    const date = todayKey();
    let count = 0;
    staff.forEach((s) => {
      const present = Math.random() < 0.9;
      db.insert("biometricPunches", { deviceId: "BIO-01", personType: "staff", personId: s.id, timestamp: nowISO(), direction: "in", importedBatchId: batchId });
      const existing = db.query("staffAttendance", (a) => a.staffId === s.id && a.date === date)[0];
      const payload = { staffId: s.id, date, checkIn: present ? "08:05" : undefined, status: (present ? "present" : "absent") as AttendanceStatus, workedHours: present ? 7.25 : 0, source: "biometric" as const, payrollImpact: true };
      if (existing) db.update("staffAttendance", existing.id, payload);
      else db.insert("staffAttendance", payload);
      count++;
    });
    logActivity("import", "staffAttendance", batchId, `Imported biometric attendance for ${count} staff`);
    return count;
  },

  monthlyForStudent(studentId: string) {
    return db.query("studentAttendance", (a) => a.studentId === studentId);
  },
  forSectionDate(sectionId: string, date: string) {
    return db.query("studentAttendance", (a) => a.sectionId === sectionId && a.date === date);
  },
};
