import { fullName } from "@/lib/format";
import { createCrudService } from "@/lib/createService";

// workflow services
export { studentService } from "./studentService";
export { staffService } from "./staffService";
export { feeService } from "./feeService";
export { marksService, gradeFor } from "./marksService";
export { attendanceService } from "./attendanceService";
export { leaveService } from "./leaveService";
export { libraryService } from "./libraryService";
export { admissionService } from "./admissionService";
export { transportService } from "./transportService";
export { notificationService, resolveRecipients } from "./notificationService";
export { authService } from "./authService";

// people
export const guardianService = createCrudService("guardians", { label: (g) => fullName(g.firstName, g.lastName), origin: "Parents", noun: "guardian" });
export const documentService = createCrudService("documents", { label: (d) => d.label, origin: "Documents", noun: "document" });

// academics
export const classService = createCrudService("classes", { label: (c) => c.name, origin: "Academics", noun: "class" });
export const sectionService = createCrudService("sections", { label: (s) => s.name, origin: "Academics", noun: "section" });
export const subjectService = createCrudService("subjects", { label: (s) => s.name, origin: "Academics", noun: "subject" });
export const timetableService = createCrudService("timetable", { label: (t) => `Period ${t.periodNo}`, origin: "Academics", noun: "period" });
export const examService = createCrudService("exams", { label: (e) => e.name, origin: "Exams", noun: "exam" });
export const examScheduleService = createCrudService("examSchedules", { origin: "Exams", noun: "exam schedule" });
export const reportCardService = createCrudService("reportCards", { origin: "Exams", noun: "report card" });
export const homeworkService = createCrudService("homework", { label: (h) => h.title, origin: "Homework", noun: "homework" });
export const homeworkSubmissionService = createCrudService("homeworkSubmissions", { origin: "Homework", noun: "submission" });
export const classroomActivityService = createCrudService("classroomActivities", { label: (a) => a.title, origin: "Classroom", noun: "activity" });
export const learningResourceService = createCrudService("learningResources", { label: (r) => r.title, origin: "Learning", noun: "resource" });
export const quizService = createCrudService("quizzes", { label: (q) => q.title, origin: "Learning", noun: "quiz" });
export const syllabusBookService = createCrudService("syllabusBooks", { label: (b) => b.title, origin: "Syllabus", noun: "book" });
export const liveClassService = createCrudService("liveClasses", { label: (l) => l.title, origin: "Live Video", noun: "live class" });
export const extraClassService = createCrudService("extraClasses", { origin: "Academics", noun: "extra class" });
export const gradeScaleService = createCrudService("gradeScales", { label: (g) => g.name, origin: "Academics", noun: "grade scale" });

// attendance
export const studentAttendanceService = createCrudService("studentAttendance", { origin: "Attendance", noun: "attendance" });
export const staffAttendanceService = createCrudService("staffAttendance", { origin: "Attendance", noun: "staff attendance" });

// finance
export const feeHeadService = createCrudService("feeHeads", { label: (h) => h.name, origin: "Fees", noun: "fee head" });
export const feeStructureService = createCrudService("feeStructures", { label: (s) => s.name, origin: "Fees", noun: "fee structure" });
export const concessionService = createCrudService("concessions", { label: (c) => c.name, origin: "Fees", noun: "concession" });
export const paymentService = createCrudService("payments", { label: (p) => p.receiptNo, origin: "Fees", noun: "payment" });
export const expenseService = createCrudService("expenses", { label: (e) => e.voucherNo, origin: "Expenses", noun: "expense" });
export const salaryStructureService = createCrudService("salaryStructures", { origin: "Payroll", noun: "salary structure" });
export const payrollService = createCrudService("payrollRecords", { origin: "Payroll", noun: "payroll record" });
export const reconciliationService = createCrudService("bankReconciliations", { label: (r) => r.statementRef, origin: "Finance", noun: "reconciliation" });

// library
export const bookService = createCrudService("books", { label: (b) => b.title, origin: "Library", noun: "book" });
export const libraryMemberService = createCrudService("libraryMembers", { label: (m) => m.cardNo, origin: "Library", noun: "member" });
export const bookLoanService = createCrudService("bookLoans", { origin: "Library", noun: "loan" });
export const libraryFineService = createCrudService("libraryFines", { origin: "Library", noun: "fine" });
export const bookReservationService = createCrudService("bookReservations", { origin: "Library", noun: "reservation" });

