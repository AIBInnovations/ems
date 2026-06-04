# 02 — Software Requirements Specification (SRS)

**Product:** Education Management System (`ems-suite`)
**Document status:** Complete — derived 1:1 from the 84-page source PDF.
**Convention:** Requirement IDs are `FR-<AREA>-<n>` (functional) and `NFR-<n>` (non-functional). Appendix A maps **every** PDF page/point to a requirement so nothing is lost.

---

## 1. Introduction

### 1.1 Purpose
Specify the complete requirements for a role-based Education Management System used by schools. The software centralizes academics, attendance, examinations, fees & accounting, library, laboratory, transport, sports/activities, communication, document generation, and administration across **14 distinct user roles**, on **web (responsive)**, designed for later extension to native mobile.

### 1.2 Scope
The system manages the full school lifecycle: admissions and inquiries; student & staff records; class/section/subject/timetable setup; daily attendance (student & staff, incl. biometric import); exams, marks-verification workflow, results, report cards, ranks & toppers; fee structures, collection, receipts, dues, expenses, payroll, and financial reporting; library and lab inventory and circulation; transport with live tracking and speed alerts; sports/activities; multi-channel communication (WhatsApp/SMS/Email/push) and WhatsApp-style chat groups; dynamic templated documents (mark sheets, admit cards, ID cards, timetables, receipts, TCs); ratings & feedback; recycle bin with PIN-protected deletion; bilingual Hindi/English UI; live video; syllabus reader; holiday calendar; and granular RBAC governed by Super Admin and Admin.

### 1.3 Definitions, acronyms, abbreviations
- **RBAC** — Role-Based Access Control.
- **PTM** — Parent-Teacher Meeting.
- **TC** — Transfer Certificate.
- **Defaulter** — a student with pending/overdue fees.
- **Recycle Bin** — soft-deleted items retained 15 days before auto-purge.
- **Service** — any feature/option that Super Admin or Admin can hide/unhide or activate/deactivate.
- **DISE Code / APAAR ID / Samagra ID / Scholar ID / SSMID** — government/school student & institution identifiers used in profiles.
- **Mock-data layer** — client-side persistent store (localStorage) standing in for a backend.

### 1.4 References
- Source PDF: *Education Management System Software* (84 pages), transcribed in `Education_Management_System_Complete_Transcription.md`.
- Companion docs: `03_PERSONAS_AND_USER_STORIES.md`, `04_INFORMATION_ARCHITECTURE.md`, `05_DESIGN_SYSTEM.md`, `06_DATA_MODEL.md`.

### 1.5 Overview
§2 gives the overall description; §3 specifies roles & RBAC; §4 lists per-role functional requirements; §5 lists shared/domain requirements; §6 lists document & template requirements; §7 lists the 78 cross-cutting "Additional School Demands"; §8 lists non-functional requirements; §9 lists external interfaces/integrations; Appendix A is the traceability matrix.

---

## 2. Overall description

### 2.1 Product perspective
A self-contained multi-role SaaS-style web application. For this build it runs entirely client-side with a persistent mock-data layer; all external integrations (payments, GPS, biometric devices, messaging APIs, video) are implemented as faithful simulations with correct, visible outcomes and a clear upgrade path to real services.

### 2.2 Product functions (high level)
Authentication & RBAC · Dashboards & analytics · Student management & admissions · Staff management & payroll · Academic management (classes, subjects, timetables, exams, results) · Attendance (student & staff) · Fees & accounting · Library · Laboratory · Transport & live tracking · Sports/activities · Communication, notifications & chat · Document generation from dynamic templates · Ratings & feedback · Recycle bin & PIN-delete · Calendar & scheduling · Live video · Bilingual UI · System configuration.

### 2.3 User classes (the 14 roles)
Super Admin · Admin · Principal · Accountant · Receptionist · Librarian · Lab Assistant · Examiner · Sports Coach (& other activities) · Class Teacher / Subject Teacher · Bus Driver (& Helper) · Other Staff · Parent · Student.

### 2.4 Operating environment
React web app (Vite + React 18 + TS), responsive for desktop/tablet/phone; modern evergreen browsers; data persisted in browser storage; designed for future Android/iOS via a wrapper.

### 2.5 Design & implementation constraints
- Must be built with the stack in `01_MASTER_BUILD_PROMPT.md`.
- Bilingual Hindi/English; additional languages addable later.
- All deletes are PIN-protected and route through the recycle bin.
- Upload size limits configurable per media type.
- Government/school ID fields and the admission/student schema must be **dynamic** (schools add custom fields).

### 2.6 Assumptions & dependencies
- One running school instance per Admin; Super Admin oversees all.
- Simulated integrations may be swapped for real ones without UI rework.
- Time-based rules (e.g., 15-day purge, same-day attendance edit) evaluate against the device clock.

---

## 3. System roles & RBAC

### 3.1 General
- **FR-RBAC-1** Each role has a dedicated login and a permission set that constrains routes, menu items, and actions.
- **FR-RBAC-2** Every login page exposes: Username/Email, Password, Login button, Forgot Password. (Applies to all roles.)
- **FR-RBAC-3** Unauthorized navigation is blocked (403) both in the router and the UI.
- **FR-RBAC-4** The sidebar and action menus render only the items permitted for the current role and only services that are currently active + unhidden.

### 3.2 Super Admin authority
- **FR-RBAC-5** Super Admin has full control / access to all members and modules.
- **FR-RBAC-6** Super Admin can set any member Active/Inactive.
- **FR-RBAC-7** Super Admin can Hide/Unhide any service/option.
- **FR-RBAC-8** Super Admin and Admin can activate/deactivate any member (student/teacher/staff).
- **FR-RBAC-9** If Super Admin deactivates an Admin, **all members of that school are deactivated** and cannot log in.
- **FR-RBAC-10** Deactivation disables **login only**; all data remains safe and unchanged.

### 3.3 Delete governance
- **FR-RBAC-11** All delete permissions are controlled by Admin. Admin may grant selected delete permissions to the Principal; major/sensitive deletions remain Admin-only.
- **FR-RBAC-12** Any deletion requires PIN verification, then a Yes/No confirmation, then moves the item to the Recycle Bin.
- **FR-RBAC-13** Recycle Bin items auto-delete after 15 days; can be permanently deleted immediately or restored anytime before expiry.

### 3.4 Per-role permission allow/deny lists
Built verbatim from the PDF "Permissions (Software Side)" slides. Summarized; enforce exactly.

