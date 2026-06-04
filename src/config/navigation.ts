import type { NavSection } from "@/types";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  CalendarCheck,
  Wallet,
  BookOpen,
  FlaskConical,
  Bus,
  Trophy,
  Bell,
  MessageSquare,
  Megaphone,
  FileText,
  CalendarDays,
  Inbox,
  ClipboardList,
  Star,
  Trash2,
  Activity,
  Settings,
  School,
  ClipboardCheck,
  Receipt,
  Route,
  ShieldCheck,
  BookMarked,
  Video,
  HeartHandshake,
  NotebookPen,
  Building2,
  Network,
  UserCheck,
  HandCoins,
  Boxes,
  MapPin,
  FileBarChart,
  BarChart3,
  Home,
} from "lucide-react";

/**
 * Role-area navigation. Keyed by AREA string (not role key):
 * class_teacher + subject_teacher → "teacher"; bus_driver + bus_helper → "bus-driver".
 * Every item `to` follows `/app/<area>/<slug>`.
 */
export const NAVIGATION: Record<string, NavSection[]> = {
  // ──────────────────────────────────────────────────────────────────
  // §3 SUPER ADMIN
  // ──────────────────────────────────────────────────────────────────
  "super-admin": [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Overview",
      items: [
        { key: "dashboard", label: "Platform Dashboard", icon: LayoutDashboard, to: "/app/super-admin/dashboard", exact: true },
        { key: "reports", label: "Platform Analytics", icon: BarChart3, to: "/app/super-admin/reports" },
      ],
    },
    {
      groupKey: "nav.group.schools",
      groupLabel: "Schools",
      items: [
        { key: "schools", label: "All Schools", icon: Building2, to: "/app/super-admin/schools", permission: "school.toggle" },
      ],
    },
    {
      groupKey: "nav.group.finance",
      groupLabel: "Finance",
      items: [
        { key: "platform-finance", label: "Revenue & Billing", icon: Wallet, to: "/app/super-admin/platform-finance", permission: "finance.report" },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Operations",
      items: [
        { key: "platform-operations", label: "Platform Operations", icon: Activity, to: "/app/super-admin/platform-operations" },
        { key: "services", label: "Services Registry", icon: Network, to: "/app/super-admin/services", permission: "service.toggle" },
      ],
    },
    {
      groupKey: "nav.group.people",
      groupLabel: "People",
      items: [
        { key: "members", label: "Platform Members", icon: Users, to: "/app/super-admin/members", permission: "member.view" },
      ],
    },
    {
      groupKey: "nav.group.governance",
      groupLabel: "Governance",
      items: [
        { key: "activity", label: "Activity Log", icon: Activity, to: "/app/super-admin/activity", permission: "activity.view", service: "activity" },
        { key: "recycle-bin", label: "Recycle Bin", icon: Trash2, to: "/app/super-admin/recycle-bin", permission: "recyclebin.view", service: "recyclebin" },
      ],
    },
    {
      groupKey: "nav.group.system",
      groupLabel: "System",
      items: [
        { key: "settings", label: "Settings", icon: Settings, to: "/app/super-admin/settings", permission: "settings.manage" },
        { key: "demo-reset", label: "Reset Demo Data", icon: Trash2, to: "/app/super-admin/demo-reset", permission: "demo.reset" },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §4 ADMIN
  // ──────────────────────────────────────────────────────────────────
  admin: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard & Analytics",
          icon: LayoutDashboard,
          to: "/app/admin/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.people",
      groupLabel: "People",
      items: [
        {
          key: "students",
          label: "Students",
          icon: Users,
          to: "/app/admin/students",
          permission: "student.view",
          service: "students",
        },
        {
          key: "admissions",
          label: "Admissions",
          icon: UserCheck,
          to: "/app/admin/admissions",
          permission: "admission.view",
          service: "admissions",
        },
        {
          key: "promotions",
          label: "Promotions",
          icon: GraduationCap,
          to: "/app/admin/promotions",
          permission: "student.promote",
          service: "students",
        },
        {
          key: "transfer-certificates",
          label: "Transfer Certificates",
          icon: FileText,
          to: "/app/admin/transfer-certificates",
          permission: "student.tc",
          service: "documents",
        },
        {
          key: "admission-fields",
          label: "Admission Fields",
          icon: ClipboardList,
          to: "/app/admin/admission-fields",
          permission: "field.manage",
          service: "admissions",
        },
        {
          key: "staff",
          label: "Staff",
          icon: UserCog,
          to: "/app/admin/staff",
          permission: "staff.view",
          service: "staff",
        },
        {
          key: "roles-permissions",
          label: "Roles & Permissions",
          icon: ShieldCheck,
          to: "/app/admin/roles-permissions",
          permission: "role.manage",
        },
        {
          key: "staff-performance",
          label: "Performance Monitoring",
          icon: Star,
          to: "/app/admin/staff-performance",
          permission: "staff.performance",
          service: "staff",
        },
      ],
    },
    {
      groupKey: "nav.group.academics",
      groupLabel: "Academics",
      items: [
        {
          key: "classes",
          label: "Classes & Sections",
          icon: School,
          to: "/app/admin/classes",
          permission: "class.manage",
          service: "academics",
        },
        {
          key: "subjects",
          label: "Subjects & Allocation",
          icon: BookOpen,
          to: "/app/admin/subjects",
          permission: "subject.manage",
          service: "academics",
        },
        {
          key: "timetable",
          label: "Timetable",
          icon: CalendarDays,
          to: "/app/admin/timetable",
          permission: "timetable.manage",
          service: "academics",
        },
        {
          key: "exams",
          label: "Exams & Results",
          icon: GraduationCap,
          to: "/app/admin/exams",
          permission: "exam.manage",
          service: "exams",
        },
        {
          key: "grade-system",
          label: "Grade System",
          icon: ClipboardCheck,
          to: "/app/admin/grade-system",
          permission: "grade.manage",
          service: "exams",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          to: "/app/admin/attendance",
          permission: "attendance.student.view",
          service: "attendance",
        },
        {
          key: "biometric",
          label: "Biometric Sync",
          icon: CalendarCheck,
          to: "/app/admin/biometric",
          permission: "attendance.biometric.import",
          service: "attendance",
        },
      ],
    },
    {
      groupKey: "nav.group.finance",
      groupLabel: "Finance",
      items: [
        {
          key: "fees",
          label: "Fees & Accounts",
          icon: Wallet,
          to: "/app/admin/fees",
          permission: "fee.view",
          service: "fees",
        },
        {
          key: "payroll",
          label: "Salary & Payroll",
          icon: HandCoins,
          to: "/app/admin/payroll",
          permission: "payroll.manage",
          service: "payroll",
        },
        {
          key: "financial-reports",
          label: "Financial Reports",
          icon: FileBarChart,
          to: "/app/admin/financial-reports",
          permission: "finance.report",
          service: "reports",
        },
      ],
    },
    {
      groupKey: "nav.group.resources",
      groupLabel: "Resources",
      items: [
        {
          key: "transport",
          label: "Transport",
          icon: Bus,
          to: "/app/admin/transport",
          permission: "transport.view",
          service: "transport",
        },
        {
          key: "library",
          label: "Library",
          icon: BookOpen,
          to: "/app/admin/library",
          permission: "library.view",
          service: "library",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "notifications",
          label: "Notification Center",
          icon: Bell,
          to: "/app/admin/notifications",
          permission: "notify.send",
          service: "notifications",
        },
        {
          key: "notices",
          label: "Notice Board",
          icon: Megaphone,
          to: "/app/admin/notices",
          permission: "notice.manage",
          service: "notices",
        },
        {
          key: "chat",
          label: "Chat Groups",
          icon: MessageSquare,
          to: "/app/admin/chat",
          permission: "chat.use",
          service: "chat",
        },
        {
          key: "inquiries",
          label: "Inquiries",
          icon: Inbox,
          to: "/app/admin/inquiries",
          permission: "inquiry.view",
          service: "inquiries",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Operations",
      items: [
        {
          key: "records",
          label: "Records",
          icon: ClipboardList,
          to: "/app/admin/records",
          permission: "visitor.manage",
          service: "records",
        },
        {
          key: "feedback",
          label: "Feedback",
          icon: Star,
          to: "/app/admin/feedback",
          permission: "rating.view",
          service: "feedback",
        },
        {
          key: "complaints",
          label: "Complaints",
          icon: Inbox,
          to: "/app/admin/complaints",
          permission: "complaint.view",
          service: "complaints",
        },
      ],
    },
    {
      groupKey: "nav.group.documents",
      groupLabel: "Documents",
      items: [
        {
          key: "documents",
          label: "Documents",
          icon: FileText,
          to: "/app/admin/documents",
          permission: "document.generate",
          service: "documents",
        },
        {
          key: "register-import",
          label: "Register Import",
          icon: FileText,
          to: "/app/admin/register-import",
          permission: "document.import",
          service: "documents",
        },
      ],
    },
    {
      groupKey: "nav.group.governance",
      groupLabel: "Governance",
      items: [
        {
          key: "delete-permissions",
          label: "Delete Permissions",
          icon: ShieldCheck,
          to: "/app/admin/delete-permissions",
          permission: "permission.grant",
        },
        {
          key: "recycle-bin",
          label: "Recycle Bin",
          icon: Trash2,
          to: "/app/admin/recycle-bin",
          permission: "recyclebin.view",
          service: "recyclebin",
        },
        {
          key: "activity",
          label: "Activity Monitor",
          icon: Activity,
          to: "/app/admin/activity",
          permission: "activity.view",
          service: "activity",
        },
      ],
    },
    {
      groupKey: "nav.group.settings",
      groupLabel: "Settings",
      items: [
        {
          key: "school-profile",
          label: "School Profile",
          icon: School,
          to: "/app/admin/school-profile",
          permission: "settings.manage",
        },
        {
          key: "settings",
          label: "Settings",
          icon: Settings,
          to: "/app/admin/settings",
          permission: "settings.manage",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §5 PRINCIPAL
  // ──────────────────────────────────────────────────────────────────
  principal: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/principal/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.people",
      groupLabel: "People",
      items: [
        {
          key: "students",
          label: "Students",
          icon: Users,
          to: "/app/principal/students",
          permission: "student.view",
          service: "students",
        },
        {
          key: "admissions",
          label: "Approve Admissions",
          icon: UserCheck,
          to: "/app/principal/admissions",
          permission: "admission.approve",
          service: "admissions",
        },
        {
          key: "staff",
          label: "Staff",
          icon: UserCog,
          to: "/app/principal/staff",
          permission: "staff.view",
          service: "staff",
        },
        {
          key: "leave",
          label: "Approve Leave",
          icon: NotebookPen,
          to: "/app/principal/leave",
          permission: "leave.decide",
          service: "leave",
        },
        {
          key: "staff-performance",
          label: "Teacher Performance",
          icon: Star,
          to: "/app/principal/staff-performance",
          permission: "staff.performance",
          service: "staff",
        },
      ],
    },
    {
      groupKey: "nav.group.academics",
      groupLabel: "Academics",
      items: [
        {
          key: "timetable",
          label: "Approve Timetable",
          icon: CalendarDays,
          to: "/app/principal/timetable",
          permission: "timetable.manage",
          service: "academics",
        },
        {
          key: "syllabus",
          label: "Syllabus Progress",
          icon: BookMarked,
          to: "/app/principal/syllabus",
          service: "syllabus",
        },
        {
          key: "exams",
          label: "Examinations",
          icon: GraduationCap,
          to: "/app/principal/exams",
          permission: "exam.manage",
          service: "exams",
        },
        {
          key: "results",
          label: "Result Review & Publish",
          icon: ClipboardCheck,
          to: "/app/principal/results",
          permission: "marks.publish",
          service: "exams",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          to: "/app/principal/attendance",
          permission: "attendance.student.view",
          service: "attendance",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "notices",
          label: "Circulars & Notices",
          icon: Megaphone,
          to: "/app/principal/notices",
          permission: "notice.manage",
          service: "notices",
        },
        {
          key: "notifications",
          label: "Message Parents & Staff",
          icon: Bell,
          to: "/app/principal/notifications",
          permission: "notify.send",
          service: "notifications",
        },
        {
          key: "chat",
          label: "Chat Groups",
          icon: MessageSquare,
          to: "/app/principal/chat",
          permission: "chat.use",
          service: "chat",
        },
      ],
    },
    {
      groupKey: "nav.group.engagement",
      groupLabel: "Engagement",
      items: [
        {
          key: "discipline",
          label: "Discipline",
          icon: ShieldCheck,
          to: "/app/principal/discipline",
          permission: "discipline.manage",
          service: "discipline",
        },
        {
          key: "events",
          label: "Events",
          icon: CalendarDays,
          to: "/app/principal/events",
          permission: "event.manage",
          service: "calendar",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Operations",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: FileBarChart,
          to: "/app/principal/reports",
          service: "reports",
        },
        {
          key: "transport",
          label: "Transport",
          icon: Bus,
          to: "/app/principal/transport",
          permission: "transport.track",
          service: "tracking",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §6 ACCOUNTANT
  // ──────────────────────────────────────────────────────────────────
  accountant: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Finance Dashboard",
          icon: LayoutDashboard,
          to: "/app/accountant/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.finance",
      groupLabel: "Finance",
      items: [
        {
          key: "fees",
          label: "Fee Management",
          icon: Wallet,
          to: "/app/accountant/fees",
          permission: "fee.collect",
          service: "fees",
        },
        {
          key: "fee-structure",
          label: "Fee Structure",
          icon: ClipboardList,
          to: "/app/accountant/fee-structure",
          permission: "fee.structure",
          service: "fees",
        },
        {
          key: "dues",
          label: "Dues & Defaulters",
          icon: HandCoins,
          to: "/app/accountant/dues",
          permission: "fee.remind",
          service: "fees",
        },
        {
          key: "payroll",
          label: "Payroll",
          icon: HandCoins,
          to: "/app/accountant/payroll",
          permission: "payroll.manage",
          service: "payroll",
        },
        {
          key: "expenses",
          label: "Expenses",
          icon: Receipt,
          to: "/app/accountant/expenses",
          permission: "expense.manage",
          service: "expenses",
        },
        {
          key: "receipts",
          label: "Receipts & Invoices",
          icon: Receipt,
          to: "/app/accountant/receipts",
          permission: "fee.collect",
          service: "fees",
        },
        {
          key: "reconciliation",
          label: "Reconciliation",
          icon: ClipboardCheck,
          to: "/app/accountant/reconciliation",
          permission: "finance.report",
          service: "fees",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Operations",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: FileBarChart,
          to: "/app/accountant/reports",
          permission: "finance.report",
          service: "reports",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "notifications",
          label: "Fee Reminders",
          icon: Bell,
          to: "/app/accountant/notifications",
          permission: "fee.remind",
          service: "notifications",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §7 RECEPTIONIST
  // ──────────────────────────────────────────────────────────────────
  receptionist: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/receptionist/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Operations",
      items: [
        {
          key: "inquiries",
          label: "Inquiries",
          icon: Inbox,
          to: "/app/receptionist/inquiries",
          permission: "inquiry.view",
          service: "inquiries",
        },
        {
          key: "admissions",
          label: "Admissions Assist",
          icon: UserCheck,
          to: "/app/receptionist/admissions",
          permission: "admission.view",
          service: "admissions",
        },
        {
          key: "visitors",
          label: "Visitor Book",
          icon: ClipboardList,
          to: "/app/receptionist/visitors",
          permission: "visitor.manage",
          service: "records",
        },
        {
          key: "courier",
          label: "Courier / Postal",
          icon: ClipboardList,
          to: "/app/receptionist/courier",
          permission: "courier.manage",
          service: "records",
        },
        {
          key: "appointments",
          label: "Appointments",
          icon: CalendarDays,
          to: "/app/receptionist/appointments",
          permission: "appointment.manage",
          service: "appointments",
        },
        {
          key: "front-desk",
          label: "Front Desk",
          icon: ClipboardList,
          to: "/app/receptionist/front-desk",
          service: "records",
        },
        {
          key: "support",
          label: "Support",
          icon: HeartHandshake,
          to: "/app/receptionist/support",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Reports",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: FileBarChart,
          to: "/app/receptionist/reports",
          service: "reports",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §8 LIBRARIAN
  // ──────────────────────────────────────────────────────────────────
  librarian: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/librarian/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.resources",
      groupLabel: "Resources",
      items: [
        {
          key: "catalog",
          label: "Catalog",
          icon: BookOpen,
          to: "/app/librarian/catalog",
          permission: "library.manage",
          service: "library",
        },
        {
          key: "circulation",
          label: "Circulation",
          icon: BookMarked,
          to: "/app/librarian/circulation",
          permission: "library.circulate",
          service: "library",
        },
        {
          key: "members",
          label: "Members",
          icon: Users,
          to: "/app/librarian/members",
          permission: "library.manage",
          service: "library",
        },
        {
          key: "inventory",
          label: "Inventory",
          icon: Boxes,
          to: "/app/librarian/inventory",
          permission: "library.manage",
          service: "library",
        },
        {
          key: "fines",
          label: "Fines",
          icon: Wallet,
          to: "/app/librarian/fines",
          permission: "library.fine",
          service: "library",
        },
        {
          key: "reservations",
          label: "Reservations",
          icon: BookMarked,
          to: "/app/librarian/reservations",
          permission: "library.reserve",
          service: "library",
        },
        {
          key: "digital-library",
          label: "Digital Library",
          icon: BookOpen,
          to: "/app/librarian/digital-library",
          permission: "library.manage",
          service: "library",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Reports",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: FileBarChart,
          to: "/app/librarian/reports",
          service: "reports",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §9 LAB ASSISTANT
  // ──────────────────────────────────────────────────────────────────
  lab: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/lab/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.resources",
      groupLabel: "Resources",
      items: [
        {
          key: "inventory",
          label: "Inventory",
          icon: Boxes,
          to: "/app/lab/inventory",
          permission: "lab.manage",
          service: "lab",
        },
        {
          key: "issue-return",
          label: "Issue / Return",
          icon: FlaskConical,
          to: "/app/lab/issue-return",
          permission: "lab.issue",
          service: "lab",
        },
        {
          key: "practicals",
          label: "Practicals",
          icon: ClipboardList,
          to: "/app/lab/practicals",
          permission: "lab.view",
          service: "lab",
        },
        {
          key: "maintenance",
          label: "Maintenance & Safety",
          icon: ShieldCheck,
          to: "/app/lab/maintenance",
          permission: "lab.maintenance",
          service: "lab",
        },
        {
          key: "bookings",
          label: "Bookings",
          icon: CalendarDays,
          to: "/app/lab/bookings",
          permission: "lab.booking",
          service: "lab",
        },
        {
          key: "digital-resources",
          label: "Digital Resources",
          icon: FileText,
          to: "/app/lab/digital-resources",
          permission: "lab.manage",
          service: "lab",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Reports",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: FileBarChart,
          to: "/app/lab/reports",
          service: "reports",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §10 EXAMINER
  // ──────────────────────────────────────────────────────────────────
  examiner: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/examiner/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.academics",
      groupLabel: "Academics",
      items: [
        {
          key: "papers",
          label: "Papers",
          icon: FileText,
          to: "/app/examiner/papers",
          permission: "exam.manage",
          service: "exams",
        },
        {
          key: "evaluation",
          label: "Evaluation",
          icon: GraduationCap,
          to: "/app/examiner/evaluation",
          permission: "marks.enter",
          service: "exams",
        },
        {
          key: "verification",
          label: "Verification",
          icon: ClipboardCheck,
          to: "/app/examiner/verification",
          permission: "marks.verify",
          service: "exams",
        },
        {
          key: "exam-duty",
          label: "Exam Duty",
          icon: ClipboardList,
          to: "/app/examiner/exam-duty",
          permission: "exam.manage",
          service: "exams",
        },
        {
          key: "result-support",
          label: "Result Support",
          icon: GraduationCap,
          to: "/app/examiner/result-support",
          permission: "marks.view",
          service: "exams",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Reports",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: FileBarChart,
          to: "/app/examiner/reports",
          service: "reports",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §11 SPORTS COACH
  // ──────────────────────────────────────────────────────────────────
  sports: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/sports/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.engagement",
      groupLabel: "Engagement",
      items: [
        {
          key: "activities",
          label: "Activities",
          icon: Trophy,
          to: "/app/sports/activities",
          permission: "sports.manage",
          service: "sports",
        },
        {
          key: "teams",
          label: "Teams & Players",
          icon: Users,
          to: "/app/sports/teams",
          permission: "sports.manage",
          service: "sports",
        },
        {
          key: "training",
          label: "Training",
          icon: CalendarDays,
          to: "/app/sports/training",
          permission: "sports.manage",
          service: "sports",
        },
        {
          key: "events",
          label: "Events",
          icon: Trophy,
          to: "/app/sports/events",
          permission: "sports.event",
          service: "sports",
        },
        {
          key: "performance",
          label: "Performance",
          icon: Star,
          to: "/app/sports/performance",
          permission: "sports.view",
          service: "sports",
        },
        {
          key: "equipment",
          label: "Equipment & Ground",
          icon: Boxes,
          to: "/app/sports/equipment",
          permission: "sports.manage",
          service: "sports",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          to: "/app/sports/attendance",
          permission: "sports.attendance",
          service: "sports",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "notifications",
          label: "Communication",
          icon: Bell,
          to: "/app/sports/notifications",
          permission: "notify.send",
          service: "notifications",
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Reports",
      items: [
        {
          key: "reports",
          label: "Reports & Certificates",
          icon: FileBarChart,
          to: "/app/sports/reports",
          service: "reports",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §12 TEACHER (class_teacher + subject_teacher)
  // ──────────────────────────────────────────────────────────────────
  teacher: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/teacher/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.academics",
      groupLabel: "Academics",
      items: [
        {
          key: "my-class",
          label: "My Class",
          icon: School,
          to: "/app/teacher/my-class",
          permission: "student.view",
          service: "students",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          to: "/app/teacher/attendance",
          permission: "attendance.student.mark",
          service: "attendance",
        },
        {
          key: "homework",
          label: "Homework & Classwork",
          icon: ClipboardCheck,
          to: "/app/teacher/homework",
          permission: "homework.manage",
          service: "homework",
        },
        {
          key: "classroom",
          label: "Classroom Activities",
          icon: BookOpen,
          to: "/app/teacher/classroom",
          permission: "classroom.post",
          service: "learning",
        },
        {
          key: "marks",
          label: "Marks & Results",
          icon: GraduationCap,
          to: "/app/teacher/marks",
          permission: "marks.enter",
          service: "exams",
        },
        {
          key: "scheduling",
          label: "Scheduling",
          icon: CalendarDays,
          to: "/app/teacher/scheduling",
          permission: "timetable.manage",
          service: "academics",
        },
      ],
    },
    {
      groupKey: "nav.group.engagement",
      groupLabel: "Engagement",
      items: [
        {
          key: "behavior",
          label: "Behavior",
          icon: ShieldCheck,
          to: "/app/teacher/behavior",
          permission: "discipline.manage",
          service: "discipline",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "notifications",
          label: "Communication",
          icon: Bell,
          to: "/app/teacher/notifications",
          permission: "notify.send",
          service: "notifications",
        },
        {
          key: "chat",
          label: "Class Chat Groups",
          icon: MessageSquare,
          to: "/app/teacher/chat",
          permission: "chat.use",
          service: "chat",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §13 BUS DRIVER (bus_driver + bus_helper)
  // ──────────────────────────────────────────────────────────────────
  "bus-driver": [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/bus-driver/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.operations",
      groupLabel: "Operations",
      items: [
        {
          key: "route-trip",
          label: "Route & Trip",
          icon: Route,
          to: "/app/bus-driver/route-trip",
          permission: "transport.trip",
          service: "transport",
        },
        {
          key: "pickup-drop",
          label: "Pickup & Drop",
          icon: MapPin,
          to: "/app/bus-driver/pickup-drop",
          permission: "transport.trip",
          service: "transport",
        },
        {
          key: "tracking",
          label: "Live Tracking",
          icon: MapPin,
          to: "/app/bus-driver/tracking",
          permission: "transport.track",
          service: "tracking",
        },
        {
          key: "incidents",
          label: "Incidents & Safety",
          icon: ShieldCheck,
          to: "/app/bus-driver/incidents",
          permission: "transport.incident",
          service: "transport",
        },
        {
          key: "vehicle",
          label: "Vehicle",
          icon: Bus,
          to: "/app/bus-driver/vehicle",
          permission: "transport.checklist",
          service: "transport",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "notifications",
          label: "Communication",
          icon: Bell,
          to: "/app/bus-driver/notifications",
          permission: "notify.send",
          service: "notifications",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §14 OTHER STAFF
  // ──────────────────────────────────────────────────────────────────
  staff: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/app/staff/dashboard",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.people",
      groupLabel: "People",
      items: [
        {
          key: "profile",
          label: "Profile",
          icon: UserCog,
          to: "/app/staff/profile",
          service: "staff",
        },
      ],
    },
    {
      groupKey: "nav.group.engagement",
      groupLabel: "Engagement",
      items: [
        {
          key: "leave",
          label: "Leave",
          icon: NotebookPen,
          to: "/app/staff/leave",
          permission: "leave.apply",
          service: "leave",
        },
        {
          key: "expenses",
          label: "Expenses",
          icon: Receipt,
          to: "/app/staff/expenses",
          permission: "expense.reimburse",
          service: "expenses",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "notifications",
          label: "Communication",
          icon: Bell,
          to: "/app/staff/notifications",
          service: "notifications",
        },
        {
          key: "chat",
          label: "Chat",
          icon: MessageSquare,
          to: "/app/staff/chat",
          permission: "chat.use",
          service: "chat",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §15 PARENT
  // ──────────────────────────────────────────────────────────────────
  parent: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "home",
          label: "Home",
          icon: Home,
          to: "/app/parent/home",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.academics",
      groupLabel: "Academics",
      items: [
        {
          key: "child-profile",
          label: "Child Profile",
          icon: Users,
          to: "/app/parent/child-profile",
          permission: "student.view",
          service: "students",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          to: "/app/parent/attendance",
          permission: "attendance.student.view",
          service: "attendance",
        },
        {
          key: "homework",
          label: "Homework",
          icon: ClipboardCheck,
          to: "/app/parent/homework",
          service: "homework",
        },
        {
          key: "exams",
          label: "Exams & Results",
          icon: GraduationCap,
          to: "/app/parent/exams",
          permission: "marks.view",
          service: "exams",
        },
        {
          key: "syllabus",
          label: "Syllabus",
          icon: BookMarked,
          to: "/app/parent/syllabus",
          service: "syllabus",
        },
      ],
    },
    {
      groupKey: "nav.group.finance",
      groupLabel: "Finance",
      items: [
        {
          key: "fees",
          label: "Fees",
          icon: Wallet,
          to: "/app/parent/fees",
          permission: "fee.view",
          service: "fees",
        },
      ],
    },
    {
      groupKey: "nav.group.resources",
      groupLabel: "Resources",
      items: [
        {
          key: "transport",
          label: "Transport",
          icon: Bus,
          to: "/app/parent/transport",
          permission: "transport.track",
          service: "tracking",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "communication",
          label: "Communication",
          icon: MessageSquare,
          to: "/app/parent/communication",
          permission: "chat.use",
          service: "chat",
        },
      ],
    },
    {
      groupKey: "nav.group.engagement",
      groupLabel: "Engagement",
      items: [
        {
          key: "leave",
          label: "Leave",
          icon: NotebookPen,
          to: "/app/parent/leave",
          permission: "leave.apply",
          service: "leave",
        },
        {
          key: "events",
          label: "Events & Activities",
          icon: CalendarDays,
          to: "/app/parent/events",
          service: "calendar",
        },
        {
          key: "school",
          label: "School",
          icon: School,
          to: "/app/parent/school",
          service: "calendar",
        },
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────
  // §16 STUDENT
  // ──────────────────────────────────────────────────────────────────
  student: [
    {
      groupKey: "nav.group.dashboard",
      groupLabel: "Dashboard",
      items: [
        {
          key: "home",
          label: "Home",
          icon: Home,
          to: "/app/student/home",
          exact: true,
        },
      ],
    },
    {
      groupKey: "nav.group.academics",
      groupLabel: "Academics",
      items: [
        {
          key: "profile",
          label: "Profile",
          icon: Users,
          to: "/app/student/profile",
          permission: "student.view",
          service: "students",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          to: "/app/student/attendance",
          permission: "attendance.student.view",
          service: "attendance",
        },
        {
          key: "homework",
          label: "Homework",
          icon: ClipboardCheck,
          to: "/app/student/homework",
          permission: "homework.submit",
          service: "homework",
        },
        {
          key: "learning",
          label: "Online Learning",
          icon: Video,
          to: "/app/student/learning",
          permission: "liveclass.join",
          service: "learning",
        },
        {
          key: "exams",
          label: "Exams & Results",
          icon: GraduationCap,
          to: "/app/student/exams",
          permission: "marks.view",
          service: "exams",
        },
        {
          key: "teachers",
          label: "Teachers",
          icon: UserCog,
          to: "/app/student/teachers",
          permission: "staff.view",
          service: "staff",
        },
        {
          key: "syllabus",
          label: "Syllabus",
          icon: BookMarked,
          to: "/app/student/syllabus",
          service: "syllabus",
        },
      ],
    },
    {
      groupKey: "nav.group.finance",
      groupLabel: "Finance",
      items: [
        {
          key: "fees",
          label: "Fees",
          icon: Wallet,
          to: "/app/student/fees",
          permission: "fee.view",
          service: "fees",
        },
      ],
    },
    {
      groupKey: "nav.group.resources",
      groupLabel: "Resources",
      items: [
        {
          key: "library",
          label: "Library",
          icon: BookOpen,
          to: "/app/student/library",
          permission: "library.view",
          service: "library",
        },
        {
          key: "transport",
          label: "Transport",
          icon: Bus,
          to: "/app/student/transport",
          permission: "transport.track",
          service: "tracking",
        },
      ],
    },
    {
      groupKey: "nav.group.communication",
      groupLabel: "Communication",
      items: [
        {
          key: "communication",
          label: "Communication",
          icon: Megaphone,
          to: "/app/student/communication",
          service: "notices",
        },
      ],
    },
    {
      groupKey: "nav.group.engagement",
      groupLabel: "Engagement",
      items: [
        {
          key: "leave",
          label: "Leave",
          icon: NotebookPen,
          to: "/app/student/leave",
          permission: "leave.apply",
          service: "leave",
        },
        {
          key: "feedback",
          label: "Feedback",
          icon: Star,
          to: "/app/student/feedback",
          permission: "rating.give",
          service: "feedback",
        },
      ],
    },
  ],
};
