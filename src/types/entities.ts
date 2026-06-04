/**
 * Entity definitions (06_DATA_MODEL). Field types are TypeScript-flavored;
 * zod schemas for the editable subset live alongside each ResourceConfig.
 */
import type {
  Audience,
  AttendanceStatus,
  Density,
  ExamStatus,
  FeeStatus,
  Language,
  LeaveStatus,
  LoanStatus,
  MarkStage,
  NotificationChannel,
  PaymentMode,
  ResultStatus,
  RoleKey,
  StudentStatus,
  TemplateType,
  Theme,
  TripStatus,
  UserStatus,
} from "./enums";

export interface Base {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type Extra = Record<string, string | number | boolean | null>;
export interface CustomId {
  label: string;
  value: string;
}
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  x?: string;
  whatsapp?: string;
  linkedin?: string;
}

/* ───────────────────────── 1. Identity, access & system ───────────────────────── */

export interface School extends Base {
  name: string;
  logoUrl?: string;
  diseCode: string;
  licenseNo: string;
  affiliationNo?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  socialLinks: SocialLinks;
  principalName: string;
  establishedYear: number;
  sessionStartMonth: number;
  defaultLanguage: Language;
  isActive: boolean;
  // ── platform / multi-school fields (Super Admin portfolio) ──
  isPrimary?: boolean; // the fully-built, drillable school
  region?: string;
  plan?: "basic" | "standard" | "premium" | "enterprise";
  subscriptionAmount?: number; // annual platform fee
  subscriptionStatus?: "active" | "overdue" | "trial";
  nextBillingDate?: string;
  onboardedAt?: string;
  /** Summary metrics for non-primary schools (primary computes these live). */
  metrics?: { students: number; staff: number; monthlyRevenue: number; attendancePct: number };
}

export interface ServiceModule extends Base {
  key: string;
  label: string;
  group: string;
  isEnabled: boolean;
  isVisible: boolean;
  requiredRoles: RoleKey[];
}

export interface RolePermission extends Base {
  roleKey: RoleKey;
  permissionKey: string;
  allowed: boolean;
}

export interface User extends Base {
  username: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  roleKey: RoleKey;
  linkedProfileType: "student" | "staff" | "guardian" | null;
  linkedProfileId: string | null;
  status: UserStatus;
  pinHash: string;
  avatarUrl?: string;
  languagePref: Language;
  lastLoginAt?: string | null;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  density: Density;
  tablePageSize: number;
  uploadLimitsMB: { image: number; pdf: number; audio: number; video: number };
  sidebarCollapsed: boolean;
}

/* ───────────────────────── 2. People ───────────────────────── */

export interface Student extends Base {
  admissionNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dob: string;
  photoUrl?: string;
  bloodGroup?: string;
  classId: string;
  sectionId: string;
  academicYearId: string;
  admissionDate: string;
  status: StudentStatus;
  house?: string;
  category?: string;
  religion?: string;
  motherTongue?: string;
  nationality?: string;
  // identity IDs
  ssmid?: string;
  samagraId?: string;
  scholarNo?: string;
  apaarId?: string;
  aadhaarMasked?: string;
  penNo?: string;
  customIds: CustomId[];
  // contact
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  // relations
  guardianIds: string[];
  transportRouteId?: string | null;
  feeAssignmentId?: string | null;
  previousMarksheetIds: string[];
  extra: Extra;
}

export interface Guardian extends Base {
  firstName: string;
  lastName: string;
  relation: "father" | "mother" | "guardian";
  phone: string;
  altPhone?: string;
  email?: string;
  occupation?: string;
  photoUrl?: string;
  address?: string;
  studentIds: string[];
}

export interface StaffMember extends Base {
  employeeId: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dob?: string;
  photoUrl?: string;
  roleKey: RoleKey;
  department?: string;
  designation?: string;
  qualifications: string[];
  joiningDate: string;
  status: UserStatus;
  contact: { phone?: string; email?: string; address?: string };
  salaryStructureId?: string | null;
  bankInfo?: { accountMasked?: string; ifsc?: string };
  rating?: number;
  // teaching
  subjectsTaught?: string[];
  classTeacherOf?: { classId: string; sectionId: string } | null;
  periodsPerWeek?: number;
  // driver
  licenseNo?: string;
  licenseExpiry?: string;
  assignedVehicleId?: string | null;
  assignedRouteId?: string | null;
  // coach
  activityIds?: string[];
  extra: Extra;
}