| Role | Allowed (✅) | Restricted (❌) |
|---|---|---|
| **Principal** | Academic monitoring & approvals; staff & student supervision; exam approval authority; communication rights; high-level reports | No direct fee collection; no deep accounting edits; no system configuration; no role creation (Admin only); no deletion of financial records |
| **Accountant** | Full finance/fee module; record & verify payments; manage expenses & payroll; generate financial reports; view student financial data | No academic marks editing; no attendance editing; no admission approval; no user-role management; no system-wide settings |
| **Receptionist** | Limited dashboard; inquiry add/edit; visitor entry add; appointment scheduling | No fee modification; no academic-data editing; no system settings |
| **Librarian** | Full library module; add/edit/delete books; issue/return; manage fines; view library reports | No fee management; no payroll; no system-wide settings |
| **Class Teacher** | Access only assigned class; mark/edit attendance; enter internal marks; communicate with parents | No fee management; no payroll; no system settings |
| **Examiner** | Access only assigned subjects/exams; enter & update marks; evaluate answer sheets; view exam reports | No student admission access; no fee management; no payroll; no system configuration |
| **Lab Assistant** | Access only lab module; manage lab inventory; issue/return equipment; view lab schedules; generate lab reports | No student academic editing; no fee management; no payroll; no system settings |
| **Sports Coach** | Access only sports module; manage teams & players; mark sports attendance; update match results; view sports reports | No academic marks access; no fee management; no payroll; no system settings |
| **Bus Driver** | View assigned route & students; mark pickup/drop attendance; update trip status; report incidents; submit vehicle checklist | No student academic access; no fee management; no route-creation rights; no system settings |
| **Parent** | View-only access to child data; pay fees online; apply leave for child; communicate with school; track transport | No data editing (except allowed profile update); no academic marks editing; no administrative access; no system settings |
| **Student** | View own data only; submit assignments; apply leave; access learning materials; view results & attendance | No data editing (except limited profile); no fee-payment control; no marks editing; no administrative access |
| **Admin** | Members CRUD + active/inactive + hide/unhide; full software view; activity oversight; document printing; notifications; inquiry replies; receptionist's digital book; ratings detail | (Admin is the top operational authority; constrained only by Super Admin) |

---

## 4. Functional requirements by role

> Each bullet from the PDF's role slides is a requirement. IDs grouped by area.

### 4.1 Super Admin — `FR-SA`
- FR-SA-1 All-members access / full control.
- FR-SA-2 Set member Active/Inactive.
- FR-SA-3 Service Hide/Unhide.
- FR-SA-4 Activate/deactivate any member; Admin-deactivation cascades to whole school (see FR-RBAC-9/10).
- FR-SA-5 Download students' mark sheets, ID cards, documents and teachers' ID cards/documents via Select-All or individual selection.
- FR-SA-6 An error/empty state must be designed (PDF "ERROR" slide → graceful error page).

### 4.2 Admin — `FR-ADM`
**Admin & Academic access**
- FR-ADM-1 Manage students & teachers.
- FR-ADM-2 Approve admissions.
- FR-ADM-3 Monitor attendance.
- FR-ADM-4 View academic reports.
- FR-ADM-5 Fee-management overview.
- FR-ADM-6 Manage classes & sections.
- FR-ADM-7 Subject allocation.
- FR-ADM-8 Teacher timetable management.
- FR-ADM-9 Exam & result management.
- FR-ADM-10 Promotion of students.

**Accounts access**
- FR-ADM-11 Fee-structure setup. FR-ADM-12 Fee-collection tracking. FR-ADM-13 Generate fee receipts. FR-ADM-14 Salary management. FR-ADM-15 Financial reports. FR-ADM-16 Teacher-recruitment data. FR-ADM-17 Staff attendance. FR-ADM-18 Teachers' leave management. FR-ADM-19 Payroll management.

**Members & oversight**
- FR-ADM-20 Members Create/Edit/Delete/Active/Inactive/Hide/Unhide.
- FR-ADM-21 Full software view: attendance lists, students' & members' performance for all members.
- FR-ADM-22 View all activities performed by every member (activity log/monitor).
- FR-ADM-23 Print mark sheets, admit cards, timetables, ID cards, and other documents (All and one-by-one).
- FR-ADM-24 Send fee notifications or other notifications to any specific student, all students, teachers, all employees, or one-by-one to all members.
- FR-ADM-25 View and reply to all inquiries received on website or app.
- FR-ADM-26 View the digital book maintained by the receptionist.
- FR-ADM-27 Receive complaints/requests directly from any student, parent, or teacher.
- FR-ADM-28 View complete details of any rating/comment a parent/student gives to a teacher/principal/staff (Admin-only visibility).

**Dashboard & analytics**
- FR-ADM-29 School-performance overview; FR-ADM-30 student-strength report; FR-ADM-31 fee-collection summary; FR-ADM-32 attendance analytics; FR-ADM-33 graphs & visual reports.

**Student management**
- FR-ADM-34 Add/edit/delete student; FR-ADM-35 admission approval; FR-ADM-36 student promotion; FR-ADM-37 transfer certificate; FR-ADM-38 student-documents upload.

**Staff management**
- FR-ADM-39 Add teachers & staff; FR-ADM-40 assign roles & permissions; FR-ADM-41 salary management; FR-ADM-42 staff-attendance tracking; FR-ADM-43 performance monitoring.

**Academic management**
- FR-ADM-44 Class & section setup; FR-ADM-45 subject allocation; FR-ADM-46 timetable management; FR-ADM-47 exam & result management; FR-ADM-48 grade-system setup.

**Fee management**
- FR-ADM-49 Fee-structure setup; FR-ADM-50 fee-collection tracking; FR-ADM-51 online-payment monitoring; FR-ADM-52 pending-dues report; FR-ADM-53 receipt generation.

**Attendance monitoring**
- FR-ADM-54 Student-attendance report; FR-ADM-55 staff-attendance report; FR-ADM-56 monthly-attendance summary; FR-ADM-57 absentee alerts.

**Communication**
- FR-ADM-58 SMS notifications; FR-ADM-59 email alerts; FR-ADM-60 notice-board management; FR-ADM-61 parent communication; FR-ADM-62 emergency announcements.

**Transport**
- FR-ADM-63 Bus-route setup; FR-ADM-64 vehicle tracking; FR-ADM-65 driver details; FR-ADM-66 transport-fee management.