// lab
export const labItemService = createCrudService("labItems", { label: (i) => i.name, origin: "Lab", noun: "item" });
export const labIssueService = createCrudService("labIssues", { origin: "Lab", noun: "issue" });
export const labBookingService = createCrudService("labBookings", { origin: "Lab", noun: "booking" });
export const labMaintenanceService = createCrudService("labMaintenance", { origin: "Lab", noun: "maintenance log" });

// sports
export const activityService = createCrudService("activities", { label: (a) => a.name, origin: "Sports", noun: "activity" });
export const teamService = createCrudService("teams", { label: (t) => t.name, origin: "Sports", noun: "team" });
export const playerService = createCrudService("players", { origin: "Sports", noun: "player" });
export const trainingService = createCrudService("trainingSessions", { origin: "Sports", noun: "session" });
export const activityEventService = createCrudService("activityEvents", { label: (e) => e.title, origin: "Sports", noun: "event" });
export const performanceService = createCrudService("performanceRecords", { origin: "Sports", noun: "record" });
export const equipmentService = createCrudService("equipment", { label: (e) => e.name, origin: "Sports", noun: "equipment" });

// transport
export const vehicleService = createCrudService("vehicles", { label: (v) => v.vehicleNo, origin: "Transport", noun: "vehicle" });
export const routeService = createCrudService("routes", { label: (r) => r.name, origin: "Transport", noun: "route" });
export const stopService = createCrudService("stops", { label: (s) => s.name, origin: "Transport", noun: "stop" });
export const tripService = createCrudService("trips", { origin: "Transport", noun: "trip" });
export const tripAssignmentService = createCrudService("tripAssignments", { origin: "Transport", noun: "assignment" });
export const incidentService = createCrudService("incidents", { label: (i) => i.type, origin: "Transport", noun: "incident" });
export const vehicleChecklistService = createCrudService("vehicleChecklists", { origin: "Transport", noun: "checklist" });

// communication
export const noticeService = createCrudService("notices", { label: (n) => n.title, origin: "Communication", noun: "notice" });
export const inquiryService = createCrudService("inquiries", { label: (i) => i.subject, origin: "Inquiries", noun: "inquiry" });
export const complaintService = createCrudService("complaints", { label: (c) => c.subject, origin: "Complaints", noun: "complaint" });
export const visitorService = createCrudService("visitors", { label: (v) => v.visitorName, origin: "Records", noun: "visitor" });
export const courierService = createCrudService("couriers", { label: (c) => c.refNo, origin: "Records", noun: "courier" });
export const appointmentService = createCrudService("appointments", { label: (a) => a.purpose, origin: "Appointments", noun: "appointment" });
export const chatThreadService = createCrudService("chatThreads", { origin: "Chat", noun: "conversation" });
export const chatMessageService = createCrudService("chatMessages", { origin: "Chat", noun: "message" });

// documents
export const templateService = createCrudService("templates", { label: (t) => t.name, origin: "Documents", noun: "template" });
export const generatedDocumentService = createCrudService("generatedDocuments", { origin: "Documents", noun: "document" });

// engagement / system
export const ratingService = createCrudService("ratings", { origin: "Feedback", noun: "rating" });
export const eventService = createCrudService("events", { label: (e) => e.title, origin: "Calendar", noun: "event" });
export const holidayService = createCrudService("holidays", { label: (h) => h.name, origin: "Calendar", noun: "holiday" });
export const prayerService = createCrudService("prayers", { label: (p) => p.title, origin: "Prayer", noun: "prayer" });
export const serviceChargeService = createCrudService("serviceCharges", { label: (s) => s.label, origin: "Settings", noun: "service charge" });
export const fieldDefinitionService = createCrudService("fieldDefinitions", { label: (f) => f.label, origin: "Settings", noun: "field" });
export const disciplineService = createCrudService("disciplineRecords", { label: (d) => d.type, origin: "Discipline", noun: "record" });
export const recycleBinService = createCrudService("recycleBin", { origin: "Recycle Bin", noun: "item" });
export const activityLogService = createCrudService("activityLog", { origin: "Activity", noun: "log" });