export interface Document extends Base {
  ownerType: "student" | "staff" | "guardian" | "school" | "other";
  ownerId: string;
  kind: "photo" | "certificate" | "bill" | "id" | "other";
  label: string;
  fileName: string;
  mimeType: string;
  sizeMB: number;
  blobKey?: string; // IndexedDB key, never inline bytes
  uploadedBy: string;
}

/* ───────────────────────── 3. Academic structure ───────────────────────── */

export interface AcademicYear extends Base {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}
export interface Class extends Base {
  name: string;
  numericLevel: number;
  academicYearId: string;
  classTeacherStaffId?: string | null;
  sectionIds: string[];
  subjectIds: string[];
}
export interface Section extends Base {
  classId: string;
  name: string;
  capacity: number;
  classTeacherStaffId?: string | null;
  roomNo?: string;
}
export interface Subject extends Base {
  name: string;
  code: string;
  type: "core" | "elective" | "practical" | "activity";
  classIds: string[];
  hasPractical: boolean;
  maxMarks: number;
  passMarks: number;
}
export interface ClassSubjectTeacher extends Base {
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherStaffId: string;
  academicYearId: string;
}
export interface TimetablePeriod extends Base {
  classId: string;
  sectionId: string;
  dayOfWeek: number;
  periodNo: number;
  startTime: string;
  endTime: string;
  subjectId?: string;
  teacherStaffId?: string;
  room?: string;
  type: "period" | "break" | "assembly" | "games";
}
export interface BellSchedule extends Base {
  classId?: string;
  periods: { periodNo: number; startTime: string; endTime: string; label: string }[];
  bellSoundUrl?: string;
  enabled: boolean;
}
export interface ExtraClass extends Base {
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherStaffId: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  notifyParents: boolean;
  notifyStudents: boolean;
  createdBy: string;
}

/* ───────────────────────── 4. Attendance ───────────────────────── */

export interface StudentAttendance extends Base {
  studentId: string;
  classId: string;
  sectionId: string;
  date: string;
  status: AttendanceStatus;
  markedByStaffId: string;
  markedAt: string;
  source: "manual" | "import" | "biometric";
  note?: string;
}
export interface StaffAttendance extends Base {
  staffId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workedHours?: number;
  source: "manual" | "biometric";
  payrollImpact?: boolean;
}
export interface BiometricPunch extends Base {
  deviceId: string;
  personType: "student" | "staff";
  personId: string;
  timestamp: string;
  direction: "in" | "out";
  importedBatchId: string;
}
export interface TransportAttendance extends Base {
  tripId: string;
  studentId: string;
  type: "pickup" | "drop";
  status: "present" | "absent" | "missed";
  time?: string;
  markedByDriverId: string;
}

/* ───────────────────────── 5. Exams, marks & results ───────────────────────── */

export interface GradeScale extends Base {
  name: string;
  bands: { min: number; max: number; grade: string; gpa: number; remark: string }[];
}
export interface Exam extends Base {
  name: string;
  academicYearId: string;
  type: "unit" | "term" | "final" | "practical";
  startDate: string;
  endDate: string;
  classIds: string[];
  maxMarksDefault: number;
  status: ExamStatus;
}
export interface ExamSchedule extends Base {
  examId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  invigilatorStaffId?: string;
}
export interface ExamDuty extends Base {
  examId: string;
  staffId: string;
  role: "invigilator" | "evaluator";
  date: string;
  room?: string;
  subjectId?: string;
}
export interface MarksEntry extends Base {
  examId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  studentId: string;
  marksObtained: number;
  maxMarks: number;
  isAbsent: boolean;
  enteredByStaffId: string;
  enteredAt: string;
}
export interface MarkVerification extends Base {
  examId: string;
  classId: string;
  sectionId: string;
  subjectId?: string;
  stage: MarkStage;
  actedByStaffId?: string;
  actedAt?: string;
  scope: "single" | "all";
  note?: string;
}
export interface ReportCard extends Base {
  studentId: string;
  examId: string;
  classId: string;
  sectionId: string;
  subjects: { subjectId: string; marks: number; max: number; grade: string }[];
  total: number;
  percentage: number;
  grade: string;
  rank: number;
  result: ResultStatus;
  remarks?: string;
  publishedAt?: string | null;
  templateId?: string;
}
export interface PreviousMarksheet extends Base {
  studentId: string;
  academicYear: string;
  examName: string;
  percentage: number;
  grade: string;
  fileBlobKey?: string;
}