**Library**
- FR-ADM-67 Book inventory; FR-ADM-68 issue/return tracking; FR-ADM-69 fine calculation; FR-ADM-70 library reports.

### 4.3 Principal — `FR-PR`
- FR-PR-1 Dashboard: daily school summary, attendance overview, fee-collection snapshot, upcoming events, important alerts.
- FR-PR-2 Student supervision: view records, approve admissions, monitor attendance, check academic performance, issue disciplinary remarks, view transfer requests.
- FR-PR-3 Staff monitoring: view teacher profiles, monitor staff attendance, approve leave requests, assign class teachers, review teacher performance, send notices to staff.
- FR-PR-4 Academic management: approve timetable, monitor syllabus progress, exam-schedule approval, result review & publish approval, class-performance analytics.
- FR-PR-5 Attendance monitoring: daily report, class-wise attendance, defaulter student list, staff-attendance summary, late-coming reports.
- FR-PR-6 Examination control: approve exam schedules, monitor exam progress, view results analytics, topper reports, pass/fail statistics.
- FR-PR-7 Communication & notices: send circulars, publish notices, message parents, message staff, emergency announcements.
- FR-PR-8 Discipline management: student-warning records, suspension management, complaint monitoring, incident reports, counseling records.
- FR-PR-9 Event & activity monitoring: school-event approval, activity calendar, competition results, achievement records.
- FR-PR-10 Reports & analytics: academic-performance, attendance, staff-performance, class-wise comparison, monthly school report.
- FR-PR-11 Honor Principal allow/deny permissions (see §3.4).

### 4.4 Accountant — `FR-AC`
- FR-AC-1 Finance dashboard: daily fee-collection summary, pending-dues overview, expense snapshot, income-vs-expense chart, financial alerts.
- FR-AC-2 Fee management: create receipts, record offline payments, verify online payments, manage concessions/discounts, late-fee calculation, refund processing, installment management.
- FR-AC-3 Fee-structure view (limited): view class-wise structure, apply special discounts, assign transport fee, assign hostel fee.
- FR-AC-4 Due & defaulter tracking: student-wise pending fees, class-wise defaulter list, send reminders, generate due reports, auto-fine tracking.
- FR-AC-5 Payroll support: process staff salary, generate salary slips, PF/ESI tracking, bonus & deductions, salary reports.
- FR-AC-6 Financial reports: daily collection, monthly income, expense, balance summary, fee-head report, audit report.
- FR-AC-7 Expense management: add expenses, categorize, upload bills/vouchers, vendor-payment records, monthly expense report.
- FR-AC-8 Receipt & invoice management: generate, print, email, duplicate receipt, payment history.
- FR-AC-9 Bank & payment reconciliation: online-payment verification, bank reconciliation, gateway report, failed-transaction tracking.
- FR-AC-10 Finance communication: fee-reminder SMS, payment-confirmation SMS, due alerts to parents, receipt email.
- FR-AC-11 Full accounting management: P&L, total expenses, salary payments, fee collections, all transactions; reports visible to Admin.
- FR-AC-12 Apply student-wise discounts/concessions/special offers on Admin/Principal-created class-wise structures.
- FR-AC-13 Approve/track teacher expense uploads & reimbursement requests into accounting/P&L.
- FR-AC-14 Make manual entries for expenses, income, or any school financial transaction.
- FR-AC-15 Send notifications to all/selected students individually (fee reminders, pending-payment notices per outstanding amount).
- FR-AC-16 Honor Accountant allow/deny permissions (see §3.4).

### 4.5 Receptionist — `FR-RC`
- FR-RC-1 Student-inquiry management: handle admission inquiries, provide school info, record walk-in/phone inquiries, schedule campus visits/meetings.
- FR-RC-2 Admission assistance: share forms & guidelines, collect/verify basic documents, forward applications to admin/principal, track status.
- FR-RC-3 Visitor management: register visitor entries, issue visitor passes, maintain daily visitor logs, notify concerned staff.
- FR-RC-4 Front-desk communication: attend calls, transfer to departments, respond to basic email queries, make announcements.
- FR-RC-5 Student & parent support: provide timetable/basic info, fee-counter guidance, ID-card/document query help, address & forward general complaints.
- FR-RC-6 Appointment scheduling: book meetings with teachers/principal, manage appointment calendar, send reminders.
- FR-RC-7 Record maintenance: inquiry database, update contacts, dispatch/receive records, courier/post records.
- FR-RC-8 Basic reports: daily inquiry, visitor, call-log, appointment reports.
- FR-RC-9 Maintain Visitor Book online (Admin/Principal can view & monitor).
- FR-RC-10 Manage complete courier/postal records (company, sender/receiver, pickup date/time, tracking number, delivery status, payment amount, full history) shareable with Accountant/Principal/Admin.
- FR-RC-11 Honor Receptionist allow/deny permissions (see §3.4).

### 4.6 Librarian — `FR-LB`
- FR-LB-1 Book-catalog management: add, edit/update, remove damaged/lost, manage categories/subjects, maintain ISBN & author records.
- FR-LB-2 Issue & return: issue to students/staff, accept returns, auto-track due dates, calculate/apply late fines, view issued-book history.
- FR-LB-3 Member management: register students/staff as members, activate/deactivate memberships, view borrowing limits, maintain member profiles.
- FR-LB-4 Inventory: available-vs-issued tracking, identify lost/damaged, manage stock levels, periodic stock verification.
- FR-LB-5 Fine management: auto-calculate overdue fines, record fine payments, generate fine reports, waive fines (if permitted).
- FR-LB-6 Reservation/hold: reserve books, manage waiting list, notify on availability, cancel/modify reservations.
- FR-LB-7 Reports: issued-books, overdue-books, fine-collection, most-issued-books, library-usage statistics.
- FR-LB-8 Digital library (optional): upload e-books/PDFs, manage digital resources, provide download access, track digital usage.
- FR-LB-9 Honor Librarian allow/deny permissions (see §3.4).

