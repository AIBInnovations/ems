# 03 — Personas & User Stories

Format: each role has a **persona** (who they are, goals, frustrations, devices) followed by **user stories** in `As a <role>, I want <capability>, so that <benefit>` form. Key stories include **Acceptance Criteria (AC)** in Given/When/Then. Story IDs: `US-<ROLE>-<n>`.

---

## 1. Super Admin

**Persona — "Rajesh, Platform Owner."** Operates the platform across multiple schools. Tech-comfortable. Needs total control and the ability to switch services on/off and freeze accounts instantly. Works on desktop. Frustrated by systems where disabling something requires a developer.

**Stories**
- US-SA-1 As a Super Admin, I want full access to every member and module, so that I can oversee and intervene anywhere.
- US-SA-2 As a Super Admin, I want to set any member Active/Inactive, so that I can control access centrally.
  - AC: Given a member list, when I toggle a member to Inactive, then their login is blocked and a status pill shows "Inactive", while their data remains intact.
- US-SA-3 As a Super Admin, I want to Hide/Unhide any service, so that schools only see enabled features.
  - AC: Given a services registry, when I hide a service, then it disappears from sidebars and menus for all affected roles; when I unhide, it reappears.
- US-SA-4 As a Super Admin, I want deactivating an Admin to cascade, so that freezing a school is one action.
  - AC: Given a school's Admin, when I deactivate that Admin, then all members of that school become unable to log in; reactivating restores access.
- US-SA-5 As a Super Admin, I want to download students'/teachers' mark sheets, ID cards, and documents via Select-All or one-by-one, so that bulk document handling is fast.
- US-SA-6 As a Super Admin, I want a graceful error page, so that failures are clear and recoverable.

---

## 2. Admin

**Persona — "Meena, School Administrator."** Runs day-to-day operations for one school. High volume of approvals, documents, and communications. Needs oversight of everything and the final say on deletions and permissions. Desktop-primary, phone for alerts.

**Stories (selection; all FR-ADM apply)**
- US-ADM-1 As an Admin, I want to Create/Edit/Delete/Activate/Inactivate/Hide/Unhide members, so that I manage all accounts.
  - AC: Given the member directory, when I create a member, then they appear with a role and login; when I delete, then PIN + confirm is required and the member moves to Recycle Bin.
- US-ADM-2 As an Admin, I want to approve admissions, so that verified students are enrolled.
  - AC: Given a pending admission, when I approve it, then a student record + login is created, the applicant is notified, and the activity is logged.
- US-ADM-3 As an Admin, I want a full software view of attendance and performance for all members, so that I can monitor the whole school.
- US-ADM-4 As an Admin, I want to view all activities performed by every member, so that I have an audit trail.
  - AC: Given the Activity Monitor, when I filter by member/date/action, then I see matching log entries with actor, role, entity, and timestamp.
- US-ADM-5 As an Admin, I want to print mark sheets/admit cards/timetables/ID cards (All and one-by-one), so that document distribution is efficient.
- US-ADM-6 As an Admin, I want to send fee/other notifications to one/all students, teachers, all employees, or member-wise, so that I reach the right audience.
- US-ADM-7 As an Admin, I want to view and reply to website/app inquiries, so that leads are handled.
- US-ADM-8 As an Admin, I want to view the receptionist's digital book (visitor/courier), so that front-desk records are transparent.
- US-ADM-9 As an Admin, I want to receive complaints/requests from any member and see full rating/comment details, so that I handle sensitive feedback privately.
  - AC: Given a teacher rating, when I open it, then I see which student rated and the comment; teachers never see this.
- US-ADM-10 As an Admin, I want dashboards (performance, strength, fee summary, attendance analytics, graphs), so that I get an at-a-glance picture.
- US-ADM-11 As an Admin, I want to set up classes/sections/subjects/timetables/grade systems, so that academics are configured.
- US-ADM-12 As an Admin, I want to control delete permissions and grant selective ones to the Principal, so that destructive power is governed.
- US-ADM-13 As an Admin, I want to choose document templates and configure mark-sheet format (percentage/grade), so that outputs match school style.
- US-ADM-14 As an Admin, I want to manage transport routes/bus assignments and set a bus speed limit, so that transport is safe and tracked.

