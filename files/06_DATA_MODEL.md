# 🗄️ 06 · Data Model — EMS Suite

> **Purpose.** Defines every entity, its fields, relationships, the enum catalog, and the **seed/persistence strategy** that makes the whole app clickable and "real" without a server. Pair with `02_SRS.md` (requirements), `04_INFORMATION_ARCHITECTURE.md` (screens), `05_DESIGN_SYSTEM.md` (look). Field types are TypeScript-flavored; Claude Code should generate matching `types.ts` + zod schemas.

---

## 0. How the data layer works (mock backend)

There is **no real server**. All data lives in a typed client store persisted to **localStorage**, behind a service layer so it can later be swapped for a real API with minimal UI change.

```
src/lib/db/
  schema.ts        // TS types + zod schemas for every entity below
  seed.ts          // generates the demo dataset (idempotent, versioned)
  storage.ts       // load/save/reset to localStorage; version key for migrations
  index.ts         // the in-memory "db" object (collections) + persistence
src/services/      // one module per domain: studentService, feeService, attendanceService, ...
                   //   each exposes async CRUD + domain ops, writes through to db, logs activity
src/lib/activity.ts  // logActivity(actor, action, entity, meta) → ActivityLog
src/lib/bin.ts       // softDelete()/restore()/purge() → RecycleBin (15-day TTL)
```

**Rules**
- **Persistence:** every create/update/delete writes to localStorage immediately; reload preserves state. A `schemaVersion` guards migrations; bump → re-seed.
- **IDs:** `nanoid()` for internal `id`; human IDs (admission no., receipt no., roll no.) generated with readable patterns (e.g. `ADM-2025-0001`, `RCPT-2025-000123`).
- **Timestamps:** every entity has `createdAt`, `updatedAt` (ISO strings).
- **Soft delete:** most entities have `deletedAt: string | null`. Deleting sets it and creates a `RecycleBinItem`; lists filter out soft-deleted rows; restore clears it; purge after 15 days or on permanent delete. (See `bin.ts`.)
- **Activity log:** every meaningful mutation calls `logActivity` (who/what/when) → powers Admin/Principal activity views.
- **Async feel:** services return Promises with tiny artificial latency so loading/skeleton states are exercised.
- **Reset:** Settings → "Reset demo data" wipes and re-seeds.
- **Money** stored as integer **paise**? — store as number in rupees with 2-dp formatting via a `formatMoney` util (keep simple; document the unit). Use `tabular-nums` + mono in UI.

**Common base (mixed into entities unless noted):**
```ts
interface Base { id: string; createdAt: string; updatedAt: string; deletedAt?: string | null; }
```

---

## 1. Identity, access & system

### School (singleton-ish; supports the org profile)
`id, name, logoUrl, diseCode, licenseNo, affiliationNo, address, city, state, pincode, phone, email, website, socialLinks{facebook,instagram,youtube,x,whatsapp}, principalName, establishedYear, sessionStartMonth, defaultLanguage('en'|'hi'), isActive`
- Super Admin can set `isActive=false` → **cascades**: all users' login disabled (data retained).

### ServiceModule (service hide/unhide + active/inactive registry)
`id, key, label, group, isEnabled, isVisible, requiredRoles[]`
- Drives which modules/menu items appear; Super Admin/Admin toggle visibility & enablement (FR-SA, FR-ADM).

### Role
`id, key (enum RoleKey), label, isSystem, description`
14 roles — see Enum `RoleKey`.

### Permission / RolePermission
`Permission: id, key (e.g. 'student.create','fee.collect','delete.execute'), label, domain`
`RolePermission: roleKey, permissionKey, allowed:boolean`
- Implements the per-role allow/deny matrix (SRS §3). **Delete** is a grantable permission Admin can selectively give (e.g. to Principal). PIN required at execution.

### User (login account; one per person)
`id, username, email, phone, passwordHash(mock), roleKey, linkedProfileType('student'|'staff'|'guardian'|null), linkedProfileId, status('active'|'inactive'), pinHash(for delete), avatarUrl, languagePref, lastLoginAt, createdByCascade?`
- `status='inactive'` disables login only (data kept). Super Admin deactivating an Admin cascades school-wide.

### Session (mock)
`token, userId, roleKey, issuedAt, expiresAt` — kept in memory + localStorage for "stay logged in".