### 4.7 Class Teacher & Subject Teacher — `FR-TC`
- FR-TC-1 Class management: view assigned class/section, manage class student list, update class profile, promote students (if permitted).
- FR-TC-2 Attendance: mark daily attendance, edit within permission (same-day; later only Principal/Admin), monthly reports, send absence notifications.
- FR-TC-3 Homework & classwork: assign homework, upload classwork material, set submission deadlines, review submissions.
- FR-TC-4 Result & report card: enter internal-assessment marks, view subject-wise performance, generate report cards, add teacher remarks.
- FR-TC-5 Student behavior & remarks: add discipline remarks, record achievements, maintain notes, track progress.
- FR-TC-6 Parent communication: send messages, schedule PTM, share notices, respond to queries.
- FR-TC-7 Timetable access: view class timetable, view substitution schedule, get exam schedule.
- FR-TC-8 Subject Teachers submit subject-wise marks → forwarded to Class Teacher for verification → approve individually or all → results displayed to students.
- FR-TC-9 Class Teachers can prepare results, generate admit cards, manage test marks directly from the student's profile; all such actions are visible to the student.
- FR-TC-10 Class Teachers can upload photos/details of classroom activities, lessons taught, classwork, homework — shown only to that class's parents & students.
- FR-TC-11 Class & Subject Teachers can create chat groups with their class's students and parents.
- FR-TC-12 Teachers can schedule extra classes; parents & students get notifications with date, start time, end time.
- FR-TC-13 Honor Class-Teacher allow/deny permissions (see §3.4).

### 4.8 Examiner — `FR-EX`
- FR-EX-1 Exam-paper management: upload question papers, set exam instructions, assign subject-wise papers, verify paper formats, maintain confidentiality.
- FR-EX-2 Answer-sheet evaluation: evaluate sheets, enter marks, upload practical/internal marks, save draft & finalize, recheck if required.
- FR-EX-3 Marks verification: cross-check entered marks, lock marks after final submission, flag discrepancies, send for approval if workflow exists.
- FR-EX-4 Exam-duty management: view duty schedule, download seating plans, view guidelines, report malpractice.
- FR-EX-5 Reports: subject-wise result, marks-entry status, pending-evaluation, examiner-workload.
- FR-EX-6 Result-processing support: view compiled results, suggest grace marks (if permitted), add examiner remarks, verify pass/fail status.
- FR-EX-7 Honor Examiner allow/deny permissions (see §3.4).

### 4.9 Lab Assistant — `FR-LA`
- FR-LA-1 Laboratory inventory: add/update equipment, track chemicals & consumables, maintain stock levels, record damaged/expired, manage lab categories (Physics/Chemistry/Computer etc.).
- FR-LA-2 Lab issue & return: issue equipment to teachers/students, record returns, track pending returns, maintain usage history, generate issue slips.
- FR-LA-3 Practical-session support: view practical timetable, prepare lab before classes, mark lab attendance (if enabled), assist during experiments, record practical completion.
- FR-LA-4 Maintenance & safety: log equipment maintenance, schedule servicing, record safety checks, report hazards/incidents, maintain compliance records.
- FR-LA-5 Lab-booking management: view booking requests, approve/forward, manage availability, avoid conflicts.
- FR-LA-6 Reports: inventory stock, issue/return, damage/loss, practical usage, maintenance.
- FR-LA-7 Digital lab resources (optional): upload manuals, share guidelines, maintain digital experiment records, provide download access.
- FR-LA-8 Honor Lab-Assistant allow/deny permissions (see §3.4).

### 4.10 Sports Coach — `FR-SP`
- FR-SP-1 Team & player management: view assigned sports/teams, add/update player profiles, maintain rosters, track fitness, record achievements.
- FR-SP-2 Practice & training: create schedules, mark practice attendance, plan drills/sessions, upload materials, track skill development.
- FR-SP-3 Sports-event management: manage inter-school competitions, register teams, create fixtures, update results, maintain tournament records.
- FR-SP-4 Performance tracking: record stats, maintain fitness reports, track improvement, identify top performers, generate analytics.
- FR-SP-5 Equipment & ground: request equipment, track issued items, report damaged equipment, view ground availability, manage ground bookings.
- FR-SP-6 Attendance: mark sports attendance, view absentee reports, track participation, generate summaries.
- FR-SP-7 Communication: notices to players/parents, share match schedules, notify practice changes, coordinate with management.
- FR-SP-8 Reports & certificates: player-performance reports, tournament-participation reports, achievement-certificate data, sports-activity reports.
- FR-SP-9 Sports module is dynamic — schools create/manage categories (dance, music, sports, karate, swimming, other optional activities).
- FR-SP-10 Honor Sports-Coach allow/deny permissions (see §3.4).

### 4.11 Bus Driver (& Helper) — `FR-BD`
- FR-BD-1 Route & trip management: view assigned route, daily trip schedule, pickup/drop points, follow route map/navigation, mark trip start/end.
- FR-BD-2 Student pickup & drop: view route student list, mark boarding, mark drop-off, report absence, handle missed-pickup alerts.
- FR-BD-3 Transport attendance: maintain transport attendance, auto-sync with transport module, daily transport summary, report irregularities.
- FR-BD-4 Live tracking support: enable GPS, share real-time location, update trip status, notify delays.
- FR-BD-5 Incident & safety: report breakdowns, log accidents/incidents, report route issues, submit emergency alerts, record safety checks.
- FR-BD-6 Vehicle status & maintenance: daily vehicle checklist, fuel status, maintenance needs, log condition, view service schedule.
- FR-BD-7 Communication: receive route updates, emergency messages, contact transport manager, receive parent notifications (view-only).
- FR-BD-8 Driver/Helper can view total students assigned, with present & absent counts, to track pickups/drop-offs.
- FR-BD-9 Honor Bus-Driver allow/deny permissions (see §3.4).

### 4.12 Other Staff — `FR-OS`
- FR-OS-1 Provide a generic staff role with profile, attendance, leave, notices, chat, expense upload/reimbursement, and document access, constrained by Admin-assigned permissions. (PDF lists "Other Staff" as a role; treat as a configurable, minimal-by-default staff profile.)

### 4.13 Parent — `FR-PA`
- FR-PA-1 Student-profile access: child's basic details, class & section, admission info, ID-card details, academic profile.
- FR-PA-2 Attendance monitoring: daily attendance, monthly report, absence/present alerts, late-arrival records.
- FR-PA-3 Homework & assignments: view homework, download materials, check submission status, view teacher remarks, track pending work.
- FR-PA-4 Exam & result: view exam timetable, subject-wise marks, download report cards, performance analytics, track progress.
- FR-PA-5 Fee management: view structure, check dues, pay online (if enabled), download receipts, view payment history.
- FR-PA-6 Communication: chat/message teachers, receive notices, emergency alerts, view circulars/announcements, respond to messages.
- FR-PA-7 Transport tracking: view assigned bus, track live location, pickup/drop notifications, view route, delay alerts.
- FR-PA-8 Leave application: apply for child's leave, track status, view history, upload supporting docs.
- FR-PA-9 Event & activity updates: view events, participation details, sports/cultural updates, download circulars.
- FR-PA-10 Parents with multiple children log in with a single mobile number, view all children's profiles, select any child for details.
- FR-PA-11 View previous-class mark sheets anytime; view child's rank.
- FR-PA-12 Honor Parent allow/deny permissions (see §3.4).

