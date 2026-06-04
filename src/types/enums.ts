/** Single source of truth for cross-domain enums (06_DATA_MODEL §16). */

export const ROLE_KEYS = [
  "super_admin",
  "admin",
  "principal",
  "accountant",
  "receptionist",
  "librarian",
  "lab_assistant",
  "examiner",
  "sports_coach",
  "class_teacher",
  "subject_teacher",
  "bus_driver",
  "bus_helper",
  "other_staff",
  "parent",
  "student",
] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

/** Roles that have a staff record (everyone except parent/student). */
export const STAFF_ROLE_KEYS: RoleKey[] = [
  "super_admin",
  "admin",
  "principal",
  "accountant",
  "receptionist",
  "librarian",
  "lab_assistant",
  "examiner",
  "sports_coach",
  "class_teacher",
  "subject_teacher",
  "bus_driver",
  "bus_helper",
  "other_staff",
];

export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "leave";
export type FeeStatus = "paid" | "partial" | "due" | "overdue";
export type PaymentMode = "cash" | "card" | "upi" | "netbanking" | "cheque" | "online";
export type ExamStatus = "planned" | "ongoing" | "completed" | "published";
export type MarkStage = "entered" | "verified" | "approved" | "published";
export type LoanStatus = "issued" | "returned" | "overdue" | "lost";
export type TripStatus = "scheduled" | "started" | "completed";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type NotificationChannel = "whatsapp" | "sms" | "email" | "push";
export type Audience =
  | "all"
  | "teachers"
  | "employees"
  | "parents"
  | "students"
  | "class"
  | "role"
  | "member";
export type TemplateType =
  | "marksheet"
  | "admitcard"
  | "idcard"
  | "timetable"
  | "receipt"
  | "tc"
  | "certificate";
export type UserStatus = "active" | "inactive";
export type Language = "en" | "hi";
export type Theme = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type StudentStatus = "active" | "inactive" | "alumni";
export type ResultStatus = "pass" | "fail" | "compartment";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Display labels for roles (English; Hindi via i18n key role.<key>). */
export const ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  principal: "Principal",
  accountant: "Accountant",
  receptionist: "Receptionist",
  librarian: "Librarian",
  lab_assistant: "Lab Assistant",
  examiner: "Examiner",
  sports_coach: "Sports Coach",
  class_teacher: "Class Teacher",
  subject_teacher: "Subject Teacher",
  bus_driver: "Bus Driver",
  bus_helper: "Bus Helper",
  other_staff: "Other Staff",
  parent: "Parent",
  student: "Student",
};
