import {
  PERMISSION_KEYS,
  ROLE_KEYS,
  type PermissionKey,
  type RoleKey,
} from "@/types";

/** Where each role lands after login. */
export const ROLE_BASE_ROUTE: Record<RoleKey, string> = {
  super_admin: "/app/super-admin/dashboard",
  admin: "/app/admin/dashboard",
  principal: "/app/principal/dashboard",
  accountant: "/app/accountant/dashboard",
  receptionist: "/app/receptionist/dashboard",
  librarian: "/app/librarian/dashboard",
  lab_assistant: "/app/lab/dashboard",
  examiner: "/app/examiner/dashboard",
  sports_coach: "/app/sports/dashboard",
  class_teacher: "/app/teacher/dashboard",
  subject_teacher: "/app/teacher/dashboard",
  bus_driver: "/app/bus-driver/dashboard",
  bus_helper: "/app/bus-driver/dashboard",
  other_staff: "/app/staff/dashboard",
  parent: "/app/parent/home",
  student: "/app/student/home",
};

/** Which feature-folder owns each role (drives lazy code-split + nav lookup). */
export const ROLE_AREA: Record<RoleKey, string> = {
  super_admin: "super-admin",
  admin: "admin",
  principal: "principal",
  accountant: "accountant",
  receptionist: "receptionist",
  librarian: "librarian",
  lab_assistant: "lab",
  examiner: "examiner",
  sports_coach: "sports",
  class_teacher: "teacher",
  subject_teacher: "teacher",
  bus_driver: "bus-driver",
  bus_helper: "bus-driver",
  other_staff: "staff",
  parent: "parent",
  student: "student",
};

const ALL: PermissionKey[] = [...PERMISSION_KEYS];

// Capabilities reserved to Super Admin only (Admin gets everything else).
const SUPER_ONLY: PermissionKey[] = ["school.toggle", "demo.reset"];

const ALLOW: Record<RoleKey, PermissionKey[] | "*"> = {
  super_admin: "*",
  admin: ALL.filter((p) => !SUPER_ONLY.includes(p)),

  principal: [
    "member.view", "student.view", "student.tc", "admission.view", "admission.approve",
    "staff.view", "staff.performance", "class.manage", "subject.manage", "timetable.manage",
    "exam.manage", "grade.manage", "marks.view", "marks.publish",
    "attendance.student.view", "attendance.student.editLate", "attendance.staff.view",
    "notify.send", "notice.manage", "chat.use", "chat.group.create",
    "inquiry.view", "complaint.view", "document.view", "document.generate", "template.manage",
    "leave.decide", "event.manage", "discipline.manage",
    "transport.view", "transport.track", "transport.speedlimit",
    "fee.view", "finance.report", "activity.view", "recyclebin.view", "visitor.manage", "courier.manage",
  ],

  accountant: [
    "fee.view", "fee.structure", "fee.collect", "fee.concession", "fee.refund", "fee.remind",
    "expense.manage", "expense.reimburse", "payroll.manage", "finance.report",
    "student.view", "notify.send", "document.view", "document.generate", "chat.use",
    "courier.manage",
  ],

  receptionist: [
    "inquiry.view", "inquiry.reply", "visitor.manage", "courier.manage", "appointment.manage",
    "admission.view", "complaint.view", "student.view", "document.view", "chat.use", "notify.send",
  ],

  librarian: [
    "library.view", "library.manage", "library.circulate", "library.fine", "library.reserve",
    "member.view", "student.view", "notify.send", "document.view", "chat.use",
  ],

  lab_assistant: [
    "lab.view", "lab.manage", "lab.issue", "lab.booking", "lab.maintenance",
    "student.view", "notify.send", "document.view", "chat.use",
  ],

  examiner: [
    "exam.manage", "marks.enter", "marks.verify", "marks.view",
    "student.view", "document.view", "chat.use",
  ],

  sports_coach: [
    "sports.view", "sports.manage", "sports.attendance", "sports.event",
    "student.view", "notify.send", "document.generate", "chat.use", "chat.group.create",
  ],

  class_teacher: [
    "student.view", "student.promote",
    "attendance.student.view", "attendance.student.mark", "attendance.student.editLate",
    "marks.enter", "marks.verify", "marks.approve", "marks.publish", "marks.view",
    "homework.manage", "classroom.post", "learning.manage", "quiz.manage", "liveclass.host",
    "document.view", "document.generate", "notify.send", "notice.manage",
    "chat.use", "chat.group.create", "leave.decide", "discipline.manage", "exam.manage",
  ],

  subject_teacher: [
    "student.view", "attendance.student.view",
    "marks.enter", "marks.view", "homework.manage", "classroom.post", "learning.manage",
    "quiz.manage", "liveclass.host", "document.view", "notify.send", "chat.use", "chat.group.create",
  ],

  bus_driver: [
    "transport.view", "transport.track", "transport.trip", "transport.incident", "transport.checklist",
    "student.view", "chat.use",
  ],

  bus_helper: ["transport.view", "transport.trip", "student.view", "chat.use"],

  other_staff: ["leave.apply", "expense.reimburse", "chat.use", "document.view"],

  parent: [
    "student.view", "fee.view", "leave.apply", "chat.use", "complaint.submit",
    "transport.view", "transport.track", "document.view", "liveclass.join",
  ],

  student: [
    "student.view", "homework.submit", "quiz.attempt", "leave.apply", "rating.give",
    "library.view", "library.reserve", "transport.view", "transport.track",
    "liveclass.join", "chat.use", "document.view", "complaint.submit",
  ],
};

/** Static base matrix: role → permission → allowed. Runtime grants layer on top. */
export const ROLE_PERMISSIONS: Record<RoleKey, Record<PermissionKey, boolean>> = (() => {
  const out = {} as Record<RoleKey, Record<PermissionKey, boolean>>;
  for (const role of ROLE_KEYS) {
    const allow = ALLOW[role];
    const map = {} as Record<PermissionKey, boolean>;
    for (const p of PERMISSION_KEYS) {
      map[p] = allow === "*" ? true : allow.includes(p);
    }
    out[role] = map;
  }
  return out;
})();

export function staticHasPermission(role: RoleKey, key: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.[key] ?? false;
}