### 4.14 Student — `FR-ST`
- FR-ST-1 Profile & academic info: view profile, class & section, admission details, ID card, update limited profile (if allowed).
- FR-ST-2 Attendance tracking: daily attendance, monthly attendance, absence alerts, late/half-day records.
- FR-ST-3 Homework & assignments: view homework, download materials, upload submissions, check status, view feedback.
- FR-ST-4 Online learning (if enabled): access video lectures, join live classes, download notes, attempt quizzes, track course progress.
- FR-ST-5 Exams & results: view timetable, subject-wise marks, download report cards, view rank/grade, analyze performance.
- FR-ST-6 Fee information (view only): view structure, check dues, view payment history, download receipts (if permitted).
- FR-ST-7 Leave application: apply, view status, check history, upload documents.
- FR-ST-8 Library access: search books, view issued books, check due dates, view fine details, reserve books (if enabled).
- FR-ST-9 Transport info: view route, pickup/drop timing, track live bus (if enabled), delay alerts.
- FR-ST-10 Communication & notices: receive notices, view announcements, message teachers (if allowed), event updates, download circulars.
- FR-ST-11 Rate Subject/Class Teacher 1–5 (only Admin sees who rated; teacher sees summary only).
- FR-ST-12 Access complete details of Subject/Class Teachers (subjects assigned, schedules, class timings, teaching duration, all school-provided info).
- FR-ST-13 Honor Student allow/deny permissions (see §3.4).

---

## 5. Shared / cross-domain functional requirements

### 5.1 Communication & chat — `FR-COM`
- FR-COM-1 Multi-channel Notification Center: compose & send via WhatsApp, SMS, Email, and push; recipients = one / selected / group / all (students, parents, teachers, all employees, member-wise one-by-one); maintain a sent log. (WhatsApp/SMS/Email APIs simulated.)
- FR-COM-2 Parents & Students can send messages directly from the app to any Teacher, Principal, or Admin.
- FR-COM-3 Admin can create chat groups and add members individually or select-all (WhatsApp-style).
- FR-COM-4 Principal can create chat groups with Students, Parents, and Staff (individual or selection).
- FR-COM-5 Class/Subject Teachers can create chat groups with their class's students and parents.
- FR-COM-6 Bell notification rings on the device when a teacher's subject period ends.
- FR-COM-7 Attendance-status notifications to parents (Present/Absent/Leave).
- FR-COM-8 SMS Gateway/API integration; WhatsApp API integration; Email API integration (all simulated with a clear send→log experience).

### 5.2 Attendance — `FR-ATT`
- FR-ATT-1 Student & staff attendance with mark/edit, monthly summaries, absentee alerts.
- FR-ATT-2 Class Teacher edits attendance only on the same day (Absent↔Present); thereafter only Principal/Admin.
- FR-ATT-3 Attendance popup (quick-mark UI).
- FR-ATT-4 Staff attendance recorded via attendance machine; once marked, visible to Accountant & Admin; salaries generated from this data. (Biometric import simulated.)

### 5.3 Exams, marks & results — `FR-MRK`
- FR-MRK-1 Subject Teacher enters subject-wise marks → Class Teacher verifies → approves one-by-one or Approve-All → results published to students.
- FR-MRK-2 Test results created in-app via the same workflow.
- FR-MRK-3 Auto-promotion: students who pass are promoted to the next class.
- FR-MRK-4 Mark sheets customizable school-wise, supporting both percentage and grade systems.
- FR-MRK-5 Student rank shown to Parents & Students; previous-class mark sheets viewable anytime.

### 5.4 Fees & accounting — `FR-FEE`
- FR-FEE-1 Admin/Principal create class-wise fee structures; Accountant applies student-wise discounts/concessions/offers.
- FR-FEE-2 Display pending & due payments (amount remaining vs paid), visible to Admin, Principal, Accountant.
- FR-FEE-3 Auto-generate & display downloadable payment receipts for every payment.
- FR-FEE-4 Teacher/staff expense upload (bill + amount + description) → visible to Admin & Accountant → added to accounting/P&L; reimbursement requests supported.
- FR-FEE-5 Payment gateway (simulated checkout that updates balances and emits receipts).
- FR-FEE-6 Application service charges displayed to Parents & Students.

### 5.5 Transport — `FR-TRN`
- FR-TRN-1 Admin/Principal manage bus assignments; track bus-wise student data by bus number (totals, lists, full transport details).
- FR-TRN-2 Live bus tracking for Parents/Principal/Admin: route, current location, movement status, speed, full bus details in real time. (Simulated mover.)
- FR-TRN-3 Bus speed visible to Parents, Class Teachers, Principal, Admin; Admin sets a speed limit (e.g., 80 km/h); exceeding it notifies Parents, Admin, Class Teachers.
- FR-TRN-4 Optional in-school-hours student live location, school-toggleable.

### 5.6 Documents, templates & data portability — `FR-DOC`
- FR-DOC-1 Multiple dynamic, switchable templates for Mark Sheets, Admit Cards, ID Cards; Admin/Principal choose & apply any design from the template list.
- FR-DOC-2 Print/download Mark Sheets, Admit Cards, Timetables, ID Cards, and other documents via Select-All or one-by-one, with search to find student documents.
- FR-DOC-3 Search & download for all homepage features, exporting to Excel and PDF.
- FR-DOC-4 Download manual register data into the app for digital access/record keeping.
- FR-DOC-5 Class-wise subject timetables assigned to Parents & Students to view.