/* ───────────────────────── 6. Homework, classwork & learning ───────────────────────── */

export interface Homework extends Base {
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherStaffId: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  attachments: string[];
  maxMarks?: number;
  status: "open" | "closed";
}
export interface HomeworkSubmission extends Base {
  homeworkId: string;
  studentId: string;
  submittedAt?: string;
  files: string[];
  status: "submitted" | "late" | "graded" | "pending";
  marks?: number;
  feedback?: string;
  gradedByStaffId?: string;
}
export interface ClassroomActivity extends Base {
  classId: string;
  sectionId: string;
  teacherStaffId: string;
  date: string;
  title: string;
  description: string;
  photos: string[];
  type: "lesson" | "classwork" | "homework" | "photo" | "note";
}
export interface LearningResource extends Base {
  classId?: string;
  subjectId?: string;
  title: string;
  kind: "video" | "audio" | "pdf" | "image" | "link";
  url: string;
  sizeMB?: number;
  uploadedByStaffId: string;
  visibleTo: "class" | "all";
}
export interface Quiz extends Base {
  classId: string;
  subjectId: string;
  title: string;
  questions: { id: string; text: string; options: string[]; correctIndex: number; marks: number }[];
  totalMarks: number;
  dueDate: string;
}
export interface QuizAttempt extends Base {
  quizId: string;
  studentId: string;
  answers: number[];
  score: number;
  submittedAt: string;
}
export interface LiveClass extends Base {
  title: string;
  classId?: string;
  hostStaffId: string;
  scheduledAt: string;
  status: "scheduled" | "live" | "ended";
  recipientScope: "class" | "section" | "all" | "custom";
  joinUrl: string;
  participants: string[];
}
export interface SyllabusBook extends Base {
  classId: string;
  subjectId: string;
  title: string;
  pages: { pageNo: number; title?: string; body?: string; imageUrl?: string }[];
  totalPages: number;
}

/* ───────────────────────── 7. Fees & accounting ───────────────────────── */

export interface FeeHead extends Base {
  name: string;
  recurrence: "monthly" | "term" | "one-time" | "annual";
  defaultAmount: number;
  isTransport: boolean;
}
export interface FeeStructure extends Base {
  name: string;
  academicYearId: string;
  classId?: string;
  items: { feeHeadId: string; amount: number; dueDay: number }[];
  applicableTo: "class" | "all" | "custom";
}
export interface FeeAssignment extends Base {
  studentId: string;
  feeStructureId: string;
  academicYearId: string;
  concessionId?: string | null;
  customAdjustments: { feeHeadId: string; delta: number; reason: string }[];
}
export interface Concession extends Base {
  name: string;
  type: "percent" | "flat";
  value: number;
  appliesToHeads: string[];
  grantedByStaffId: string;
  reason: string;
}
export interface FeeBill extends Base {
  invoiceNo: string;
  studentId: string;
  period: string;
  lineItems: { feeHeadId: string; amount: number }[];
  lateFee: number;
  concessionApplied: number;
  totalDue: number;
  totalPaid: number;
  balance: number;
  status: FeeStatus;
  dueDate: string;
  installmentPlanId?: string | null;
}
export interface Payment extends Base {
  receiptNo: string;
  billId: string;
  studentId: string;
  amount: number;
  mode: PaymentMode;
  reference?: string;
  paidAt: string;
  collectedByStaffId?: string;
  channel: "counter" | "online";
  status: "success" | "pending" | "refunded";
}
export interface Refund extends Base {
  paymentId: string;
  amount: number;
  reason: string;
  status: "requested" | "approved" | "processed";
  processedByStaffId?: string;
  processedAt?: string;
}
export interface InstallmentPlan extends Base {
  billId: string;
  installments: { no: number; amount: number; dueDate: string; status: FeeStatus; paidAt?: string }[];
}
export interface Expense extends Base {
  voucherNo: string;
  category: "utilities" | "maintenance" | "supplies" | "salary" | "transport" | "other";
  amount: number;
  date: string;
  paidTo: string;
  mode: PaymentMode;
  description?: string;
  billDocId?: string;
  enteredByStaffId: string;
  status: "recorded" | "approved" | "reimbursed" | "pending";
  isReimbursement?: boolean;
  requestedByStaffId?: string;
}
export interface SalaryStructure extends Base {
  staffId: string;
  basic: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossMonthly: number;
}
export interface PayrollRecord extends Base {
  staffId: string;
  month: string;
  presentDays: number;
  paidDays: number;
  computedGross: number;
  deductions: number;
  netPay: number;
  status: "draft" | "finalized" | "paid";
  source: "manual" | "attendance";
  generatedAt: string;
}
export interface BankReconciliation extends Base {
  statementRef: string;
  date: string;
  entries: { paymentId?: string; expenseId?: string; amount: number; matched: boolean }[];
  status: "open" | "reconciled";
}

