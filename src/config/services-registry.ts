/**
 * Canonical registry of toggleable "services" (features Super Admin / Admin can
 * Hide/Unhide and Activate/Deactivate). Every nav item references one of these keys,
 * so a toggle here removes the item from sidebars + 403s its route + greys its actions.
 */
export interface ServiceModuleDef {
  key: string;
  label: string;
  group: string;
}

export const SERVICE_MODULES: ServiceModuleDef[] = [
  { key: "students", label: "Students", group: "Academics" },
  { key: "admissions", label: "Admissions & Inquiries", group: "Academics" },
  { key: "staff", label: "Staff & Members", group: "People" },
  { key: "academics", label: "Classes, Subjects & Timetable", group: "Academics" },
  { key: "attendance", label: "Attendance", group: "Academics" },
  { key: "exams", label: "Exams, Marks & Results", group: "Academics" },
  { key: "homework", label: "Homework & Classwork", group: "Academics" },
  { key: "learning", label: "Online Learning & Quizzes", group: "Academics" },
  { key: "syllabus", label: "Syllabus Reader", group: "Academics" },
  { key: "fees", label: "Fees & Accounting", group: "Finance" },
  { key: "payroll", label: "Payroll & Salaries", group: "Finance" },
  { key: "expenses", label: "Expenses & Reimbursements", group: "Finance" },
  { key: "library", label: "Library", group: "Resources" },
  { key: "lab", label: "Laboratory", group: "Resources" },
  { key: "sports", label: "Sports & Activities", group: "Resources" },
  { key: "transport", label: "Transport", group: "Operations" },
  { key: "tracking", label: "Live Bus Tracking", group: "Operations" },
  { key: "notifications", label: "Notification Center", group: "Communication" },
  { key: "chat", label: "Chat & Groups", group: "Communication" },
  { key: "notices", label: "Notice Board & Circulars", group: "Communication" },
  { key: "inquiries", label: "Inquiries", group: "Communication" },
  { key: "records", label: "Visitor & Courier Records", group: "Operations" },
  { key: "complaints", label: "Complaints & Requests", group: "Communication" },
  { key: "feedback", label: "Ratings & Feedback", group: "Engagement" },
  { key: "documents", label: "Documents & Templates", group: "Documents" },
  { key: "leave", label: "Leave Management", group: "People" },
  { key: "calendar", label: "Calendar & Events", group: "Engagement" },
  { key: "livevideo", label: "Live Video", group: "Communication" },
  { key: "prayer", label: "School Prayer", group: "Engagement" },
  { key: "appointments", label: "Appointments", group: "Operations" },
  { key: "discipline", label: "Discipline", group: "People" },
  { key: "reports", label: "Reports & Analytics", group: "Governance" },
  { key: "recyclebin", label: "Recycle Bin", group: "Governance" },
  { key: "activity", label: "Activity Monitor", group: "Governance" },
];

export const SERVICE_KEYS = SERVICE_MODULES.map((s) => s.key);