### 5.7 Profiles, identity & school info — `FR-PRF`
- FR-PRF-1 Student profile includes SSMID, Roll Number, Samagra ID, Scholar ID, APAAR ID, etc.; dynamic to add custom fields.
- FR-PRF-2 Store complete school details: School Name, DISE Code, License Number, Address, Website, App info, and custom details.
- FR-PRF-3 Members' profiles include school social-media links (Facebook, Twitter/X, LinkedIn, Instagram, YouTube), backend-managed, click-through.
- FR-PRF-4 Students & staff view complete profile details: total leaves, attendance records, documents, ratings, overall performance.
- FR-PRF-5 Admission & student-detail system fully dynamic (schools add/manage custom fields).

### 5.8 Engagement & home widgets — `FR-HOME`
- FR-HOME-1 App front page shows the class topper's photo, rating, and performance for Parents & Students.
- FR-HOME-2 Homepage shows the highest-rated teacher of the class for Students & Parents.
- FR-HOME-3 Top-3 students/teachers shown on a slider page (top 3 of the class).
- FR-HOME-4 Classroom-activity feed (from Class Teacher) shown only to that class's parents & students.

### 5.9 Ratings & feedback — `FR-RAT`
- FR-RAT-1 Students rate teachers 1–5; only Admin can see which student rated; teachers see only their overall summary.
- FR-RAT-2 Any rating/comment detail given to teacher/principal/staff is visible only to Admin.

### 5.10 Leave, calendar & scheduling — `FR-CAL`
- FR-CAL-1 Parents & Students apply for leave via a structured, dynamic form (reasons like fever/other) → forwarded to Class Teacher → accept/reject → status notified to both.
- FR-CAL-2 Staff leave requests → Principal approval.
- FR-CAL-3 Preloaded school holiday calendar shown to Parents, Students, Teachers (teachers see their holidays; students see academic holidays).
- FR-CAL-4 Day-wise subject scheduling kept dynamic; Admin & Class Teachers define which subject is taught on which day.
- FR-CAL-5 Extra classes scheduled by teachers with date/start/end notifications.
- FR-CAL-6 Appointment scheduling (receptionist) with reminders.

### 5.11 Content & media — `FR-MED`
- FR-MED-1 Upload & share multiple formats (audio, video, PDF, JPG, and other supported types) by Teachers/Admin/Principal/staff.
- FR-MED-2 Upload restrictions per media type (configurable size limits, e.g., images ≤1–2 MB, videos separate).
- FR-MED-3 Online syllabus books: uploaded in-app, read with page-by-page navigation or jump-to-page.
- FR-MED-4 School prayer added with audio or video and text format.
- FR-MED-5 Live video for streaming classes/events: Teacher→Student/Parent/all; Principal→teachers/students/all; Admin→all/teachers/students; or member-wise one-by-one; live classes or live events. (Simulated room.)

### 5.12 Recycle bin & data safety — `FR-BIN`
- FR-BIN-1 PIN-protected delete + Yes/No confirm → Recycle Bin; 15-day auto-purge; immediate-permanent or restore options.
- FR-BIN-2 Delete permissions controlled by Admin; selective grant to Principal; sensitive deletions Admin-only.
- FR-BIN-3 Deactivation disables login only; data retained.

### 5.13 Localization — `FR-LOC`
- FR-LOC-1 App & web available in Hindi and English with a live switcher; additional languages addable later.

---

## 6. Non-functional requirements

- **NFR-1 Usability/UX:** Professional, elegant, consistent UI per `05_DESIGN_SYSTEM.md`; smooth micro-interactions; clear empty/loading/error states; no more than 2–3 clicks to common tasks.
- **NFR-2 Accessibility:** WCAG-minded — keyboard navigation for all interactive elements; focus management in modals/menus; sufficient contrast in both themes; ARIA labels; visible focus rings.
- **NFR-3 Responsiveness:** Works from 360px phones to large desktops; sidebar→drawer; tables→cards/scroll; no overflow/clipping.
- **NFR-4 Performance:** Fast initial load and route transitions; code-split per role/feature; virtualize very long lists where needed.
- **NFR-5 Reliability/Data integrity:** Persistent storage; no data loss on reload; deletions reversible for 15 days; consistent activity logging.
- **NFR-6 Security (app-level):** RBAC enforced in router + UI; PIN gate on destructive actions; deactivation blocks login; sensitive ratings visible only to Admin. (Demo-grade; real auth/crypto on backend upgrade.)
- **NFR-7 Maintainability:** TypeScript types; shared components; domain services; clear folder structure; no duplicated tables/modals.
- **NFR-8 Internationalization:** All strings externalized to i18n bundles (en/hi); date/number formatting locale-aware.
- **NFR-9 Theming:** Light/dark via tokens; brandable (school logo/colors).
- **NFR-10 Extensibility:** Dynamic fields (admission/student/sports/timetable); pluggable templates; services swappable for real APIs without UI rework.
- **NFR-11 Auditability:** Activity log of create/update/delete/approve/login per actor & role; Admin can view all member activity.
- **NFR-12 Portability:** Export to Excel & PDF; printable documents; manual-register import.

---

## 7. Additional School Demands (the 78 cross-cutting requirements) — `FR-X`

All 78 numbered demands from PDF pages 70–82, captured verbatim in intent. **All are mandatory.**