/* ───────────────────────── 8. Library ───────────────────────── */

export interface Book extends Base {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  category: string;
  edition?: string;
  language: string;
  totalCopies: number;
  availableCopies: number;
  shelf?: string;
  coverUrl?: string;
  isDigital: boolean;
  fileUrl?: string;
}
export interface BookCopy extends Base {
  bookId: string;
  accessionNo: string;
  status: "available" | "issued" | "reserved" | "lost" | "damaged";
  condition: string;
}
export interface LibraryMember extends Base {
  memberType: "student" | "staff";
  personId: string;
  cardNo: string;
  maxBooks: number;
  joinedAt: string;
  status: UserStatus;
}
export interface BookLoan extends Base {
  copyId: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: LoanStatus;
  issuedByStaffId: string;
  fineId?: string | null;
}
export interface LibraryFine extends Base {
  loanId: string;
  memberId: string;
  amount: number;
  reason: "late" | "lost" | "damage";
  status: "pending" | "paid" | "waived";
  paidAt?: string;
}
export interface BookReservation extends Base {
  bookId: string;
  memberId: string;
  reservedAt: string;
  status: "active" | "fulfilled" | "cancelled";
  queuePosition: number;
}

/* ───────────────────────── 9. Laboratory ───────────────────────── */

export interface LabItem extends Base {
  name: string;
  category: "chemical" | "apparatus" | "specimen" | "equipment";
  labType: "physics" | "chemistry" | "biology" | "computer" | "other";
  quantity: number;
  unit: string;
  reorderLevel: number;
  location?: string;
  condition: string;
  expiryDate?: string;
}
export interface LabIssue extends Base {
  itemId: string;
  quantity: number;
  issuedToType: "student" | "staff";
  issuedToId: string;
  purpose?: string;
  issueDate: string;
  returnDate?: string | null;
  status: "issued" | "returned" | "overdue";
  issuedByStaffId: string;
}
export interface LabBooking extends Base {
  labType: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherStaffId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: "requested" | "approved" | "rejected" | "done";
}
export interface LabMaintenanceLog extends Base {
  itemId?: string;
  labType: string;
  type: "repair" | "calibration" | "safety-check" | "restock";
  date: string;
  note?: string;
  byStaffId: string;
  status: "open" | "done";
}

/* ───────────────────────── 10. Sports & activities ───────────────────────── */