---

## 3. Principal

**Persona — "Dr. Sharma, Principal."** Academic leader. Focuses on approvals, oversight, discipline, and reports; deliberately walled off from fee collection, accounting edits, and system config. Reviews on desktop and tablet.

**Stories**
- US-PR-1 As a Principal, I want a daily school overview (attendance, fee snapshot, events, alerts), so that I start the day informed.
- US-PR-2 As a Principal, I want to approve admissions and view transfer requests, so that enrollment decisions are mine to endorse.
- US-PR-3 As a Principal, I want to approve leave requests and assign class teachers, so that staffing runs smoothly.
- US-PR-4 As a Principal, I want to approve timetables, exam schedules, and result publishing, so that academic releases are controlled.
  - AC: Given verified results, when I approve publishing, then results become visible to students/parents and the action is logged.
- US-PR-5 As a Principal, I want discipline tools (warnings, suspensions, incidents, counseling), so that conduct is recorded.
- US-PR-6 As a Principal, I want to send circulars/notices/messages and emergency announcements, so that I communicate school-wide.
- US-PR-7 As a Principal, I want high-level analytics (academic, attendance, staff performance, class comparison, monthly report), so that I can steer the school.
- US-PR-8 As a Principal, I want chat groups with students/parents/staff, so that I can broadcast and discuss.
- US-PR-9 As a Principal, I must NOT collect fees, edit accounting, configure the system, create roles, or delete financial records.
  - AC: Given my role, when I attempt a restricted route, then I'm redirected to 403 and the action is unavailable.

---

## 4. Accountant

**Persona — "Anita, Accountant."** Owns money flows: fees, receipts, dues, expenses, payroll, reports. Cannot touch marks, attendance edits, admissions, roles, or system settings. Desktop-primary; prints a lot.

**Stories**
- US-AC-1 As an Accountant, I want a finance dashboard (collection, dues, expenses, income-vs-expense, alerts), so that cash position is clear.
- US-AC-2 As an Accountant, I want to create receipts and record offline / verify online payments, so that all payments are captured.
  - AC: Given a student with dues, when I record a payment, then a receipt is generated, the balance updates, and the payer is notified.
- US-AC-3 As an Accountant, I want to apply student-wise discounts/concessions on class-wise structures, so that special cases are handled.
- US-AC-4 As an Accountant, I want due/defaulter tracking with reminders and reports, so that collections improve.
- US-AC-5 As an Accountant, I want payroll (salary, slips, PF/ESI, bonus/deductions, reports) driven by attendance, so that staff are paid correctly.
  - AC: Given imported attendance, when I process salary, then pay is computed from attendance and a slip is generated.
- US-AC-6 As an Accountant, I want expense management (add, categorize, upload bills, vendor records) and to approve teacher reimbursements, so that spending is tracked in P&L.
- US-AC-7 As an Accountant, I want financial reports (daily/monthly/expense/balance/fee-head/audit) and bank reconciliation, so that books are auditable; reports are visible to Admin.
- US-AC-8 As an Accountant, I want to send fee reminders/pending-payment notices to all/selected students individually, so that parents are nudged by amount owed.
- US-AC-9 As an Accountant, I must NOT edit marks/attendance, approve admissions, manage roles, or change system settings.

---

## 5. Receptionist

**Persona — "Pooja, Front Desk."** First point of contact. Handles inquiries, visitors, appointments, courier, and basic support. Limited dashboard; cannot modify fees/academics/settings. Desktop at the desk.

**Stories**
- US-RC-1 As a Receptionist, I want to log walk-in/phone/website admission inquiries and track status, so that no lead is lost.
  - AC: Given a new inquiry, when I save it, then it appears for Admin/Principal/Receptionist and status changes are notified to Admin.