1. FR-X-1 Admin can view all activities performed by every member.
2. FR-X-2 Admin can print mark sheets, admit cards, timetables, ID cards, and other documents (All and one-by-one).
3. FR-X-3 Admin can send fee/other notifications to any specific student, all students, teachers, all employees, or one-by-one to all members.
4. FR-X-4 Admin can view and reply to all inquiries from website/app.
5. FR-X-5 Admin can view the receptionist's digital book.
6. FR-X-6 Any student/parent/teacher can submit a complaint or request directly to Admin.
7. FR-X-7 Ratings/comments for any staff are visible in full only to Admin.
8. FR-X-8 Attendance popup.
9. FR-X-9 Admin, Principal, Class Teachers, Parents, Students can view attendance & performance by member or for all students (scoped to permissions).
10. FR-X-10 Parents/Students message any Teacher/Principal/Admin from the app; Class Teachers prepare results, generate admit cards, and manage test marks from the student's profile, visible to the student.
11. FR-X-11 Admin can create chat groups, add members individually or select-all (WhatsApp-style).
12. FR-X-12 Class & Subject Teachers can create chat groups with their class students and parents.
13. FR-X-13 Principal can create chat groups with Students/Parents/Staff (individual or selection).
14. FR-X-14 Transport live bus tracking for Parents/Principal/Admin: routes, current location, movement status, speed, full details in real time.
15. FR-X-15 In-school-hours student live location; school-toggleable (optional).
16. FR-X-16 Super Admin/Admin/Class Teachers print or download Mark Sheets, Admit Cards, Timetables, ID Cards, and other documents via Select-All or individual selection; search to find student documents.
17. FR-X-17 Accountant sends app notifications to all/selected students individually (fee reminders & pending-payment notices per outstanding amount).
18. FR-X-18 Students access complete Subject/Class-Teacher details (subjects, schedules, class timings, teaching duration, all school-provided info).
19. FR-X-19 Admission/other inquiries from the website visible to Admin/Principal/Receptionist; Admin notified of Principal/Receptionist actions (follow-ups, approvals, rejections).
20. FR-X-20 Receptionist maintains the Visitor Book online; Admin/Principal view & monitor all visitor records.
21. FR-X-21 Receptionist manages complete courier/postal records (company, sender/receiver, pickup date/time, tracking number, delivery status, payment amount, full history); shareable with Accountant/Principal/Admin.
22. FR-X-22 Students/Parents/members submit direct member-wise complaints to Principal or Admin with full details & supporting info.
23. FR-X-23 Admin/Principal create class-wise fee structures; Accountant later applies student-wise discounts/concessions/special offers.
24. FR-X-24 Accountant handles full accounting (P&L, total expenses, salary payments, fee collections, all transactions); reports visible to Admin.
25. FR-X-25 Teacher/staff expense upload (bill + amount + description) → visible to Admin & Accountant → added to accounting/P&L; reimbursement requests supported.
26. FR-X-26 Accountant makes manual entries for expenses/income/any school financial transaction.
27. FR-X-27 Students rate Subject/Class Teacher 1–5; only Admin sees who rated; teachers see only overall summary.
28. FR-X-28 Admin can hide/unhide and activate/deactivate each option/service individually.
29. FR-X-29 App front page shows the class topper's photo, rating, and performance for Parents & Students.
30. FR-X-30 Homepage shows the highest-rated teacher of the class for Students & Parents.
31. FR-X-31 Class Teachers upload classroom activity/lesson/classwork/homework photos & details, shown only to that class's parents & students.
32. FR-X-32 App/web provides search & download for all homepage features, exporting to Excel and PDF.
33. FR-X-33 All member profiles include school social-media links (Facebook, Twitter/X, LinkedIn, Instagram, YouTube), backend-managed, click-through.
34. FR-X-34 Students & staff view complete profile details: total leaves, attendance, documents, ratings, overall performance.
35. FR-X-35 Marks workflow: Subject Teacher submits subject-wise marks → Class Teacher verifies → approve individually or all → results shown to students.
36. FR-X-36 Delete requires PIN → Yes/No confirm → Recycle Bin; 15-day auto-purge; immediate-permanent or restore anytime.
37. FR-X-37 All delete permissions controlled by Admin; Admin may grant selected delete permissions to Principal; major/sensitive deletions Admin-only.
38. FR-X-38 Students who pass are auto-promoted to the next class.
39. FR-X-39 Admin/Principal manage bus assignments & track bus-wise student data by bus number (totals, lists, full transport details).
40. FR-X-40 Bus Drivers/Helpers view total students assigned with present/absent counts for accurate pickup/drop.
41. FR-X-41 Teachers/Admin/Principal/staff upload & share multiple formats (audio, video, PDF, JPG, others).
42. FR-X-42 Class Teachers edit attendance (Absent↔Present) only on the same day; thereafter only Principal/Admin.
43. FR-X-43 SMS Gateway/API integration for automated messages & notifications.
44. FR-X-44 Teacher/staff salaries calculated from attendance; salary & attendance details provided to Accountant.
45. FR-X-45 All staff attendance via attendance machine; once marked, visible to Accountant & Admin; salaries generated from this data.
46. FR-X-46 Display complete pending/due payment details (remaining vs paid), visible to Admin/Principal/Accountant.
47. FR-X-47 Admin/Super Admin download students' mark sheets/ID cards/documents and teachers' ID cards/documents via Select-All or individual.
48. FR-X-48 Super Admin/Admin activate/deactivate any member (student/teacher/staff).
49. FR-X-49 If Super Admin deactivates the Admin, all members of that school are deactivated and cannot log in.
50. FR-X-50 Deactivation disables login only; all data remains safe & unchanged.
51. FR-X-51 Multiple dynamic templates for Mark Sheets, Admit Cards, ID Cards; Admin/Principal choose & apply any design.
52. FR-X-52 Mark sheets customizable school-wise, supporting both percentage and grade systems; each school configures its own format.
53. FR-X-53 Upload restrictions for images/videos/files (separate size limits per type, e.g., ≤1–2 MB).
54. FR-X-54 Class-wise subject timetables created and assigned to Parents & Students to view.
55. FR-X-55 Admin/Class Teacher/Accountant/other staff send notifications via WhatsApp (WhatsApp API integration).
56. FR-X-56 Download the school's manual register data into the app for digital access/record keeping.
57. FR-X-57 Admission/student-detail system fully dynamic (custom fields per school).
58. FR-X-58 Notify parents of the student's daily attendance status (Present/Absent/Leave).
59. FR-X-59 Parents/Students apply for leave via a structured dynamic form → forwarded to Class Teacher → accept/reject → status notified to both.
60. FR-X-60 Students/Parents access class syllabus books online (page-by-page navigation or jump-to-page).
61. FR-X-61 Students/Parents view previous-class mark sheets anytime.
62. FR-X-62 Parents with multiple children log in with a single mobile number, view all children's profiles, select any child for details.
63. FR-X-63 Sports module dynamic — schools create/manage categories (dance, music, sports, karate, swimming, other optional activities).
64. FR-X-64 Preloaded detailed holiday calendar shown to Parents/Students/Teachers (teachers see their holidays; students see academic holidays).
65. FR-X-65 Day-wise subject scheduling kept dynamic; Admin & Class Teachers define which subject is taught on which day.
66. FR-X-66 School prayer added with audio or video and text format.
67. FR-X-67 Bell notification rings on the device when a teacher's subject period ends.
68. FR-X-68 Test results created in-app; Subject Teachers enter marks → Class Teacher verifies → approve one-by-one or Approve-All → results visible to students.
69. FR-X-69 Parents/Students send messages to their Class Teacher or Principal through the app.
70. FR-X-70 Bus speed visible to Parents/Class Teachers/Principal/Admin; Admin sets speed limit (e.g., 80 km/h); exceeding it notifies Parents/Admin/Class Teachers.
71. FR-X-71 Top-3 students/teachers shown on a slider page (top 3 of the class).
72. FR-X-72 Student profile includes SSMID, Roll Number, Samagra ID, Scholar ID, APAAR ID, etc. (dynamic, add custom fields); store complete school details (Name, DISE Code, License Number, Address, Website, App info, custom).
73. FR-X-73 Student's class rank shown to Parents & Students.
74. FR-X-74 Teachers schedule extra classes; Parents & Students get notifications with date, start time, end time.
75. FR-X-75 Application service charges displayed to Parents & Students.
76. FR-X-76 App & web available in Hindi and English.
77. FR-X-77 Generate & display downloadable payment receipts for every fee paid.
78. FR-X-78 Live video for streaming classes/events (Teacher→Student/Parent/all; Principal→teachers/students/all; Admin→all/teachers/students; member-wise; live class/event).

