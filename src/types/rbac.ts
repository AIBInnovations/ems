import type { RoleKey } from "./enums";

/**
 * Permission catalog (the allow/deny matrix is keyed off these). Format `<domain>.<action>`.
 * `delete.execute` is the universal PIN-gated delete capability; per-entity grants layer on top.
 */
export const PERMISSION_KEYS = [
  // members / users / roles
  "member.view", "member.create", "member.edit", "member.activate", "member.hide",
  "role.manage", "permission.grant",
  // students & admissions
  "student.view", "student.create", "student.edit", "student.promote", "student.tc",
  "admission.view", "admission.approve",
  // staff
  "staff.view", "staff.create", "staff.edit", "staff.performance",
  // academics
  "class.manage", "subject.manage", "timetable.manage", "exam.manage", "grade.manage",
  // attendance
  "attendance.student.view", "attendance.student.mark", "attendance.student.editLate",
  "attendance.staff.view", "attendance.staff.mark", "attendance.biometric.import",
  // marks & results
  "marks.enter", "marks.verify", "marks.approve", "marks.publish", "marks.view",
  // homework & learning
  "homework.manage", "homework.submit", "learning.manage", "quiz.manage", "quiz.attempt",
  "classroom.post", "liveclass.host", "liveclass.join",
  // fees & accounting
  "fee.view", "fee.structure", "fee.collect", "fee.concession", "fee.refund",
  "expense.manage", "expense.reimburse", "payroll.manage", "finance.report", "fee.remind",
  // library
  "library.view", "library.manage", "library.circulate", "library.fine", "library.reserve",
  // lab
  "lab.view", "lab.manage", "lab.issue", "lab.booking", "lab.maintenance",
  // sports
  "sports.view", "sports.manage", "sports.attendance", "sports.event",
  // transport
  "transport.view", "transport.manage", "transport.track", "transport.trip", "transport.incident", "transport.checklist", "transport.speedlimit",
  // communication
  "notify.send", "notice.manage", "chat.use", "chat.group.create",
  "inquiry.view", "inquiry.reply", "complaint.view", "complaint.submit",
  "visitor.manage", "courier.manage", "appointment.manage",
  // documents
  "document.view", "document.generate", "template.manage", "document.import",
  // engagement & feedback
  "rating.give", "rating.view", "leave.apply", "leave.decide", "event.manage", "discipline.manage",
  // system / governance
  "settings.manage", "service.toggle", "school.toggle", "activity.view",
  "recyclebin.view", "delete.execute", "demo.reset", "highlight.manage", "prayer.manage", "servicecharge.manage", "field.manage",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export interface AuthContext {
  userId: string;
  name: string;
  role: RoleKey;
  userActive: boolean;
  schoolActive: boolean;
}

export interface AccessQuery {
  permission?: PermissionKey;
  service?: string;
  /** Per-entity delete grant, e.g. "student" → checks delete.<entity> grant for Principal. */
  deleteEntity?: string;
}