- US-RC-2 As a Receptionist, I want to share forms/guidelines, verify basic documents, and forward applications, so that admissions move forward.
- US-RC-3 As a Receptionist, I want to register visitors, issue passes, maintain the online Visitor Book, and notify staff, so that the front desk is secure and logged.
- US-RC-4 As a Receptionist, I want to manage courier/postal records (company, sender/receiver, pickup, tracking, status, amount, history) and share with Accountant/Principal/Admin, so that dispatch is tracked.
- US-RC-5 As a Receptionist, I want to schedule appointments with teachers/principal and send reminders, so that meetings are organized.
- US-RC-6 As a Receptionist, I want basic reports (inquiries, visitors, call log, appointments), so that I can summarize the day.
- US-RC-7 As a Receptionist, I must NOT modify fees, edit academic data, or access system settings.

---

## 6. Librarian

**Persona — "Karan, Librarian."** Manages catalog, circulation, fines, reservations, and reports; optional e-books. Cannot touch fees/payroll/settings.

**Stories**
- US-LB-1 As a Librarian, I want to add/edit/remove books with categories, ISBN, and author, so that the catalog is accurate.
- US-LB-2 As a Librarian, I want to issue/return books with auto due-dates and late-fine calculation, so that circulation is controlled.
  - AC: Given an overdue return, when I accept it, then a fine is auto-calculated and recordable; history updates.
- US-LB-3 As a Librarian, I want to register members and set borrowing limits, so that access is fair.
- US-LB-4 As a Librarian, I want inventory tracking (available vs issued, lost/damaged, stock verification), so that stock is reconciled.
- US-LB-5 As a Librarian, I want a reservation/hold system with waiting list and availability notifications, so that demand is managed.
- US-LB-6 As a Librarian, I want reports (issued, overdue, fine collection, most-issued, usage), so that the library is measured.
- US-LB-7 As a Librarian, I want to upload e-books/PDFs with download tracking, so that digital resources are available.

---

## 7. Lab Assistant

**Persona — "Sunil, Lab Assistant."** Maintains lab inventory, issues equipment, supports practicals, logs maintenance/safety, manages bookings. Cannot edit academics/fees/payroll/settings.

**Stories**
- US-LA-1 As a Lab Assistant, I want to manage lab inventory (equipment, chemicals, consumables, stock, damaged/expired) by category, so that the lab is stocked and safe.
- US-LA-2 As a Lab Assistant, I want to issue/return equipment with slips and usage history, so that items are accounted for.
- US-LA-3 As a Lab Assistant, I want to view the practical timetable, prepare labs, mark lab attendance, and record completion, so that practicals run smoothly.
- US-LA-4 As a Lab Assistant, I want maintenance/safety logs and servicing schedules, so that compliance is maintained.
- US-LA-5 As a Lab Assistant, I want to manage lab booking requests and availability, so that conflicts are avoided.
- US-LA-6 As a Lab Assistant, I want reports (stock, issue/return, damage/loss, usage, maintenance) and to upload manuals, so that the lab is documented.

---

## 8. Examiner

**Persona — "Ms. Iyer, Examiner."** Handles papers, evaluation, marks entry/verification, exam duties, and result support — scoped to assigned subjects/exams. No admissions/fees/payroll/config.

**Stories**
- US-EX-1 As an Examiner, I want to upload question papers, set instructions, and keep them confidential, so that exams are prepared securely.
- US-EX-2 As an Examiner, I want to evaluate answer sheets and enter/upload marks (draft → finalize → recheck), so that scoring is accurate.
  - AC: Given draft marks, when I finalize, then marks lock; flagged discrepancies are visible for review.
- US-EX-3 As an Examiner, I want to cross-check and lock marks and flag discrepancies, so that integrity is preserved.
- US-EX-4 As an Examiner, I want exam-duty schedules, seating plans, and malpractice reporting, so that conduct is managed.
- US-EX-5 As an Examiner, I want reports (subject-wise result, entry status, pending evaluation, workload) and result support (compiled results, grace marks if permitted, remarks, pass/fail), so that results are processed.

---

## 9. Sports Coach

**Persona — "Coach Vikram."** Runs a dynamic set of activities (sports, dance, music, karate, swimming…). Manages teams, training, events, performance, equipment, attendance, and certificates. No academics/fees/payroll/settings.