---

## 8. External interface & integration requirements (PDF page 83)

- **EI-1 Platform:** React; web + app; designed for Android and iOS (this build = responsive web; wrapper path noted).
- **EI-2 Languages:** Hindi and English; additional languages addable in future.
- **EI-3 Attendance machine:** biometric punch import → staff attendance → salary. (Simulated import.)
- **EI-4 WhatsApp API, SMS API, Email API:** outbound notifications. (Unified, simulated Notification Center with send→log.)
- **EI-5 Payment Gateway:** online fee payment → receipts → balance updates. (Simulated checkout.)
- **EI-6 Maps/GPS:** live bus tracking, location, speed. (Simulated mover on a real map.)
- **EI-7 Live video:** class/event streaming. (Simulated room shell.)

---

## Appendix A — Requirements Traceability Matrix (every PDF page → coverage)

> Proves nothing was dropped. Each PDF page maps to requirement IDs above.

| PDF Pages | Content | Covered by |
|---|---|---|
| 1–3 | Cover, project overview, role list | §2.3, all role sections |
| 4–5 | Super Admin: all-access, active/inactive, hide/unhide; ERROR slide | FR-SA-1..6, FR-RBAC-5..10, NFR (error state) |
| 6–8 | Admin & academic & accounts access; members CRUD; oversight; print docs; notifications; inquiries; digital book; complaints; ratings | FR-ADM-1..28 |
| 9–13 | Admin dashboard/analytics; student/staff/academic/fee/attendance/communication/transport/library management | FR-ADM-29..70 |
| 14 | Principal login | FR-RBAC-2 |
| 15–19 | Principal dashboard, supervision, monitoring, academics, attendance, exams, communication, discipline, events, reports | FR-PR-1..10 |
| 20 | ERROR slide | NFR error state |
| 21 | Principal permissions allow/deny | FR-PR-11, §3.4 |
| 22 | Accountant login | FR-RBAC-2 |
| 23–26 | Accountant dashboard, fee mgmt, structure view, dues/defaulters, payroll, reports, expenses, receipts, reconciliation, finance comms | FR-AC-1..10 |
| 27 | Accountant permissions | FR-AC-16, §3.4 |
| 28 | Receptionist login | FR-RBAC-2 |
| 29–31 | Receptionist inquiries, admission assist, visitor mgmt, front-desk comms, support, appointments, records, reports | FR-RC-1..8 |
| 32 | Receptionist permissions | FR-RC-11, §3.4 |
| 33 | Librarian login | FR-RBAC-2 |
| 34–36 | Library catalog, issue/return, members, inventory, fines, reservations, reports, digital | FR-LB-1..8 |
| 37 | Librarian permissions | FR-LB-9, §3.4 |
| 38 | Class/Subject Teacher login | FR-RBAC-2 |
| 39–40 | Class mgmt, attendance, homework, results, behavior, parent comms, timetable | FR-TC-1..7 |
| 41 | Class Teacher permissions | FR-TC-13, §3.4 |
| 42 | Examiner login | FR-RBAC-2 |
| 43–44 | Exam paper mgmt, evaluation, verification, duty, reports, result support | FR-EX-1..6 |
| 45 | Examiner permissions | FR-EX-7, §3.4 |
| 46 | Lab Assistant login | FR-RBAC-2 |
| 47–49 | Lab inventory, issue/return, practical support, maintenance/safety, bookings, reports, digital | FR-LA-1..7 |
| 50 | Lab Assistant permissions | FR-LA-8, §3.4 |
| 51 | Sports Coach login | FR-RBAC-2 |
| 52–54 | Teams/players, training, events, performance, equipment/ground, attendance, comms, reports | FR-SP-1..8 |
| 55 | Sports Coach permissions | FR-SP-10, §3.4 |
| 56 | Bus Driver login | FR-RBAC-2 |
| 57–58 | Route/trip, pickup/drop, transport attendance, live tracking, incidents, vehicle status, comms | FR-BD-1..7 |
| 59 | Bus Driver permissions | FR-BD-9, §3.4 |
| 60 | Parent login | FR-RBAC-2 |
| 61–63 | Profile access, attendance, homework, exams, fees, comms, transport, leave, events | FR-PA-1..9 |
| 64 | Parent permissions | FR-PA-12, §3.4 |
| 65 | Student login | FR-RBAC-2 |
| 66–68 | Profile, attendance, homework, online learning, exams, fees, leave, library, transport, comms | FR-ST-1..10 |
| 69 | Student permissions | FR-ST-13, §3.4 |
| 70 | Demands 1–8 | FR-X-1..8 |
| 71 | Demands 9–14 | FR-X-9..14 |
| 72 | Demands 15–19 | FR-X-15..19 |
| 73 | Demands 20–25 | FR-X-20..25 |
| 74 | Demands 26–32 | FR-X-26..32 |
| 75 | Demands 33–37 | FR-X-33..37 |
| 76 | Demands 38–43 | FR-X-38..43 |
| 77 | Demands 44–50 | FR-X-44..50 |
| 78 | Demands 51–57 | FR-X-51..57 |
| 79 | Demands 58–63 | FR-X-58..63 |
| 80 | Demands 64–69 | FR-X-64..69 |
| 81 | Demands 70–75 | FR-X-70..75 |
| 82 | Demands 76–78 | FR-X-76..78 |
| 83 | Tech/platform/integrations | EI-1..7 |
| 84 | Closing | — |

**Coverage statement:** Every content page (1–83) maps to one or more requirements. No requirement from the source PDF is omitted.