### AppSettings (per device/user)
`theme('light'|'dark'|'system'), language('en'|'hi'), density('comfortable'|'compact'), tablePageSize, uploadLimitsMB{image,pdf,audio,video}, sidebarCollapsed`

---

## 2. People

### Student
Core: `id, admissionNo, rollNo, firstName, lastName, gender, dob, photoUrl, bloodGroup, classId, sectionId, academicYearId, admissionDate, status('active'|'inactive'|'alumni'), house, category, religion, motherTongue, nationality`
**Identity IDs (all supported, FR-PRF):** `ssmid, samagraId, scholarNo, apaarId, aadhaarMasked, penNo` + `customIds: { label:string; value:string }[]`
Contact/address: `address, city, state, pincode, emergencyContact`
Relations: `guardianIds[]` (→ Guardian), `transportRouteId?`, `feeAssignmentId?`, `previousMarksheetIds[]`
**Dynamic fields:** `extra: Record<string, string|number|boolean>` driven by `FieldDefinition` (admission/student forms).

### Guardian / Parent
`id, firstName, lastName, relation('father'|'mother'|'guardian'), phone (login id), altPhone, email, occupation, photoUrl, address, studentIds[]`
- **Single mobile → multiple children:** one Guardian (and one User) maps to many Students via `studentIds`; Parent UI shows a child switcher.

### StaffMember (covers every staff role)
`id, employeeId, firstName, lastName, gender, dob, photoUrl, roleKey (Principal|Accountant|Receptionist|Librarian|LabAssistant|Examiner|SportsCoach|ClassTeacher|SubjectTeacher|BusDriver|BusHelper|OtherStaff|Admin|SuperAdmin), department, designation, qualifications[], joiningDate, status, contact{phone,email,address}, salaryStructureId?, bankInfo{accountMasked,ifsc}, documents[]`
Role extensions (optional blocks on the same record):
- **Teaching:** `subjectsTaught[] (subjectId), classTeacherOf?(classId+sectionId), periodsPerWeek`
- **Driver:** `licenseNo, licenseExpiry, assignedVehicleId, assignedRouteId`
- **Coach:** `activityIds[]`
- `extra: Record<...>` for dynamic staff fields.

### Document (attached files for any person/entity)
`id, ownerType, ownerId, kind('photo'|'certificate'|'bill'|'id'|'other'), label, fileName, mimeType, sizeMB, url(dataURL/mock), uploadedBy`

---

## 3. Academic structure

### AcademicYear
`id, name('2025-26'), startDate, endDate, isCurrent`

### Class
`id, name('Class 5'), numericLevel, academicYearId, classTeacherStaffId?, sectionIds[], subjectIds[]`

### Section
`id, classId, name('A'), capacity, classTeacherStaffId?, roomNo`

### Subject
`id, name, code, type('core'|'elective'|'practical'|'activity'), classIds[], hasPractical, maxMarks, passMarks`

### ClassSubjectTeacher (assignment)
`id, classId, sectionId, subjectId, teacherStaffId, academicYearId`

### TimetablePeriod (class-wise + day-wise, dynamic)
`id, classId, sectionId, dayOfWeek(0-6), periodNo, startTime, endTime, subjectId, teacherStaffId, room, type('period'|'break'|'assembly'|'games')`

### BellSchedule (period-end bell)
`id, classId?, periods:[{periodNo,startTime,endTime,label}], bellSoundUrl, enabled`

### ExtraClass (scheduling + notify)
`id, classId, sectionId, subjectId, teacherStaffId, date, startTime, endTime, note, notifyParents:boolean, notifyStudents:boolean, createdBy`

---

## 4. Attendance

### StudentAttendance
`id, studentId, classId, sectionId, date, status('present'|'absent'|'late'|'half-day'|'leave'), markedByStaffId, markedAt, lockedAfter(same-day edit rule), source('manual'|'import'|'biometric'), note`
- Same-day edit by Class Teacher; later edits need Principal/Admin (enforced in service).
- Triggers parent notification (FR-X attendance notifications).

### StaffAttendance
`id, staffId, date, checkIn, checkOut, status('present'|'absent'|'leave'|'half-day'), workedHours, source('manual'|'biometric'), payrollImpact`

### BiometricPunch (attendance machine import → salary)
`id, deviceId, personType('student'|'staff'), personId, timestamp, direction('in'|'out'), importedBatchId`
- "Device sync" imports a mock punch file → builds StaffAttendance → feeds Payroll (salary-from-attendance, FR-X).