**Stories**
- US-SP-1 As a Coach, I want a dynamic activity/category system, so that the school can offer any activity.
- US-SP-2 As a Coach, I want to manage teams/players, rosters, fitness, and achievements, so that squads are organized.
- US-SP-3 As a Coach, I want training schedules with practice attendance and skill tracking, so that development is measured.
- US-SP-4 As a Coach, I want to run competitions (register teams, fixtures, results, tournament records), so that events are managed.
- US-SP-5 As a Coach, I want performance analytics and top-performer identification, so that talent is surfaced.
- US-SP-6 As a Coach, I want equipment/ground management and bookings, so that resources are available.
- US-SP-7 As a Coach, I want to notify players/parents and generate certificate data and reports, so that communication and recognition flow.

---

## 10. Class Teacher & Subject Teacher

**Persona — "Mr. Nair, Class Teacher (also a Subject Teacher)."** Owns a class plus teaches a subject. Marks attendance, enters marks, verifies/publishes results, communicates with parents, posts classwork/homework, schedules extra classes. No fees/payroll/settings.

**Stories**
- US-TC-1 As a Class Teacher, I want to mark daily attendance and edit it the same day, so that records are correct.
  - AC: Given today's attendance, when I switch Absent↔Present on the same day, then it saves; on a later day, the control is disabled and only Principal/Admin can change it.
- US-TC-2 As a Subject Teacher, I want to submit subject-wise marks for verification, so that the Class Teacher can approve them.
- US-TC-3 As a Class Teacher, I want to verify subject marks and approve individually or Approve-All, so that results publish accurately.
  - AC: Given submitted marks, when I Approve-All, then all subjects are marked verified and results become visible to students.
- US-TC-4 As a Class Teacher, I want to manage results, generate admit cards, and manage test marks from the student's profile, so that everything is in one place and visible to the student.
- US-TC-5 As a Class Teacher, I want to assign homework/classwork, set deadlines, and review submissions, so that learning is tracked.
- US-TC-6 As a Class Teacher, I want to post classroom-activity photos/details visible only to my class's parents/students, so that families stay engaged.
- US-TC-7 As a Class Teacher, I want to message parents, schedule PTM, and create class chat groups (students + parents), so that communication is easy.
- US-TC-8 As a Class Teacher, I want to schedule extra classes with date/start/end notifications, so that students and parents are informed.
- US-TC-9 As a Class Teacher, I want to add discipline remarks, achievements, and progress notes, so that the student record is complete.
- US-TC-10 As a Class Teacher, I want to send absence notifications and view monthly attendance reports, so that parents are alerted.

---

## 11. Bus Driver (& Helper)

**Persona — "Ramesh, Driver."** Drives a route, marks pickups/drops, reports issues, submits a vehicle checklist, shares live location. No academics/fees; cannot create routes. Uses a phone in the cab.

**Stories**
- US-BD-1 As a Driver, I want to view my route, schedule, pickup/drop points, and student list, so that I run the trip correctly.
- US-BD-2 As a Driver, I want to mark boarding/drop-off and see present/absent counts, so that no child is missed.
  - AC: Given my route's student list, when I mark boarding, then present/absent counts update and feed transport attendance.
- US-BD-3 As a Driver, I want to mark trip start/end and share live location, so that parents/admin can track the bus.
- US-BD-4 As a Driver, I want to report breakdowns/accidents/route issues and send emergency alerts, so that incidents are escalated.
- US-BD-5 As a Driver, I want to submit a daily vehicle checklist (fuel, condition, maintenance) and view the service schedule, so that the vehicle is safe.
- US-BD-6 As a Driver, I want to receive route updates and parent notifications (view-only), so that I stay informed.

---

## 12. Other Staff

**Persona — "Lata, Support Staff."** A configurable minimal staff account. Has a profile, attendance, leave, notices, chat, and expense/reimbursement, with permissions granted by Admin.

**Stories**
- US-OS-1 As Other Staff, I want a profile with my attendance, leaves, and documents, so that my record is visible to me.
- US-OS-2 As Other Staff, I want to apply for leave and receive notices/messages, so that I stay coordinated.
- US-OS-3 As Other Staff, I want to upload expense bills and request reimbursement, so that I'm repaid (visible to Admin & Accountant).
- US-OS-4 As Other Staff, my access is limited to whatever Admin grants me.

