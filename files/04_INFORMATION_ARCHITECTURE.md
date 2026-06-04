# 04 — Information Architecture & Navigation

This is the screen-by-screen map: global chrome, the route tree, every role's **sidebar (sections → items)**, and the key **modals/dropdowns** per area. Build navigation from `src/config/navigation.ts` keyed by role.

---

## 1. Global chrome (every authenticated screen)

**Topbar (left → right):** sidebar collapse toggle · school logo + name · global search (⌘K) · language switcher (EN/हिं) · theme toggle (light/dark) · notifications bell (unread badge → dropdown → "View all" → Notification Center) · profile menu (avatar → My Profile, Settings [if permitted], Help, Lock screen, Logout).

**Sidebar:** role-specific sections (collapsible groups) with icon + label items; active-route highlight; collapses to icon-rail on desktop and to a slide-over drawer (Sheet) on mobile; footer shows role badge + app version + "Demo data" indicator.

**Breadcrumbs:** under the topbar on inner pages.

**Persistent shared components:** ConfirmDialog, PinDialog (for deletes), FormModal, ExportMenu (Excel/PDF/Print), TemplatePicker, NotificationComposer, ChatDock.

---

## 2. Route tree (high level)

```
/login
/forgot-password
/reset-password
/lock
/403            (forbidden)
/404            (not found)

/app                                   (AppShell, requires auth; redirects by role)
  /app/super-admin/...
  /app/admin/...
  /app/principal/...
  /app/accountant/...
  /app/receptionist/...
  /app/librarian/...
  /app/lab/...
  /app/examiner/...
  /app/sports/...
  /app/teacher/...
  /app/bus-driver/...
  /app/staff/...
  /app/parent/...
  /app/student/...

  /app/profile                         (shared)
  /app/settings                        (permission-gated)
  /app/notifications                   (Notification Center)
  /app/chat                            (chat + groups)
  /app/search                          (global search results)
  /app/recycle-bin                     (permission-gated)

/print/marksheet/:id                   (print/PDF views, templated)
/print/admit-card/:id
/print/id-card/:id
/print/timetable/:classId
/print/receipt/:id
/print/transfer-certificate/:id
```

Each role base path redirects to its dashboard, e.g. `/app/admin` → `/app/admin/dashboard`.

---

## 3. Super Admin — sidebar & pages

**Sections → items**
- **Overview**: Platform Dashboard (schools, members, active/inactive counts, service usage).
- **Schools**: All Schools · School Profile (Name, DISE Code, License No., Address, Website, App info, social links) · Activate/Deactivate School (cascade).
- **Members**: All Members directory · Activate/Inactive · Create/Edit · Member documents · Bulk document download (Select-All / one-by-one for mark sheets, ID cards, etc.).
- **Services Registry**: Hide/Unhide & Activate/Deactivate every service/option (master switches).
- **Documents**: Templates library · Bulk export center.
- **System**: Settings · Reset demo data · Activity log (global) · Error/empty-state showcase.

**Key modals/dropdowns:** Activate/Deactivate confirm (with cascade warning) · Service toggle switches · Bulk-select document export menu · Member create/edit FormModal.

---

## 4. Admin — sidebar & pages

**Sections → items**
- **Dashboard & Analytics**: Overview · School performance · Student strength · Fee-collection summary · Attendance analytics · Graphs/visual reports.
- **Students**: Student list · Add/Edit/Delete student · Admissions (approve/reject) · Promotions (auto + manual) · Transfer Certificates · Documents upload · Dynamic admission fields manager.
- **Staff**: Staff/Members list · Add teachers & staff · Roles & permissions · Salary management · Staff attendance · Performance monitoring · Recruitment data.
- **Academics**: Classes & Sections · Subjects · Subject allocation · Timetable (class-wise + day-wise dynamic) · Exams & results · Grade-system setup.
- **Attendance**: Student report · Staff report · Monthly summary · Absentee alerts · Attendance popup · Biometric device sync.
- **Fees & Accounts**: Fee structures (class-wise) · Collection tracking · Online-payment monitoring · Pending dues · Receipts · Salary/payroll overview · Financial reports.
- **Communication**: Notification Center · Notice board · Parent communication · Emergency announcements · Chat groups (create, add members / select-all).
- **Transport**: Routes · Bus assignments · Vehicle tracking (live map) · Speed-limit settings · Driver details · Transport fee.
- **Library**: Inventory · Issue/return · Fines · Reports.
- **Inquiries**: Website/app inquiries · Reply · Status (notified of Principal/Receptionist actions).
- **Records**: Receptionist's digital book (Visitor Book + Courier/Postal).
- **Feedback**: Ratings & comments (full detail, Admin-only) · Complaints/requests inbox.
- **Documents**: Template picker (Mark Sheet/Admit Card/ID Card) · Bulk print/download (Select-All / one-by-one) · Manual-register import.
- **Governance**: Delete permissions manager (grant to Principal) · Recycle Bin · Activity Monitor (all members).
- **Settings**: School profile · Service charges · Upload size limits · Language · Themes.