### TransportAttendance
`id, tripId, studentId, type('pickup'|'drop'), status('present'|'absent'|'missed'), time, markedByDriverId`
- Produces present/absent **counts** per trip.

---

## 5. Exams, marks & results

### GradeScale
`id, name, bands:[{min,max,grade,gpa,remark}]` — drives % → grade on mark sheets.

### Exam
`id, name('Half-Yearly'), academicYearId, type('unit'|'term'|'final'|'practical'), startDate, endDate, classIds[], maxMarksDefault, status('planned'|'ongoing'|'completed'|'published')`

### ExamSchedule (datesheet)
`id, examId, classId, sectionId, subjectId, date, startTime, endTime, room, invigilatorStaffId`

### ExamDuty (examiner/invigilation)
`id, examId, staffId, role('invigilator'|'evaluator'), date, room, subjectId`

### MarksEntry (subject-teacher entry)
`id, examId, classId, sectionId, subjectId, studentId, marksObtained, maxMarks, isAbsent, enteredByStaffId, enteredAt`

### MarkVerification (workflow: Subject Teacher → Class Teacher verify → approve one/all → publish)
`id, examId, classId, sectionId, subjectId?, stage('entered'|'verified'|'approved'|'published'), actedByStaffId, actedAt, scope('single'|'all'), note`

### ReportCard / Result
`id, studentId, examId, classId, sectionId, subjects:[{subjectId,marks,max,grade}], total, percentage, grade, rank, result('pass'|'fail'|'compartment'), remarks, publishedAt, templateId`
- **Rank** computed per class/section; supports rank display (FR-X).

### PreviousMarksheet (archive)
`id, studentId, academicYear, examName, fileUrl|data, percentage, grade`

---

## 6. Homework, classwork & online learning

### Homework
`id, classId, sectionId, subjectId, teacherStaffId, title, description, assignedDate, dueDate, attachments[], maxMarks?, status('open'|'closed')`

### HomeworkSubmission
`id, homeworkId, studentId, submittedAt, files[], status('submitted'|'late'|'graded'|'pending'), marks?, feedback, gradedByStaffId`

### ClassroomActivity (teacher uploads visible to class parents/students)
`id, classId, sectionId, teacherStaffId, date, title, description, photos[], type('lesson'|'classwork'|'homework'|'photo'|'note')`

### LearningResource (multi-format uploads: audio/video/pdf/jpg)
`id, classId?, subjectId?, title, kind('video'|'audio'|'pdf'|'image'|'link'), url, sizeMB, uploadedByStaffId, visibleTo('class'|'all')`

### Quiz / Question / QuizAttempt
`Quiz: id, classId, subjectId, title, questions[], totalMarks, dueDate`
`Question: id, text, options[], correctIndex, marks`
`QuizAttempt: id, quizId, studentId, answers[], score, submittedAt`

### LiveClass (live video shell)
`id, title, classId?, hostStaffId, scheduledAt, status('scheduled'|'live'|'ended'), recipientScope('class'|'section'|'all'|'custom'), joinUrl(mock), participants[]`

### SyllabusBook (online reader)
`id, classId, subjectId, title, pages:[{pageNo,imageUrl|pdfRef}], totalPages` — reader supports page-by-page + jump-to-page.

---

## 7. Fees & accounting

### FeeHead
`id, name('Tuition','Transport','Exam','Library'), recurrence('monthly'|'term'|'one-time'|'annual'), defaultAmount, isTransport`

### FeeStructure
`id, name, academicYearId, classId?, items:[{feeHeadId, amount, dueDay}], applicableTo('class'|'all'|'custom')`

### FeeAssignment (per student)
`id, studentId, feeStructureId, academicYearId, concessionId?, customAdjustments:[{feeHeadId,delta,reason}]`

### Concession
`id, name('Sibling','Merit','Staff Ward'), type('percent'|'flat'), value, appliesToHeads[], grantedByStaffId, reason`

### FeeBill / Invoice (generated dues)
`id, invoiceNo, studentId, period, lineItems:[{feeHeadId,amount}], lateFee, concessionApplied, totalDue, totalPaid, balance, status('paid'|'partial'|'due'|'overdue'), dueDate, installmentPlanId?`

### Payment
`id, receiptNo, billId, studentId, amount, mode('cash'|'card'|'upi'|'netbanking'|'cheque'|'online'), reference, paidAt, collectedByStaffId, channel('counter'|'online'), status('success'|'pending'|'refunded')`
- Online = **simulated gateway** → real receipt + balance update.