export interface Activity extends Base {
  name: string;
  category: "sport" | "cultural" | "martial" | "aquatic" | "other";
  coachStaffId?: string;
  schedule: { day: number; startTime: string; endTime: string; venue: string }[];
  description?: string;
  iconKey?: string;
}
export interface Team extends Base {
  activityId: string;
  name: string;
  ageGroup?: string;
  gender?: "male" | "female" | "mixed";
  coachStaffId?: string;
  playerStudentIds: string[];
}
export interface Player extends Base {
  studentId: string;
  activityId: string;
  teamId?: string | null;
  position?: string;
  joinedAt: string;
  level?: string;
}
export interface TrainingSession extends Base {
  activityId: string;
  teamId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  venue?: string;
  focus?: string;
  attendance: { studentId: string; present: boolean }[];
}
export interface ActivityEvent extends Base {
  activityId: string;
  title: string;
  date: string;
  venue?: string;
  type: "match" | "competition" | "performance" | "practice";
  opponents?: string;
  result?: string;
  participants: string[];
}
export interface PerformanceRecord extends Base {
  studentId: string;
  activityId: string;
  eventId?: string;
  metric: string;
  value: string;
  grade?: string;
  remarks?: string;
  date: string;
}
export interface Equipment extends Base {
  activityId: string;
  name: string;
  quantity: number;
  condition: string;
  location?: string;
  status: "available" | "issued" | "damaged";
}

/* ───────────────────────── 11. Transport ───────────────────────── */

export interface Vehicle extends Base {
  vehicleNo: string;
  type: "bus" | "van";
  capacity: number;
  model?: string;
  driverStaffId?: string;
  helperStaffId?: string | null;
  fitnessExpiry?: string;
  insuranceExpiry?: string;
  status: "active" | "maintenance" | "inactive";
}
export interface Stop extends Base {
  routeId: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
  pickupTime: string;
  dropTime: string;
}
export interface Route extends Base {
  name: string;
  vehicleId: string;
  stopIds: string[];
  startTime: string;
  endTime: string;
  distanceKm: number;
  speedLimitKmph: number;
}
export interface TripAssignment extends Base {
  studentId: string;
  routeId: string;
  stopId: string;
  type: "both" | "pickup" | "drop";
}
export interface Trip extends Base {
  routeId: string;
  vehicleId: string;
  driverStaffId: string;
  date: string;
  kind: "morning" | "evening";
  status: TripStatus;
  startedAt?: string;
  endedAt?: string;
  presentCount: number;
  absentCount: number;
}
export interface IncidentReport extends Base {
  tripId?: string;
  vehicleId: string;
  driverStaffId: string;
  type: "breakdown" | "accident" | "route-issue" | "emergency" | "other";
  description: string;
  date: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
  photos: string[];
}
export interface VehicleChecklist extends Base {
  vehicleId: string;
  driverStaffId: string;
  date: string;
  items: { label: string; ok: boolean; note?: string }[];
  fuelLevel: number;
  odometer: number;
  status: "ok" | "issues";
}

/* ───────────────────────── 12. Communication ───────────────────────── */

export interface Notification extends Base {
  title: string;
  body: string;
  audience: Audience;
  audienceRefs: string[];
  channels: NotificationChannel[];
  templateId?: string;
  attachments: string[];
  status: "draft" | "queued" | "sent";
  sentByStaffId?: string;
  sentAt?: string;
  deliveryLog: { recipientId: string; recipientName: string; channel: NotificationChannel; status: "sent" | "failed" }[];
  category?: "fee" | "attendance" | "emergency" | "general" | "exam" | "transport";
}
export interface Notice extends Base {
  title: string;
  body: string;
  audience: Audience;
  attachments: string[];
  publishedAt: string;
  publishedByStaffId: string;
  pinned: boolean;
}
export interface ChatThread extends Base {
  kind: "direct" | "group";
  memberUserIds: string[];
  title?: string;
  avatarUrl?: string;
  description?: string;
  adminUserIds?: string[];
  createdByUserId: string;
  lastMessageAt?: string;
}
export interface ChatMessage extends Base {
  threadId: string;
  senderUserId: string;
  text: string;
  attachments: string[];
  sentAt: string;
  readBy: string[];
}
export interface Inquiry extends Base {
  source: "website" | "app" | "walk-in" | "phone";
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: "new" | "replied" | "closed";
  reply?: string;
  repliedByStaffId?: string;
  repliedAt?: string;
  followUpByStaffId?: string;
}
export interface Complaint extends Base {
  fromUserId?: string;
  fromName: string;
  category: string;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  assignedToStaffId?: string;
  resolution?: string;
  targetRole?: "principal" | "admin";
}
export interface VisitorLog extends Base {
  visitorName: string;
  phone: string;
  purpose: string;
  toMeetStaffId?: string;
  inTime: string;
  outTime?: string | null;
  badgeNo: string;
  idProof?: string;
  status: "in" | "out";
}
export interface CourierLog extends Base {
  direction: "inward" | "outward";
  company: string;
  party: string;
  description: string;
  refNo: string;
  date: string;
  pickupTime?: string;
  amount?: number;
  receivedByStaffId: string;
  status: "received" | "dispatched" | "delivered" | "pending";
}
export interface Appointment extends Base {
  withStaffId: string;
  requestedByName: string;
  phone: string;
  purpose: string;
  dateTime: string;
  status: "requested" | "confirmed" | "done" | "cancelled";
}

