import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO } from "@/lib/clock";
import { humanId } from "@/lib/id";
import { logActivity } from "@/lib/activity";
import { DEMO_PASSWORD, DEMO_PIN } from "@/data/seed/reference";
import { notificationService } from "./notificationService";
import type { Inquiry } from "@/types";

export const admissionService = {
  async reply(inquiryId: string, reply: string, repliedByStaffId: string) {
    await latency();
    db.update("inquiries", inquiryId, { reply, status: "replied", repliedByStaffId, repliedAt: nowISO() });
    logActivity("reply", "inquiries", inquiryId, "Replied to an inquiry");
  },

  /** Approve an inquiry → create a Student + login + Guardian + welcome notice. */
  async approve(inquiry: Inquiry, classId: string, sectionId: string): Promise<string> {
    await latency(250, 600);
    const [firstName, ...rest] = inquiry.name.split(" ");
    const lastName = rest.join(" ") || "Student";
    const cls = db.getById("classes", classId);
    const student = db.insert("students", {
      admissionNo: humanId.admission(),
      rollNo: humanId.roll((cls?.numericLevel ?? 0) + 1, db.query("students", (s) => s.sectionId === sectionId).length + 1),
      firstName,
      lastName,
      gender: "other",
      dob: "2012-01-01",
      classId,
      sectionId,
      academicYearId: db.query("academicYears", (a) => a.isCurrent)[0]?.id ?? "",
      admissionDate: nowISO().slice(0, 10),
      status: "active",
      customIds: [],
      guardianIds: [],
      previousMarksheetIds: [],
      extra: {},
    });
    const guardian = db.insert("guardians", {
      firstName: "Parent",
      lastName,
      relation: "guardian",
      phone: inquiry.phone,
      email: inquiry.email,
      studentIds: [student.id],
    });
    db.update("students", student.id, { guardianIds: [guardian.id] });
    db.insert("users", {
      username: inquiry.phone.replace(/\D/g, "").slice(-10),
      phone: inquiry.phone,
      email: inquiry.email,
      passwordHash: DEMO_PASSWORD,
      roleKey: "parent",
      linkedProfileType: "guardian",
      linkedProfileId: guardian.id,
      status: "active",
      pinHash: DEMO_PIN,
      languagePref: "en",
    });
    db.update("inquiries", inquiry.id, { status: "closed", reply: "Admission approved." });
    logActivity("approve", "students", student.id, `Approved admission: ${inquiry.name}`);
    await notificationService.quick("Admission Approved", `Welcome! ${firstName}'s admission is confirmed.`, "member", "general", [guardian.id]);
    return student.id;
  },

  async reject(inquiryId: string, reason: string) {
    await latency();
    db.update("inquiries", inquiryId, { status: "closed", reply: `Not approved: ${reason}` });
    logActivity("reject", "inquiries", inquiryId, "Rejected an admission inquiry");
  },
};
