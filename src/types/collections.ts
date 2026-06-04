import type * as E from "./entities";

/** Maps every persisted collection name to its entity type. The db is keyed off this. */
export interface Collections {
  schools: E.School;
  serviceModules: E.ServiceModule;
  rolePermissions: E.RolePermission;
  users: E.User;

  students: E.Student;
  guardians: E.Guardian;
  staff: E.StaffMember;
  documents: E.Document;

  academicYears: E.AcademicYear;
  classes: E.Class;
  sections: E.Section;
  subjects: E.Subject;
  classSubjectTeachers: E.ClassSubjectTeacher;
  timetable: E.TimetablePeriod;
  bellSchedules: E.BellSchedule;
  extraClasses: E.ExtraClass;

  studentAttendance: E.StudentAttendance;
  staffAttendance: E.StaffAttendance;
  biometricPunches: E.BiometricPunch;
  transportAttendance: E.TransportAttendance;

  gradeScales: E.GradeScale;
  exams: E.Exam;
  examSchedules: E.ExamSchedule;
  examDuties: E.ExamDuty;
  marksEntries: E.MarksEntry;
  markVerifications: E.MarkVerification;
  reportCards: E.ReportCard;
  previousMarksheets: E.PreviousMarksheet;

  homework: E.Homework;
  homeworkSubmissions: E.HomeworkSubmission;
  classroomActivities: E.ClassroomActivity;
  learningResources: E.LearningResource;
  quizzes: E.Quiz;
  quizAttempts: E.QuizAttempt;
  liveClasses: E.LiveClass;
  syllabusBooks: E.SyllabusBook;

  feeHeads: E.FeeHead;
  feeStructures: E.FeeStructure;
  feeAssignments: E.FeeAssignment;
  concessions: E.Concession;
  feeBills: E.FeeBill;
  payments: E.Payment;
  refunds: E.Refund;
  installmentPlans: E.InstallmentPlan;
  expenses: E.Expense;
  salaryStructures: E.SalaryStructure;
  payrollRecords: E.PayrollRecord;
  bankReconciliations: E.BankReconciliation;

  books: E.Book;
  bookCopies: E.BookCopy;
  libraryMembers: E.LibraryMember;
  bookLoans: E.BookLoan;
  libraryFines: E.LibraryFine;
  bookReservations: E.BookReservation;

  labItems: E.LabItem;
  labIssues: E.LabIssue;
  labBookings: E.LabBooking;
  labMaintenance: E.LabMaintenanceLog;

  activities: E.Activity;
  teams: E.Team;
  players: E.Player;
  trainingSessions: E.TrainingSession;
  activityEvents: E.ActivityEvent;
  performanceRecords: E.PerformanceRecord;
  equipment: E.Equipment;

  vehicles: E.Vehicle;
  routes: E.Route;
  stops: E.Stop;
  tripAssignments: E.TripAssignment;
  trips: E.Trip;
  incidents: E.IncidentReport;
  vehicleChecklists: E.VehicleChecklist;

  notifications: E.Notification;
  notices: E.Notice;
  chatThreads: E.ChatThread;
  chatMessages: E.ChatMessage;
  inquiries: E.Inquiry;
  complaints: E.Complaint;
  visitors: E.VisitorLog;
  couriers: E.CourierLog;
  appointments: E.Appointment;

  templates: E.Template;
  generatedDocuments: E.GeneratedDocument;

  leaveApplications: E.LeaveApplication;
  ratings: E.Rating;
  recycleBin: E.RecycleBinItem;
  activityLog: E.ActivityLog;
  holidays: E.Holiday;
  events: E.Event;
  prayers: E.Prayer;
  highlightSliders: E.HighlightSlider;
  serviceCharges: E.ServiceCharge;
  fieldDefinitions: E.FieldDefinition;
  disciplineRecords: E.DisciplineRecord;
}

export type CollectionName = keyof Collections;
export type EntityOf<C extends CollectionName> = Collections[C];

/** All collection names, used by storage to initialize empty maps. */
export const COLLECTION_NAMES = [
  "schools", "serviceModules", "rolePermissions", "users",
  "students", "guardians", "staff", "documents",
  "academicYears", "classes", "sections", "subjects", "classSubjectTeachers", "timetable", "bellSchedules", "extraClasses",
  "studentAttendance", "staffAttendance", "biometricPunches", "transportAttendance",
  "gradeScales", "exams", "examSchedules", "examDuties", "marksEntries", "markVerifications", "reportCards", "previousMarksheets",
  "homework", "homeworkSubmissions", "classroomActivities", "learningResources", "quizzes", "quizAttempts", "liveClasses", "syllabusBooks",
  "feeHeads", "feeStructures", "feeAssignments", "concessions", "feeBills", "payments", "refunds", "installmentPlans", "expenses", "salaryStructures", "payrollRecords", "bankReconciliations",
  "books", "bookCopies", "libraryMembers", "bookLoans", "libraryFines", "bookReservations",
  "labItems", "labIssues", "labBookings", "labMaintenance",
  "activities", "teams", "players", "trainingSessions", "activityEvents", "performanceRecords", "equipment",
  "vehicles", "routes", "stops", "tripAssignments", "trips", "incidents", "vehicleChecklists",
  "notifications", "notices", "chatThreads", "chatMessages", "inquiries", "complaints", "visitors", "couriers", "appointments",
  "templates", "generatedDocuments",
  "leaveApplications", "ratings", "recycleBin", "activityLog", "holidays", "events", "prayers", "highlightSliders", "serviceCharges", "fieldDefinitions", "disciplineRecords",
] as const satisfies readonly CollectionName[];