**Key modals/dropdowns:** Member CRUD FormModal · Admission approve/reject · Promotion wizard · Notification composer (recipient picker: one/all students/teachers/all employees/member-wise) · Template picker · Speed-limit setter · Permission-grant matrix · PIN delete + confirm.

---

## 5. Principal — sidebar & pages

**Sections → items**
- **Dashboard**: Daily summary · Attendance overview · Fee snapshot (view) · Upcoming events · Important alerts.
- **Students**: Records (view) · Approve admissions · Monitor attendance · Academic performance · Disciplinary remarks · Transfer requests.
- **Staff**: Teacher profiles · Staff attendance · Approve leave · Assign class teachers · Teacher performance · Notices to staff.
- **Academics**: Approve timetable · Syllabus progress · Approve exam schedule · Result review & publish approval · Class-performance analytics.
- **Attendance**: Daily report · Class-wise · Defaulter list · Staff summary · Late-coming.
- **Examinations**: Approve schedules · Monitor progress · Results analytics · Topper reports · Pass/fail stats.
- **Communication**: Circulars · Notices · Message parents · Message staff · Emergency announcements · Chat groups (students/parents/staff).
- **Discipline**: Warnings · Suspensions · Complaint monitoring · Incident reports · Counseling records.
- **Events**: Event approval · Activity calendar · Competition results · Achievements.
- **Reports**: Academic · Attendance · Staff performance · Class comparison · Monthly school report.
- **Transport (view)**: Live tracking · Speed alerts.

**Restricted (hidden):** Fee collection, accounting edits, system config, role creation, financial-record deletion → not in sidebar; direct URLs → 403.

**Key modals/dropdowns:** Approve/reject (admissions, leave, timetable, exam schedule, results) · Disciplinary record FormModal · Circular composer · Class-teacher assignment.

---

## 6. Accountant — sidebar & pages

**Sections → items**
- **Finance Dashboard**: Daily collection · Pending dues · Expense snapshot · Income-vs-expense chart · Alerts.
- **Fee Management**: Create receipts · Record offline payment · Verify online payment · Concessions/discounts · Late-fee · Refunds · Installments.
- **Fee Structure (limited)**: View class-wise · Apply special discounts · Assign transport fee · Assign hostel fee.
- **Dues & Defaulters**: Student-wise pending · Class-wise defaulters · Send reminders · Due reports · Auto-fine.
- **Payroll**: Process salary (from attendance) · Salary slips · PF/ESI · Bonus & deductions · Salary reports.
- **Expenses**: Add expense · Categorize · Upload bills/vouchers · Vendor payments · Monthly expense report · Teacher reimbursement approvals · Manual entries.
- **Receipts & Invoices**: Generate · Print · Email · Duplicate · Payment history.
- **Reconciliation**: Online verification · Bank reconciliation · Gateway report · Failed transactions.
- **Reports**: Daily/monthly/expense/balance/fee-head/audit · Full accounting & P&L (visible to Admin).
- **Communication (finance)**: Fee-reminder SMS/WhatsApp · Payment-confirmation · Due alerts · Receipt email · Notify all/selected students individually.

**Restricted (hidden):** Marks, attendance edits, admissions, roles, system settings.

**Key modals/dropdowns:** Payment FormModal → receipt · Discount/concession dialog · Salary-run wizard · Expense entry + bill upload · Reimbursement approve/reject · Reminder composer.

---

## 7. Receptionist — sidebar & pages