### Refund
`id, paymentId, amount, reason, status, processedByStaffId, processedAt`

### InstallmentPlan
`id, billId, installments:[{no,amount,dueDate,status,paidAt}]`

### LateFeeRule
`id, name, graceDays, type('percent'|'flat'|'per-day'), value, cap`

### Receipt / Invoice document
Rendered from `Payment`/`FeeBill` via selected template (TemplatePicker) → print/PDF.

### Expense
`id, voucherNo, category('utilities'|'maintenance'|'supplies'|'salary'|'transport'|'other'), amount, date, paidTo, mode, billDocId?, enteredByStaffId, status('recorded'|'approved'|'reimbursed')`
- Other Staff can submit reimbursement requests (visible to Admin & Accountant).

### SalaryStructure / PayrollRecord
`SalaryStructure: id, staffId, basic, allowances:[{name,amount}], deductions:[{name,amount}], grossMonthly`
`PayrollRecord: id, staffId, month, presentDays, paidDays, computedGross, deductions, netPay, status('draft'|'finalized'|'paid'), source('manual'|'attendance'), generatedAt`
- **Salary from attendance:** payroll can compute paid days from StaffAttendance/Biometric.

### BankReconciliation
`id, statementRef, date, entries:[{paymentId?,expenseId?,amount,matched:boolean}], status`

---

## 8. Library

### Book
`id, isbn, title, author, publisher, category, edition, language, totalCopies, availableCopies, shelf, coverUrl, isDigital, fileUrl?`

### BookCopy
`id, bookId, accessionNo, status('available'|'issued'|'reserved'|'lost'|'damaged'), condition`

### LibraryMember
`id, memberType('student'|'staff'), personId, cardNo, maxBooks, joinedAt, status`

### BookLoan (issue/return)
`id, copyId, bookId, memberId, issueDate, dueDate, returnDate?, status('issued'|'returned'|'overdue'|'lost'), issuedByStaffId, fineId?`

### LibraryFine
`id, loanId, memberId, amount, reason('late'|'lost'|'damage'), status('pending'|'paid'|'waived'), paidAt`

### BookReservation
`id, bookId, memberId, reservedAt, status('active'|'fulfilled'|'cancelled'), queuePosition`

---

## 9. Laboratory

### LabItem (inventory)
`id, name, category('chemical'|'apparatus'|'specimen'|'equipment'), labType('physics'|'chemistry'|'biology'|'computer'|'other'), quantity, unit, reorderLevel, location, condition, expiryDate?`

### LabIssue (issue/return to students/teachers)
`id, itemId, quantity, issuedTo(personType,personId), purpose, issueDate, returnDate?, status, issuedByStaffId`

### LabBooking
`id, labType, classId, sectionId, subjectId, teacherStaffId, date, startTime, endTime, purpose, status`

### LabMaintenanceLog
`id, itemId?, labType, type('repair'|'calibration'|'safety-check'|'restock'), date, note, byStaffId, status`

---

## 10. Sports & activities (dynamic module)

### Activity (dynamic: dance/music/sports/karate/swimming/…)
`id, name, category('sport'|'cultural'|'martial'|'aquatic'|'other'), coachStaffId, schedule:[{day,startTime,endTime,venue}], description, iconKey`
- Admin/Coach can **add new activity types** at runtime (dynamic).

### Team
`id, activityId, name, ageGroup, gender, coachStaffId, playerStudentIds[]`

### Player (enrollment)
`id, studentId, activityId, teamId?, position, joinedAt, level`

### TrainingSession
`id, activityId, teamId?, date, startTime, endTime, venue, focus, attendance:[{studentId,present}]`

### ActivityEvent (matches/competitions/performances)
`id, activityId, title, date, venue, type('match'|'competition'|'performance'|'practice'), opponents?, result, participants[]`

### PerformanceRecord
`id, studentId, activityId, eventId?, metric, value, grade, remarks, date`

### Equipment
`id, activityId, name, quantity, condition, location, status`

---

## 11. Transport

### Vehicle
`id, vehicleNo, type('bus'|'van'), capacity, model, driverStaffId, helperStaffId?, fitnessExpiry, insuranceExpiry, status('active'|'maintenance'|'inactive')`