---

## 13. Parent

**Persona — "Mr. & Mrs. Gupta."** Track their child(ren), pay fees, apply for leave, follow the bus, and message teachers. One mobile number can hold multiple children. View-only on most data. Phone-primary.

**Stories**
- US-PA-1 As a Parent, I want one login for multiple children and to switch between them, so that I manage all my kids in one place.
  - AC: Given multiple linked children, when I log in, then I see all their profiles and can select any child to view their details.
- US-PA-2 As a Parent, I want to view my child's profile, class, ID card, and academic profile, so that I know their standing.
- US-PA-3 As a Parent, I want daily/monthly attendance with Present/Absent/Leave alerts, so that I'm informed instantly.
- US-PA-4 As a Parent, I want to view homework, materials, submission status, and remarks, so that I support learning.
- US-PA-5 As a Parent, I want exam timetables, marks, report cards, rank, and previous mark sheets, so that I track progress over time.
- US-PA-6 As a Parent, I want to view the fee structure, dues, pay online, and download receipts, so that fees are handled easily.
  - AC: Given outstanding dues, when I pay online, then a receipt is generated and downloadable and the balance updates.
- US-PA-7 As a Parent, I want to message teachers/principal and receive notices/circulars/emergency alerts, so that I stay connected.
- US-PA-8 As a Parent, I want to track the assigned bus live, with pickup/drop and delay notifications and speed alerts, so that I know where my child is.
- US-PA-9 As a Parent, I want to apply for my child's leave with documents and track status, so that absences are authorized.
- US-PA-10 As a Parent, I want to see events, the topper, the highest-rated teacher, and the Top-3 slider, so that I'm part of school life.
- US-PA-11 As a Parent, I want to read the syllabus books online with page navigation, so that I can help at home.

---

## 14. Student

**Persona — "Aarav, Student."** Views own profile, attendance, homework, results, library, transport; submits assignments and leave; joins online/live classes; rates teachers. Phone-primary.

**Stories**
- US-ST-1 As a Student, I want to view my profile, IDs, class, and ID card, so that my details are handy.
- US-ST-2 As a Student, I want daily/monthly attendance with alerts, so that I track my presence.
- US-ST-3 As a Student, I want to view homework, download materials, upload submissions, and see feedback, so that I keep up.
- US-ST-4 As a Student, I want to access video lectures, join live classes, download notes, and attempt quizzes, so that I learn online.
- US-ST-5 As a Student, I want exam timetables, marks, report cards, rank, and performance analysis, so that I know how I'm doing.
- US-ST-6 As a Student, I want to view fees, dues, history, and receipts (view-only), so that I'm aware of payments.
- US-ST-7 As a Student, I want to apply for leave with documents and track status, so that absences are recorded.
- US-ST-8 As a Student, I want to search the library, view issued books, due dates, fines, and reserve books, so that I use the library.
- US-ST-9 As a Student, I want transport info and live bus tracking, so that I plan my commute.
- US-ST-10 As a Student, I want to receive notices, message teachers (if allowed), and get event updates, so that I stay informed.
- US-ST-11 As a Student, I want to rate my teachers 1–5, so that I give feedback (only Admin sees who I am; the teacher sees a summary).
- US-ST-12 As a Student, I want to view complete details of my teachers (subjects, schedule, timings, duration), so that I know my classes.
- US-ST-13 As a Student, I want to read the syllabus books online, so that I can study any chapter.

---

## Cross-cutting stories (apply to many roles)

- US-X-1 As any user, when I delete something, I must enter a PIN and confirm Yes/No; the item goes to Recycle Bin and is recoverable for 15 days.
- US-X-2 As any user, I can switch the interface between Hindi and English, and between light and dark themes.
- US-X-3 As any list user, I can search, filter, sort, paginate, choose columns, and export to Excel/PDF.
- US-X-4 As any user, I receive in-app notifications via a bell, and can open a Notification Center.
- US-X-5 As any user with permission, I can upload audio/video/PDF/JPG within configured size limits.
- US-X-6 As any messaging user, I can chat 1:1 or in groups (where my role allows creating groups).
