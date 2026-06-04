import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO } from "@/lib/clock";
import { logActivity } from "@/lib/activity";
import { GRADE_BANDS } from "@/data/seed/reference";
import { notificationService } from "./notificationService";
import type { MarkStage } from "@/types";

export function gradeFor(pct: number): string {
  return GRADE_BANDS.find((b) => pct >= b.min && pct <= b.max)?.grade ?? "E";
}

/** The marks workflow: enter → verify → approve → publish (with rank computation). */
export const marksService = {
  /** Subject-teacher saves marks for a (exam, section, subject). */
  async enter(
    examId: string,
    sectionId: string,
    subjectId: string,
    rows: { studentId: string; marksObtained: number; isAbsent?: boolean }[],
    enteredByStaffId: string,
    maxMarks = 100,
  ) {
    await latency();
    const sec = db.getById("sections", sectionId);
    if (!sec) throw new Error("Section not found");
    rows.forEach((r) => {
      const existing = db.query(
        "marksEntries",
        (m) => m.examId === examId && m.sectionId === sectionId && m.subjectId === subjectId && m.studentId === r.studentId,
      )[0];
      const payload = {
        examId,
        classId: sec.classId,
        sectionId,
        subjectId,
        studentId: r.studentId,
        marksObtained: r.marksObtained,
        maxMarks,
        isAbsent: r.isAbsent ?? false,
        enteredByStaffId,
        enteredAt: nowISO(),
      };
      if (existing) db.update("marksEntries", existing.id, payload);
      else db.insert("marksEntries", payload);
    });
    this.setStage(examId, sectionId, subjectId, "entered", enteredByStaffId);
    logActivity("enter", "marksEntries", examId, "Entered marks");
  },

  setStage(examId: string, sectionId: string, subjectId: string, stage: MarkStage, staffId: string, scope: "single" | "all" = "single") {
    const existing = db.query(
      "markVerifications",
      (v) => v.examId === examId && v.sectionId === sectionId && v.subjectId === subjectId,
    )[0];
    if (existing) db.update("markVerifications", existing.id, { stage, actedByStaffId: staffId, actedAt: nowISO(), scope });
    else {
      const sec = db.getById("sections", sectionId);
      db.insert("markVerifications", {
        examId,
        classId: sec?.classId ?? "",
        sectionId,
        subjectId,
        stage,
        actedByStaffId: staffId,
        actedAt: nowISO(),
        scope,
      });
    }
  },

  async verifyOne(examId: string, sectionId: string, subjectId: string, staffId: string) {
    await latency();
    this.setStage(examId, sectionId, subjectId, "verified", staffId);
    logActivity("verify", "markVerifications", `${examId}:${subjectId}`, "Verified subject marks");
  },

  async approveAndPublish(examId: string, sectionId: string, staffId: string) {
    await latency(200, 500);
    // mark all section subjects approved+published
    const subjectIds = Array.from(
      new Set(db.query("marksEntries", (m) => m.examId === examId && m.sectionId === sectionId).map((m) => m.subjectId)),
    );
    subjectIds.forEach((sid) => this.setStage(examId, sectionId, sid, "published", staffId, "all"));
    this.computeReportCards(examId, sectionId);
    const sec = db.getById("sections", sectionId);
    await notificationService.quick(
      "Results Published",
      "Exam results have been published. Check your results section.",
      "class",
      "exam",
      sec ? [sec.id] : [],
    );
    logActivity("publish", "reportCards", `${examId}:${sectionId}`, "Approved & published results");
  },

  computeReportCards(examId: string, sectionId: string) {
    const sec = db.getById("sections", sectionId);
    if (!sec) return;
    const students = db.query("students", (s) => s.sectionId === sectionId);
    const scored = students.map((st) => {
      const entries = db.query("marksEntries", (m) => m.examId === examId && m.studentId === st.id);
      const subjects = entries.map((e) => ({
        subjectId: e.subjectId,
        marks: e.marksObtained,
        max: e.maxMarks,
        grade: gradeFor((e.marksObtained / e.maxMarks) * 100),
      }));
      const total = subjects.reduce((s, m) => s + m.marks, 0);
      const maxTotal = subjects.reduce((s, m) => s + m.max, 0) || 1;
      const pct = (total / maxTotal) * 100;
      return { st, subjects, total, pct };
    });
    scored.sort((a, b) => b.pct - a.pct);
    scored.forEach((row, idx) => {
      const failed = row.subjects.some((m) => (m.marks / m.max) * 100 < 33);
      const existing = db.query("reportCards", (r) => r.examId === examId && r.studentId === row.st.id)[0];
      const payload = {
        studentId: row.st.id,
        examId,
        classId: sec.classId,
        sectionId,
        subjects: row.subjects,
        total: row.total,
        percentage: Math.round(row.pct * 100) / 100,
        grade: gradeFor(row.pct),
        rank: idx + 1,
        result: (failed ? "compartment" : "pass") as "pass" | "compartment",
        publishedAt: nowISO(),
      };
      if (existing) db.update("reportCards", existing.id, payload);
      else db.insert("reportCards", payload);
    });
  },

  reportCardsForStudent(studentId: string) {
    return db.query("reportCards", (r) => r.studentId === studentId);
  },
};