### Route
`id, name, vehicleId, stops:[stopId], startTime, endTime, distanceKm, speedLimitKmph(default 80)`

### Stop
`id, routeId, name, lat, lng, sequence, pickupTime, dropTime`

### TripAssignment (students ↔ route)
`id, studentId, routeId, stopId, type('both'|'pickup'|'drop')`

### Trip (a run)
`id, routeId, vehicleId, driverStaffId, date, kind('morning'|'evening'), status('scheduled'|'started'|'completed'), startedAt, endedAt, presentCount, absentCount`

### LiveLocation (simulated GPS)
`id, vehicleId, tripId, lat, lng, speedKmph, heading, timestamp, overSpeed:boolean, withinGeofence:boolean`
- Drives animated map + **speed-limit alert** (>limit → alert) + delay notifications.

### IncidentReport
`id, tripId?, vehicleId, driverStaffId, type('breakdown'|'accident'|'route-issue'|'emergency'|'other'), description, date, severity, status, photos[]`

### VehicleChecklist
`id, vehicleId, driverStaffId, date, items:[{label,ok:boolean,note}], fuelLevel, odometer, status`

### StudentLiveLocation (optional, in-school-hours)
`id, studentId, lat, lng, timestamp, enabled` — opt-in safety feature (simulated).

---

## 12. Communication

### Notification (broadcast/notice; multi-audience, multi-channel)
`id, title, body, audience('all'|'teachers'|'employees'|'parents'|'students'|'class'|'member'|'role'), audienceRefs[], channels:('whatsapp'|'sms'|'email'|'push')[], templateId?, attachments[], status('draft'|'queued'|'sent'), sentByStaffId, sentAt, deliveryLog:[{recipientId,channel,status}]`
- Composer supports any/all/teachers/employees/member-wise/class-wise (FR-COM, FR-X). Channels simulated → marked "sent".

### Notice / Circular
`id, title, body, audience, attachments[], publishedAt, publishedByStaffId, pinned` (subset of Notification for the notice board).

### ChatThread
`id, kind('direct'|'group'), memberUserIds[], title?, createdByUserId, lastMessageAt`

### ChatGroup metadata (WhatsApp-style)
extends thread: `avatarUrl, description, adminUserIds[]` — created by Admin/Principal/Teacher; add members individually or **Select All**.

### ChatMessage
`id, threadId, senderUserId, text, attachments[], sentAt, readBy[]`

### Inquiry (website + app enquiries → Admin replies)
`id, source('website'|'app'), name, phone, email, subject, message, status('new'|'replied'|'closed'), reply?, repliedByStaffId, repliedAt, createdAt`

### Complaint
`id, fromUserId?, fromName, category, subject, description, status('open'|'in-progress'|'resolved'), assignedToStaffId?, resolution, createdAt`

### VisitorLog (receptionist digital book)
`id, visitorName, phone, purpose, toMeetStaffId?, inTime, outTime, badgeNo, idProof, status('in'|'out')`

### CourierLog (postal/courier records)
`id, direction('inward'|'outward'), party, description, refNo, date, receivedByStaffId, status`

### Appointment
`id, withStaffId, requestedByName, phone, purpose, dateTime, status('requested'|'confirmed'|'done'|'cancelled')`

---

## 13. Documents & templates

### Template (dynamic, switchable)
`id, type('marksheet'|'admitcard'|'idcard'|'timetable'|'receipt'|'tc'|'certificate'), name, isDefault, layoutConfig(JSON: fields, logo position, colors, columns), previewThumb`
- **TemplatePicker** lets users switch before print/download; mark sheet shows **percentage + grade**.

### GeneratedDocument
`id, templateId, type, subjectType('student'|'staff'|'class'), subjectId, dataSnapshot, generatedAt, generatedByStaffId, fileRef?`
- Supports **bulk** (all) and **one-by-one** generation/print (FR-ADM, FR-DOC).

---

## 14. Workflow, engagement & system

### LeaveApplication (dynamic form; Parent/Student → Class Teacher approve → notify)
`id, applicantType('student'|'staff'|'parent-for-student'), applicantId, studentId?, type('sick'|'casual'|'other'), fromDate, toDate, reason, documents[], status('pending'|'approved'|'rejected'), approverStaffId?, decidedAt, decisionNote, extra:Record<...>`
- Dynamic fields supported; approval notifies applicant.