/* ───────────────────────── 13. Documents & templates ───────────────────────── */

export interface Template extends Base {
  type: TemplateType;
  name: string;
  isDefault: boolean;
  layoutConfig: {
    accent: string;
    showLogo: boolean;
    logoPosition: "left" | "center" | "right";
    showGrade: boolean;
    showPercentage: boolean;
    watermark?: string;
    style: "classic" | "modern" | "compact";
  };
  previewThumb?: string;
}
export interface GeneratedDocument extends Base {
  templateId: string;
  type: TemplateType;
  subjectType: "student" | "staff" | "class";
  subjectId: string;
  dataSnapshot: Record<string, unknown>;
  generatedAt: string;
  generatedByStaffId: string;
}

/* ───────────────────────── 14. Workflow, engagement & system ───────────────────────── */

export interface LeaveApplication extends Base {
  applicantType: "student" | "staff" | "parent-for-student";
  applicantId: string;
  studentId?: string;
  type: "sick" | "casual" | "other";
  fromDate: string;
  toDate: string;
  reason: string;
  documents: string[];
  status: LeaveStatus;
  approverStaffId?: string;
  decidedAt?: string;
  decisionNote?: string;
  extra: Extra;
}
export interface Rating extends Base {
  raterUserId: string;
  raterName: string;
  targetType: "teacher" | "staff" | "service";
  targetId: string;
  stars: number;
  comment?: string;
}
export interface RecycleBinItem extends Base {
  entityType: string;
  entityId: string;
  snapshot: Record<string, unknown>;
  label: string;
  deletedByUserId: string;
  deletedByName: string;
  expiresAt: string;
  origin: string;
}
export interface ActivityLog extends Base {
  actorUserId: string;
  actorName: string;
  actorRoleKey: RoleKey;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  meta?: Record<string, unknown>;
  at: string;
}
export interface Holiday extends Base {
  date: string;
  name: string;
  type: "national" | "festival" | "school" | "optional";
  recurring: boolean;
}
export interface Event extends Base {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: "academic" | "cultural" | "sports" | "meeting" | "ptm" | "holiday";
  audience: Audience;
  venue?: string;
  attachments: string[];
  status?: "planned" | "approved" | "done";
}
export interface Prayer extends Base {
  title: string;
  kind: "audio" | "video" | "text";
  content?: string;
  url?: string;
  language: string;
  enabled: boolean;
  order: number;
}
export interface HighlightSlider extends Base {
  kind: "top-students" | "top-teachers";
  classId?: string;
  entries: { personType: "student" | "staff"; personId: string; metric: string; rank: number }[];
  rotateSeconds: number;
}
export interface ServiceCharge extends Base {
  label: string;
  amount: number;
  appliesTo: "parent" | "student" | "all";
  note?: string;
  visible: boolean;
}
export interface FieldDefinition extends Base {
  scope: "admission" | "student" | "staff" | "sports" | "leave" | "timetable";
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "file";
  required: boolean;
  options?: string[];
  order: number;
  visibleToRoles: RoleKey[];
}
export interface DisciplineRecord extends Base {
  studentId: string;
  type: "warning" | "suspension" | "incident" | "counseling" | "achievement";
  date: string;
  description: string;
  byStaffId: string;
  severity?: "low" | "medium" | "high";
}
