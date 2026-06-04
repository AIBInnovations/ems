import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { fullName } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import { createCrudService } from "@/lib/createService";
import { notificationService } from "./notificationService";

const base = createCrudService("students", { label: (s) => fullName(s.firstName, s.lastName), origin: "Students", noun: "student" });

export const studentService = {
  ...base,

  /** Promote selected students to the next numeric class (auto-promotion). */
  async promote(studentIds: string[], toClassId: string, toSectionId: string) {
    await latency(200, 500);
    studentIds.forEach((id) => db.update("students", id, { classId: toClassId, sectionId: toSectionId }));
    logActivity("promote", "students", toClassId, `Promoted ${studentIds.length} student(s)`);
  },

  /** Auto-promote: pass students move up one level. Returns count promoted. */
  async autoPromote(fromClassId: string): Promise<number> {
    await latency();
    const from = db.getById("classes", fromClassId);
    if (!from) return 0;
    const next = db.query("classes", (c) => c.numericLevel === from.numericLevel + 1)[0];
    if (!next) return 0;
    const nextSection = db.query("sections", (s) => s.classId === next.id)[0];
    const students = db.query("students", (s) => s.classId === fromClassId);
    let promoted = 0;
    students.forEach((s) => {
      const card = db.query("reportCards", (r) => r.studentId === s.id)[0];
      if (!card || card.result === "pass") {
        db.update("students", s.id, { classId: next.id, sectionId: nextSection?.id ?? s.sectionId });
        promoted++;
      }
    });
    logActivity("promote", "classes", fromClassId, `Auto-promoted ${promoted} student(s) to ${next.name}`);
    return promoted;
  },

  async issueTC(studentId: string) {
    await latency();
    const s = db.getById("students", studentId);
    if (!s) return null;
    db.update("students", studentId, { status: "inactive" });
    const tmpl = db.query("templates", (t) => t.type === "tc")[0];
    const docGen = db.insert("generatedDocuments", {
      templateId: tmpl?.id ?? "",
      type: "tc",
      subjectType: "student",
      subjectId: studentId,
      dataSnapshot: { name: fullName(s.firstName, s.lastName), admissionNo: s.admissionNo },
      generatedAt: new Date().toISOString(),
      generatedByStaffId: "",
    });
    logActivity("tc", "students", studentId, `Issued transfer certificate for ${fullName(s.firstName, s.lastName)}`);
    await notificationService.quick("Transfer Certificate Issued", "A transfer certificate has been issued.", "member", "general", [studentId]);
    return docGen;
  },

  forSection(sectionId: string) {
    return db.query("students", (s) => s.sectionId === sectionId);
  },
};