### Rating (1–5; only Admin sees who rated)
`id, raterUserId, targetType('teacher'|'staff'|'service'), targetId, stars(1-5), comment?, createdAt`
- Aggregate (avg + count) visible to many; **rater identity visible only to Admin** (enforced in service/serializer).

### RecycleBinItem
`id, entityType, entityId, snapshot(JSON), deletedByUserId, deletedAt, expiresAt(deletedAt+15d), origin`
- Restore re-inserts snapshot & clears `deletedAt`; permanent delete removes; auto-purge job (on load) removes expired. PIN required to delete; permission-gated.

### ActivityLog
`id, actorUserId, actorRoleKey, action, entityType, entityId, summary, meta(JSON), at`
- Powers Admin/Principal "activity of all members" views; filterable by member/role/date.

### Holiday & HolidayCalendar (preloaded)
`Holiday: id, date, name, type('national'|'festival'|'school'|'optional'), recurring`
- Calendar comes **preloaded** with common holidays; admin can edit.

### Event
`id, title, description, date, endDate?, type('academic'|'cultural'|'sports'|'meeting'|'ptm'|'holiday'), audience, venue, attachments[], rsvp?`

### Prayer (school prayer: audio/video/text)
`id, title, kind('audio'|'video'|'text'), content|url, language, enabled, order`

### HighlightSlider (top-3 students/teachers + topper card)
`id, kind('top-students'|'top-teachers'), entries:[{personType,personId,metric,rank}], rotateSeconds`

### ServiceCharge (service-charge display)
`id, label, amount, appliesTo('parent'|'student'|'all'), note, visible` — shown on parent/student home.

---

## 15. Relationship overview (ER summary)

- **School 1—* ServiceModule, Role, AcademicYear, Template, Holiday, Notification, Event.**
- **AcademicYear 1—* Class; Class 1—* Section; Class *—* Subject (via ClassSubjectTeacher); Section 1—* Student.**
- **Student *—* Guardian** (many-to-many; one Guardian/phone → many Students). **Student 1—1 User** (optional); **Guardian 1—1 User**.
- **StaffMember 1—1 User.** StaffMember roles add domain links (teaching → ClassSubjectTeacher / classTeacherOf; driver → Vehicle/Route; coach → Activity).
- **Student 1—* StudentAttendance, HomeworkSubmission, MarksEntry, ReportCard, FeeBill, Payment, TripAssignment, Player, LibraryMember, LeaveApplication, Rating(target).**
- **Exam 1—* ExamSchedule, MarksEntry, MarkVerification, ReportCard, ExamDuty.**
- **FeeStructure 1—* FeeAssignment; FeeBill 1—* Payment; FeeBill 1—1 InstallmentPlan?; Payment 1—1 Refund?.**
- **Route 1—* Stop, TripAssignment, Trip; Trip 1—* TransportAttendance, LiveLocation; Vehicle 1—* Trip, VehicleChecklist, IncidentReport.**
- **Book 1—* BookCopy; BookCopy 1—* BookLoan; BookLoan 1—1 LibraryFine?.**
- **Activity 1—* Team, Player, TrainingSession, ActivityEvent, Equipment, PerformanceRecord.**
- **ChatThread 1—* ChatMessage; ChatThread *—* User.**
- **Any entity 1—* Document, RecycleBinItem(on delete), ActivityLog(on mutation).**
- **Template 1—* GeneratedDocument.**

---

## 16. Enum catalog (single source)

- `RoleKey`: super_admin, admin, principal, accountant, receptionist, librarian, lab_assistant, examiner, sports_coach, class_teacher, subject_teacher, bus_driver, bus_helper, other_staff, parent, student
- `AttendanceStatus`: present, absent, late, half_day, leave
- `FeeStatus`: paid, partial, due, overdue
- `PaymentMode`: cash, card, upi, netbanking, cheque, online
- `ExamStatus`: planned, ongoing, completed, published
- `MarkStage`: entered, verified, approved, published
- `LoanStatus`: issued, returned, overdue, lost
- `TripStatus`: scheduled, started, completed
- `LeaveStatus`: pending, approved, rejected
- `NotificationChannel`: whatsapp, sms, email, push
- `Audience`: all, teachers, employees, parents, students, class, role, member
- `TemplateType`: marksheet, admitcard, idcard, timetable, receipt, tc, certificate
- `UserStatus`: active, inactive
- `Language`: en, hi
- `Theme`: light, dark, system
- `Density`: comfortable, compact
(Plus the smaller per-entity unions shown inline above.)