**Sections → items**
- **Dashboard (limited)**: Today's inquiries · Visitors · Appointments.
- **Inquiries**: New inquiry (walk-in/phone/website) · Track status · Forward to Admin/Principal · School info sheet.
- **Admissions Assist**: Share forms/guidelines · Collect/verify documents · Application tracker.
- **Visitor Book**: Register entry · Issue pass · Daily log · Notify staff (Admin/Principal view).
- **Courier/Postal**: New courier record (company, sender/receiver, pickup date/time, tracking no., status, amount) · History · Share with Accountant/Principal/Admin.
- **Appointments**: Book meeting (teacher/principal) · Calendar · Reminders.
- **Front Desk**: Calls log · Transfer/announcements · Email queries.
- **Support**: Timetable/basic info · Fee-counter guidance · ID/document query help · Complaints (forward).
- **Reports**: Inquiry · Visitor · Call log · Appointment.

**Restricted:** Fee modification, academic editing, system settings.

**Key modals/dropdowns:** Inquiry FormModal · Visitor entry + pass · Courier record FormModal · Appointment scheduler.

---

## 8. Librarian — sidebar & pages

**Sections → items**
- **Dashboard**: Issued today · Overdue · Fines collected · Stock alerts.
- **Catalog**: Add/Edit/Remove book · Categories/subjects · ISBN & authors.
- **Circulation**: Issue book · Return book · Due-date tracking · Late-fine · Issue history.
- **Members**: Register member · Activate/deactivate · Borrowing limits · Member profiles.
- **Inventory**: Available vs issued · Lost/damaged · Stock levels · Stock verification.
- **Fines**: Auto-calculate · Record payment · Reports · Waive (if permitted).
- **Reservations**: Reserve · Waiting list · Availability notify · Cancel/modify.
- **Reports**: Issued · Overdue · Fine collection · Most-issued · Usage stats.
- **Digital Library**: Upload e-books/PDFs · Manage resources · Download access · Usage tracking.

**Key modals/dropdowns:** Book FormModal · Issue/Return dialog (member + book picker + due date) · Fine settle/waive · Reservation dialog · E-book uploader.

---

## 9. Lab Assistant — sidebar & pages

**Sections → items**
- **Dashboard**: Stock alerts · Pending returns · Today's practicals · Maintenance due.
- **Inventory**: Equipment · Chemicals & consumables · Stock levels · Damaged/expired · Categories (Physics/Chemistry/Computer…).
- **Issue/Return**: Issue equipment · Record return · Pending returns · Usage history · Issue slips.
- **Practicals**: Practical timetable · Lab prep · Lab attendance · Completion status.
- **Maintenance & Safety**: Maintenance log · Servicing schedule · Safety checks · Hazard/incident reports · Compliance.
- **Bookings**: Requests · Approve/forward · Availability · Conflict avoidance.
- **Reports**: Stock · Issue/return · Damage/loss · Usage · Maintenance.
- **Digital Resources**: Upload manuals · Guidelines · Experiment records · Download access.

**Key modals/dropdowns:** Inventory item FormModal · Issue/return dialog · Maintenance log · Booking approve/forward.

---

## 10. Examiner — sidebar & pages

**Sections → items**
- **Dashboard**: Assigned subjects/exams · Pending evaluations · Entry status.
- **Papers**: Upload question paper · Instructions · Assign subject-wise · Verify format · Confidentiality.
- **Evaluation**: Evaluate sheets · Enter marks · Practical/internal marks · Save draft/finalize · Recheck.
- **Verification**: Cross-check · Lock marks · Flag discrepancies · Send for approval.
- **Exam Duty**: Duty schedule · Seating plans (download) · Guidelines · Report malpractice.
- **Reports**: Subject-wise result · Entry status · Pending evaluation · Workload.
- **Result Support**: Compiled results · Grace marks (if permitted) · Remarks · Pass/fail verification.

**Restricted:** Admissions, fees, payroll, system config.

**Key modals/dropdowns:** Paper uploader · Marks-entry grid (draft/finalize) · Discrepancy flag · Malpractice report.

---

## 11. Sports Coach — sidebar & pages