---

## 17. Dynamic fields & ID fields (explicit)

### FieldDefinition (powers dynamic admission/student/staff/sports/timetable forms)
`id, scope('admission'|'student'|'staff'|'sports'|'leave'|'timetable'), key, label, type('text'|'number'|'date'|'select'|'checkbox'|'file'), required, options?[], order, visibleToRoles[]`
- Admin manages these; FormModal renders them; values stored in each entity's `extra` map. Satisfies "dynamic admission/student fields", "dynamic sports module", "dynamic leave form", "dynamic timetable fields".

### Student identity IDs (all required by PDF)
First-class fields on `Student`: `ssmid, samagraId, scholarNo, apaarId, rollNo, admissionNo, aadhaarMasked, penNo` **plus** `customIds[]` for any extra ID a school uses. Surfaced on profile, ID card, mark sheet, admit card.

---

## 18. Seed data strategy (makes everything clickable)

`seed.ts` generates a coherent, realistic demo school so **every screen has data on first load**:

- **1 School** (with DISE/license/logo/social), current **AcademicYear 2025-26**, preloaded **Holiday calendar**, default **Templates** (1+ per type), **GradeScale**, **ServiceModule** registry, **RolePermission** matrix per SRS.
- **Classes** Nursery–12 with **2 sections each**, **subjects** per class, **ClassSubjectTeacher** assignments, and full **class-wise/day-wise timetables**.
- **~150–300 Students** spread across classes (with all ID fields, photos via initials, dynamic `extra`), each linked to **Guardians**; several guardians intentionally linked to **multiple children** (to demo the single-number/child-switcher feature).
- **~40–60 Staff** covering **every role** (Principal, Accountant, Receptionist, Librarian, Lab Assistant, Examiner, Sports Coaches, Class/Subject Teachers, Drivers + Helpers, Other Staff) with salary structures.
- **Attendance** for the last ~30 days (students + staff), some biometric punches; **Exams** (one completed+published with marks/report cards/ranks, one ongoing) to exercise the full marks workflow.
- **Fees:** structures + assignments + a mix of **paid/partial/due/overdue** bills, payments with receipts, a concession, an installment plan, some expenses + payroll + a reconciliation.
- **Library:** books/copies, active loans (some overdue with fines), reservations. **Lab:** items, issues, bookings. **Sports:** a few activities (incl. dance/karate/swimming) with teams/players/events.
- **Transport:** 2–3 routes with stops, vehicles, drivers, trip assignments, a live (simulated) trip with locations + a speed-alert example.
- **Communication:** sample notifications (sent log), notices, chat threads + a group, website/app **inquiries**, complaints, visitor + courier entries, appointments.
- **Engagement:** top-3 sliders, topper card, prayer entries, events, service charges, a few ratings (so Admin can demo "who rated").
- **Recycle Bin:** 1–2 pre-soft-deleted items to demo restore/purge. **ActivityLog:** seeded from all the above so Admin/Principal activity views are populated.

### Demo login accounts (one per role) — shown on the login screen
`super_admin`, `admin`, `principal`, `accountant`, `receptionist`, `librarian`, `lab_assistant`, `examiner`, `sports_coach`, `class_teacher`, `subject_teacher`, `bus_driver`, `other_staff`, `parent`, `student` — each with a simple shared demo password and a preset **delete PIN**. The login page lists these as one-click "sign in as…" chips so every role is instantly explorable.

### Reset
Settings → **Reset demo data** clears localStorage and re-runs `seed.ts` (idempotent, versioned by `schemaVersion`).

---

## 19. Traceability note
Every entity above exists to satisfy specific requirements in `02_SRS.md`: roles/permissions (§3, FR-RBAC), per-role functions (§4), shared domains (§5), and the 78 Additional Demands (§7, FR-X-1..78) — including ratings privacy, recycle bin + PIN delete, chat groups with Select-All, live tracking + speed alerts, salary-from-attendance, dynamic fields/forms, switchable templates, percentage+grade mark sheets, multi-child single-number guardians, syllabus reader, holiday calendar, prayer, bells, top-3 sliders, all student ID types, and bilingual content. If a requirement is added later, extend the matching entity's fields or its `extra`/`FieldDefinition` rather than inventing a parallel store.

---

*End of data model. Together with the prompt (01), SRS (02), personas/stories (03), IA (04), and design system (05), this completes the build package.*