**Sections → items**
- **Dashboard**: Assigned activities · Upcoming events · Attendance snapshot.
- **Activities**: Dynamic categories (sports/dance/music/karate/swimming/…) · Add/manage.
- **Teams & Players**: Teams · Player profiles · Rosters · Fitness status · Achievements.
- **Training**: Schedules · Practice attendance · Drills/sessions · Materials · Skill tracking.
- **Events**: Competitions · Team registration · Fixtures · Results · Tournament records.
- **Performance**: Stats · Fitness reports · Improvement metrics · Top performers · Analytics.
- **Equipment & Ground**: Request equipment · Issued items · Damaged reports · Ground availability · Bookings.
- **Attendance**: Mark · Absentee · Participation · Summaries.
- **Communication**: Notices to players/parents · Match schedules · Practice changes.
- **Reports & Certificates**: Performance · Participation · Certificate data · Activity reports.

**Key modals/dropdowns:** Activity/category FormModal · Player FormModal · Fixture/result dialog · Equipment request.

---

## 12. Class Teacher & Subject Teacher — sidebar & pages

**Sections → items**
- **Dashboard**: My class snapshot · Today's timetable · Pending marks verification · Alerts.
- **My Class**: Class/section · Student list (gateway to per-student profile) · Class profile · Promote (if permitted).
- **Attendance**: Mark daily · Edit (same-day) · Monthly reports · Absence notifications · Attendance popup.
- **Homework & Classwork**: Assign homework · Upload material · Deadlines · Review submissions.
- **Classroom Activities**: Upload photos/details/lessons/classwork/homework (visible to this class's parents/students).
- **Marks & Results**: Subject-teacher marks entry · Verify subject marks · Approve one/Approve-All · Report cards · Remarks · From student profile: results, admit cards, test marks.
- **Behavior**: Discipline remarks · Achievements · Notes · Progress.
- **Communication**: Message parents · Schedule PTM · Notices · Respond to queries · Class chat groups (students + parents).
- **Scheduling**: View timetable · Substitution · Exam schedule · Schedule extra classes (notify parents/students).

**Per-student profile (sub-pages):** Overview/IDs · Attendance · Marks/Results · Homework · Behavior · Documents (admit card/mark sheet) · Communication — all actions visible to the student.

**Restricted:** Fees, payroll, system settings.

**Key modals/dropdowns:** Attendance popup (same-day edit lock) · Marks-entry grid · Verify/Approve-All · Homework FormModal · Activity uploader · PTM scheduler · Extra-class scheduler · Group creator (select-all).

---

## 13. Bus Driver — sidebar & pages

**Sections → items**
- **Dashboard**: Today's trip · Assigned route · Student count (present/absent).
- **Route & Trip**: Route map/navigation · Schedule · Pickup/drop points · Mark trip start/end.
- **Pickup & Drop**: Student list · Mark boarding · Mark drop-off · Report absence · Missed-pickup alerts.
- **Live Tracking**: Enable GPS · Share location · Update status · Notify delays.
- **Incidents & Safety**: Breakdown · Accident/incident · Route issue · Emergency alert · Safety checks.
- **Vehicle**: Daily checklist · Fuel status · Maintenance needs · Condition log · Service schedule.
- **Communication**: Route updates · Emergency messages · Contact transport manager · Parent notifications (view-only).

**Restricted:** Academics, fees, route creation, system settings.

**Key modals/dropdowns:** Boarding/drop toggles · Trip start/end confirm · Incident report FormModal · Vehicle checklist form.

---

## 14. Other Staff — sidebar & pages

**Sections → items**
- **Dashboard**: My attendance · Leaves · Notices.
- **Profile**: Details · Documents · Performance.
- **Leave**: Apply · Status · History.
- **Expenses**: Upload bill · Reimbursement request (visible to Admin & Accountant).
- **Communication**: Notices · Messages · Chat.

**Access:** Limited to Admin-granted permissions.

---

## 15. Parent — sidebar & pages

**Child switcher** at the top (single mobile number → multiple children → select active child).

**Sections → items**
- **Home**: Topper card · Highest-rated teacher · Top-3 slider · Events · Alerts · Service charges.
- **Child Profile**: Basic details · Class/section · Admission info · ID-card details · Academic profile.
- **Attendance**: Daily · Monthly · Present/Absent/Leave alerts · Late arrivals.
- **Homework**: Assigned · Materials (download) · Submission status · Remarks · Pending.
- **Exams & Results**: Timetable · Subject-wise marks · Report cards (download) · Analytics · Progress · Rank · Previous mark sheets.
- **Fees**: Structure · Dues · Pay online · Receipts (download) · History.
- **Communication**: Chat teachers/principal · Notices · Emergency alerts · Circulars · Respond.
- **Transport**: Assigned bus · Live tracking · Pickup/drop notifications · Route · Delay & speed alerts.
- **Leave**: Apply (dynamic form + documents) · Status · History.
- **Events & Activities**: Events · Participation · Sports/cultural updates · Circulars (download).
- **Syllabus**: Read class books online (page navigation / jump-to-page).
- **School**: Social links · Holiday calendar.

**Restricted:** No data editing (except allowed profile fields), no marks editing, no admin/system access.

**Key modals/dropdowns:** Child switcher · Online payment (simulated) → receipt · Leave FormModal · Chat · Live-map sheet.

---

## 16. Student — sidebar & pages

**Sections → items**
- **Home**: Topper · Highest-rated teacher · Top-3 slider · Notices · Events · Prayer (audio/video/text) · Service charges.
- **Profile**: Personal + IDs (SSMID, Roll, Samagra, Scholar, APAAR…) · Class/section · Admission · ID card · Limited edit (if allowed).
- **Attendance**: Daily · Monthly · Alerts · Late/half-day.
- **Homework**: Assigned · Materials (download) · Upload submission · Status · Feedback.
- **Online Learning**: Video lectures · Join live class · Notes · Quizzes · Course progress.
- **Exams & Results**: Timetable · Marks · Report cards (download) · Rank/grade · Performance analysis.
- **Fees (view)**: Structure · Dues · History · Receipts (download if permitted).
- **Leave**: Apply · Status · History · Documents.
- **Library**: Search · Issued books · Due dates · Fines · Reserve.
- **Transport**: Route · Pickup/drop timing · Live bus · Delay alerts.
- **Teachers**: Complete details of Subject/Class teachers (subjects, schedule, timings, duration).
- **Communication**: Notices · Announcements · Message teachers (if allowed) · Events · Circulars.
- **Feedback**: Rate teacher 1–5.
- **Syllabus**: Read class books online.

**Restricted:** No editing (except limited profile), no fee control, no marks editing, no admin access.

**Key modals/dropdowns:** Assignment uploader · Leave FormModal · Book reserve · Live-class join · Teacher-rating dialog (1–5) · Quiz player.

---

## 17. Shared screens (all roles, permission-aware)

- **My Profile** — details, IDs, documents, total leaves, attendance, ratings, performance, social links.
- **Notification Center** — inbox + compose (recipient picker: one/group/all; channel: WhatsApp/SMS/Email/Push) + sent log + templates.
- **Chat** — 1:1 + groups; group creation where role permits (add members individually or Select-All).
- **Global Search results** — across permitted entities.
- **Recycle Bin** — soft-deleted items, restore/permanent, 15-day countdown (permission-gated).
- **Settings** — theme, language, and (if permitted) school profile, service registry, templates, upload limits, reset demo data.
- **Live Video room** — host/join, participant list, mute/camera/share/leave, "live class/event" + recipient scope.
- **Holiday Calendar** — month view, role-scoped holidays.
- **Syllabus Reader** — book list → page-by-page viewer with jump-to-page.
- **Print/PDF document views** — Mark Sheet, Admit Card, ID Card, Timetable, Receipt, TC — rendered from the selected template.

---

## 18. Reusable interaction patterns (build once)

- **DataTable**: search, column filters, sort, pagination, column visibility, row selection → bulk actions (delete, export, notify, download docs), row actions menu (view/edit/delete/print).
- **FormModal**: create/edit with react-hook-form + zod; supports dynamic fields (admission/student/sports/timetable).
- **PinDialog → ConfirmDialog**: every delete = PIN entry → Yes/No → soft delete → toast with "Undo" + recycle-bin note.
- **ExportMenu**: Excel (.xlsx), PDF, Print — on every list and homepage feature.
- **TemplatePicker**: switch Mark Sheet/Admit Card/ID Card design before print/download.
- **NotificationComposer**: audience + channel + message + send → appended to sent log.
- **FilterBar / StatCard / EmptyState / StatusPill / RoleBadge / Avatar / Skeletons**: consistent everywhere.
