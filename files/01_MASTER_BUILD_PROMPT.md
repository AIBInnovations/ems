# 01 — MASTER BUILD PROMPT (paste this into Claude Code)

> Paste everything below the line into the Claude Code chat in VS Code as your first message. It assumes the other docs live in `./docs/`.

---

## ROLE

You are a senior full-stack product engineer and UI/UX craftsman. You are going to build **`ems-suite`**, a complete, professional, fully clickable **Education Management System** as a React web application with a persistent mock-data layer. The app must look and feel like a premium commercial SaaS product, and **every interactive element must work** — no dead buttons, no placeholder links, no "coming soon" screens.

You have five companion documents in `./docs/`. **Read them before and during the build** — do not work from memory alone:

- `docs/02_SRS.md` — every functional + non-functional requirement and the traceability matrix (the contract).
- `docs/03_PERSONAS_AND_USER_STORIES.md` — who uses each part and the acceptance criteria.
- `docs/04_INFORMATION_ARCHITECTURE.md` — every sidebar, route, page, modal, and dropdown for all 14 roles. **This is your screen-by-screen map.**
- `docs/05_DESIGN_SYSTEM.md` — the exact visual language (tokens, components, motion, a11y).
- `docs/06_DATA_MODEL.md` — entities, fields, relationships, and the seed-data plan.

**Begin every work session by opening these files. End every phase by re-checking your work against `docs/02_SRS.md` and the phase Definition of Done in this prompt.**

---

## MISSION

Build a role-based education management *software* (admin/dashboard application) covering **14 roles**: Super Admin, Admin, Principal, Accountant, Receptionist, Librarian, Lab Assistant, Examiner, Sports Coach, Class Teacher / Subject Teacher, Bus Driver, Other Staff, Parent, Student. Each role has its own secure login, its own sidebar, its own permission set, and its own set of working modules.

The product must demonstrate, end to end and clickably:
- Authentication for every role + forgot-password flow.
- Role-Based Access Control (RBAC): each role sees only what it's allowed to, and the Super Admin can activate/deactivate and hide/unhide anything.
- Full CRUD on every domain entity with **PIN-protected delete → Recycle Bin (15-day retention) → restore / permanent delete**.
- Multi-step workflows (admissions, marks entry → class-teacher verification → publish, leave requests, fee collection, library issue/return, lab issue/return, bus trips, etc.).
- Dashboards with real charts driven by the mock data.
- A unified Notification Center (simulating WhatsApp/SMS/Email/push) with composition, recipient selection (one / group / all), and a sent log.
- Document generation (Mark Sheets, Admit Cards, ID Cards, Timetables, Receipts, Transfer Certificates) from **dynamic, switchable templates**, printable and exportable.
- Global search and export to **Excel and PDF** on list screens.
- **Bilingual Hindi/English** with a live language switcher.
- Live-tracking, live-video, and attendance-machine experiences as faithful simulations.

---

## NON-NEGOTIABLE GLOBAL RULES

1. **No dead ends.** Every button, link, tab, dropdown, toggle, switch, modal trigger, form submit, filter, search box, pagination control, export action, row action, and bulk action must produce a real, visible result. If real infrastructure is absent, simulate it with the mock-data layer and show the correct outcome (a toast, a state change, a generated document, an updated list). A control that does nothing is a defect.
2. **Persistence.** All data lives in a mock data layer backed by `localStorage` (via the data service) so changes survive page reloads. The app seeds itself on first run from `docs/06_DATA_MODEL.md` seed data. Provide a **"Reset demo data"** action in Super Admin settings.
3. **RBAC is enforced in the router and the UI.** Unauthorized routes redirect to a 403 page. Hidden/disabled services (Super Admin hide-unhide / activate-deactivate) actually disappear or grey out across the app.
4. **Accessibility & component quality.** Use a headless/accessible component library (shadcn/ui on Radix). All modals trap focus, close on Esc and overlay click, and restore focus. All dropdowns/selects/comboboxes are keyboard navigable. All forms validate inline with helpful messages.
5. **Design fidelity.** Match `docs/05_DESIGN_SYSTEM.md` precisely: spacing scale, color tokens, typography, radii, shadows, motion. The result must look elegant, modern, and consistent — never a default-Bootstrap or raw-HTML look. Light + dark themes both required.
6. **Responsiveness.** Mobile-first. The sidebar collapses to a drawer on small screens; tables become cards or horizontally scroll gracefully; nothing overflows or breaks below 360px.
7. **Consistency over cleverness.** Reuse shared components (DataTable, FormModal, ConfirmDialog, PageHeader, StatCard, FilterBar, EmptyState, etc.). Do not reinvent a table or modal per page.
8. **Honesty in simulation.** Where something is simulated (payments, GPS, biometric, messaging, video), label it subtly (e.g., a small "Demo" or "Simulated" badge) but make the *experience* complete and correct.
9. **Type safety.** TypeScript everywhere. Define shared types in `src/types`. No `any` unless unavoidable and commented.
10. **Don't skip the long tail.** The 78 cross-cutting "Additional School Demands" in `docs/02_SRS.md` §7 are first-class requirements, not optional extras. Build them.

---

## TECH STACK (use exactly this unless you hit a hard blocker, then ask)

- **Build/tooling:** Vite + React 18 + TypeScript.
- **Styling:** Tailwind CSS + CSS variables for theme tokens. Dark mode via `class` strategy.
- **Components:** shadcn/ui (Radix primitives) — Dialog, DropdownMenu, Select, Combobox, Tabs, Tooltip, Toast/Sonner, Popover, Sheet (drawer), Accordion, Switch, Checkbox, RadioGroup, Calendar, etc.
- **Icons:** lucide-react.
- **Routing:** react-router-dom v6 (data routers, nested layouts, route guards).
- **State:** Zustand for global/session state (auth, theme, language, notifications, recycle bin); React Query optional for the mock async layer; React Context for theme/i18n providers.
- **Forms & validation:** react-hook-form + zod.
- **Tables:** TanStack Table (sorting, filtering, pagination, column visibility, row selection for bulk actions).
- **Charts:** Recharts (area, bar, line, pie/donut, radial).
- **Dates:** date-fns + a calendar component for the holiday calendar, timetables, and schedulers.
- **Maps (bus tracking):** react-leaflet + Leaflet (OpenStreetMap tiles), with a simulated mover that animates a bus marker along a polyline and computes speed.
- **i18n:** i18next + react-i18next, with `en` and `hi` resource bundles and a language switcher.
- **Export:** SheetJS (`xlsx`) for Excel; `jspdf` + `jspdf-autotable` (or print-to-PDF via a styled print view) for PDF/documents.
- **Animation:** Framer Motion (page transitions, modal/drawer motion, list reordering, subtle micro-interactions).
- **PDF/printable docs:** dedicated print-stylesheet routes for Mark Sheet / Admit Card / ID Card / Receipt / TC, rendered from selectable templates.
- **IDs/util:** nanoid, clsx, tailwind-merge.

---

## PROJECT STRUCTURE (create this)

```
ems-suite/
├─ docs/                         # the 7 handoff docs (already present)
├─ public/
│  └─ seed/                      # optional static assets, sample avatars, logos
├─ src/
│  ├─ app/
│  │  ├─ router.tsx              # route tree + guards
│  │  ├─ providers.tsx          # theme, i18n, query, toast providers
│  │  └─ App.tsx
│  ├─ config/
│  │  ├─ roles.ts                # 14 roles, permission maps, default routes
│  │  ├─ navigation.ts           # per-role sidebar definitions (from doc 04)
│  │  └─ services-registry.ts    # hide/unhide + activate/deactivate flags
│  ├─ types/                     # shared TS types (from doc 06)
│  ├─ data/
│  │  ├─ seed/                   # seed objects per entity (from doc 06)
│  │  ├─ db.ts                   # localStorage-backed "database"
│  │  └─ services/               # one service module per domain (CRUD + workflows)
│  ├─ store/                     # zustand stores: auth, ui, notifications, recycleBin, services
│  ├─ i18n/
│  │  ├─ en.json
│  │  └─ hi.json
│  ├─ components/
│  │  ├─ ui/                     # shadcn components
│  │  ├─ shared/                 # DataTable, FormModal, ConfirmDialog, PinDialog,
│  │  │                          # PageHeader, StatCard, FilterBar, EmptyState,
│  │  │                          # ExportMenu, TemplatePicker, NotificationComposer,
│  │  │                          # Chart wrappers, Avatar, RoleBadge, StatusPill...
│  │  └─ layout/                 # AppShell, Sidebar, Topbar, RoleSwitcher (dev), Breadcrumbs
│  ├─ features/                  # one folder per role, or per domain shared across roles
│  │  ├─ auth/                   # login, forgot-password, lock screen
│  │  ├─ super-admin/
│  │  ├─ admin/
│  │  ├─ principal/
│  │  ├─ accountant/
│  │  ├─ receptionist/
│  │  ├─ librarian/
│  │  ├─ lab-assistant/
│  │  ├─ examiner/
│  │  ├─ sports-coach/
│  │  ├─ teacher/                # class teacher + subject teacher
│  │  ├─ bus-driver/
│  │  ├─ other-staff/
│  │  ├─ parent/
│  │  ├─ student/
│  │  └─ shared-domains/         # students, staff, fees, library, transport, exams,
│  │                             # notifications, documents, chat, recycle-bin, calendar...
│  ├─ pages/                     # 403, 404, settings, profile, search-results
│  ├─ lib/                       # utils: export.ts, print.ts, pin.ts, format.ts, rbac.ts
│  └─ main.tsx
├─ tailwind.config.ts
├─ index.html
└─ package.json
```

> Prefer organizing screens by **role feature folders** that compose **shared-domain** components, so (for example) the student list rendered for Admin, Principal, Class Teacher, and Accountant is the same component with different permission props — not four copies.

---

## DATA & "BACKEND" APPROACH

- Implement `src/data/db.ts` as a tiny synchronous "database": load namespaced collections from `localStorage`, seed on first run, expose `getAll/getById/insert/update/remove/query`.
- Each domain gets a service in `src/data/services/*` that wraps `db` and adds workflow logic (e.g., `marksService.submitForVerification`, `marksService.verifyAndPublish`, `feeService.collect`, `admissionService.approve`, `leaveService.decide`, `libraryService.issue/return/fine`, `recycleBinService.softDelete/restore/purge`).
- Make services return Promises (so the UI can show loading states) even though storage is local — this keeps an easy upgrade path to a real API.
- **Activity log:** every create/update/delete/approve/login writes an `ActivityLog` entry (actor, role, action, entity, timestamp). The Admin "Activity Monitor" reads this.
- **Recycle bin:** deletes are soft (set `deletedAt`, move to a `recycleBin` collection); a scheduled check purges items older than 15 days on app load; restore/permanent-delete available; **deletion requires PIN + Yes/No confirm**; permissions per `docs/02_SRS.md` (Admin controls who can delete what).

---

## BUILD ORDER (phases) — do them in sequence; verify each before moving on

You will not finish everything in one message. Work **phase by phase**. After each phase, summarize what you built, run/typecheck it, and check the phase's Definition of Done. Then continue.

### Phase 0 — Foundation
- Scaffold Vite + React + TS, Tailwind, shadcn/ui, router, providers.
- Implement theme (light/dark) + i18n (en/hi) + toast + global stores.
- Build the **AppShell** (collapsible Sidebar + Topbar with profile menu, theme toggle, language switcher, notifications bell, global search), **Breadcrumbs**, and all **shared components** listed above (DataTable, FormModal, ConfirmDialog, PinDialog, PageHeader, StatCard, FilterBar, EmptyState, ExportMenu, TemplatePicker, StatusPill, RoleBadge, Chart wrappers).
- Implement `src/data/db.ts`, the seed loader, and the services skeleton.
- **DoD:** App boots; theme + language toggles work; an example seeded list renders in a DataTable with sorting/filtering/pagination/column-visibility/row-selection and an Export menu that downloads a real `.xlsx` and `.pdf`.

### Phase 1 — Auth & RBAC
- Login screen (Username/Email, Password, Login button, Forgot Password, language switcher) with role-aware demo accounts and a clear "demo credentials" helper.
- Forgot-password flow (email → reset code → new password) fully simulated.
- Lock screen / session timeout (optional but nice).
- RBAC: `config/roles.ts` permission maps; route guards; 403 page; sidebar reflects permissions.
- Super Admin: activate/deactivate any member + hide/unhide any service (these flags actually change what other roles see). Rule: Super Admin deactivating an Admin deactivates that whole school (no one in it can log in). Deactivation disables **login only**; data is retained.
- **DoD:** You can log in as each of the 14 roles and land on that role's dashboard with the correct sidebar; an unauthorized URL redirects to 403; toggling a service in Super Admin makes it vanish for other roles; deactivating a user blocks their login but keeps their data.

### Phase 2 — Shared domains (build once, reuse everywhere)
Build these domain modules with full CRUD, workflows, search, filters, export, and PIN-delete → recycle bin:
- **Students** (dynamic admission fields; documents; promotion; TC; IDs: SSMID, Roll No, Samagra ID, Scholar ID, APAAR ID, +custom; previous mark sheets; rank).
- **Staff/Members** (create/edit/activate/inactivate/hide/unhide; roles & permissions; documents; ratings summary).
- **Classes & Sections, Subjects, Subject Allocation, Timetable** (class-wise + day-wise dynamic scheduling; period bell concept).
- **Attendance** (student + staff; mark; same-day edit by class teacher, later by Principal/Admin; absentee alerts; attendance-popup; biometric "device sync" import for staff → feeds salary).
- **Exams, Marks & Results** (subject-teacher entry → class-teacher verify → approve one/all → publish; grade/percentage systems; report cards; topper & rank; test results).
- **Fees & Accounting** (class-wise structure; student-wise discounts/concessions; collection; receipts; dues/defaulters; reminders; expenses + bill upload; teacher reimbursement requests; payroll from attendance; P&L; financial reports; pending/due display).
- **Library** (catalog; issue/return; fines; reservations/holds; members; reports; e-books).
- **Lab** (inventory; issue/return; practical schedule; maintenance/safety; bookings; reports; manuals).
- **Transport** (routes; bus assignment; bus-wise student lists & counts; trips; **live map tracking + speed + speed-limit alerts**; vehicle checklist; incidents).
- **Sports/Activities** (dynamic categories; teams/players; training; events/fixtures/results; performance; certificates).
- **Notifications/Communication** (Notification Center: compose to one/group/all across WhatsApp/SMS/Email/push; templates; sent log; fee reminders; attendance alerts; emergency announcements).
- **Chat & Groups** (WhatsApp-style chat; Admin/Principal/Teacher can create groups, add members individually or select-all; direct member-to-member messages).
- **Documents & Templates** (dynamic, switchable templates for Mark Sheet/Admit Card/ID Card; printable Timetable, Receipt, TC; bulk select-all or one-by-one download/print; search).
- **Inquiries/Admissions intake** (website/app inquiries visible to Admin/Principal/Receptionist; status tracking; admin notified of Principal/Receptionist follow-ups).
- **Visitor Book & Courier/Postal records** (receptionist maintains; Admin/Principal view).
- **Leave** (dynamic form; student/parent apply → class teacher decide → notify; staff leave → Principal).
- **Ratings & Feedback** (student rates teacher 1–5; only Admin sees who rated; teacher sees summary only).
- **Recycle Bin** (cross-domain; PIN + confirm; 15-day auto-purge; restore/permanent).
- **Calendar** (holiday calendar preloaded; events; PTM; extra classes; appointments).
- **School Profile & Settings** (school details: name, DISE code, license, address, website, social links; service charges display; upload size limits; template selection; language; reset demo data).
- **Live Video** (host/join room shell with participant list + controls; teacher→class, principal→staff/students, admin→all, member-wise, live class/event).
- **Syllabus Reader** (uploaded books with page-by-page navigation + jump-to-page).
- **School Prayer** (audio/video/text).
- **DoD:** Each domain module works in isolation with seeded data, full CRUD, workflows, export, and PIN-delete → recycle bin. Components are reused, not duplicated.

### Phase 3 — Role experiences (compose the domains per role)
For **each** of the 14 roles, build the dashboard + the exact sidebar/sections/pages defined in `docs/04_INFORMATION_ARCHITECTURE.md`, wiring in the shared domains with the correct permissions. Every role's "Permissions (Software Side)" allow-list and restricted-list from the PDF must be honored.
- **DoD:** Logging in as any role gives a polished dashboard with role-appropriate stat cards + charts, and every sidebar item opens a working page. No restricted capability is reachable by a role that the PDF forbids it to.

### Phase 4 — Cross-cutting demands & polish
- Implement/verify all **78 Additional School Demands** (SRS §7) — walk the list, tick each off.
- Front-page/home widgets: class topper (photo/rating/performance), highest-rated teacher, **Top-3 students/teachers slider**, classroom-activity feed (visible to that class's parents/students).
- Global search across entities; Excel/PDF export available on every list and on the homepage features.
- Bilingual coverage: every visible string keyed in en + hi.
- Empty states, loading skeletons, error states, 404/403, toasts everywhere.
- Motion pass (page transitions, modal/drawer, list animations) — smooth and subtle, never gratuitous.
- Responsive pass on phone/tablet/desktop.
- **DoD:** Every item in the Requirements Traceability Matrix (SRS Appendix A) maps to a working screen/feature. Walk the matrix and confirm.

### Phase 5 — Final QA
- Click-through every route as every role; fix any dead control.
- Verify PIN-delete/recycle-bin/restore/purge, marks workflow, fee collection→receipt, admission approval, leave decision, library issue→fine, bus tracking+speed alert, notification send→log, document template switch + bulk download, language switch, theme switch, activate/deactivate cascade, hide/unhide.
- Provide a short `README.md` at repo root: how to run (`npm i && npm run dev`), demo credentials for all roles, and a feature tour.
- **DoD:** A reviewer can log in as any role and reach a correct, working result from every interactive element, on desktop and mobile, in both languages and both themes.

---

## DEFINITION OF DONE (whole project)

- All 14 roles: working login, dashboard, sidebar, and pages.
- 100% of `docs/02_SRS.md` functional requirements and 100% of the traceability matrix implemented (simulated where infrastructure is unavailable, but always with a correct visible outcome).
- Zero dead controls. Zero "coming soon".
- PIN-protected delete + 15-day recycle bin everywhere deletes occur.
- Export to Excel + PDF on lists; printable templated documents.
- Bilingual (en/hi), light/dark, fully responsive, accessible.
- Looks like a premium product per `docs/05_DESIGN_SYSTEM.md`.
- Root `README.md` with run instructions + demo credentials.

---

## ANTI-PATTERNS — DO NOT DO THESE

- ❌ Buttons/links that log to console or do nothing.
- ❌ "This feature is coming soon" placeholders.
- ❌ Hard-coded screens that ignore the seeded data or don't persist changes.
- ❌ Re-implementing tables/modals/forms per page instead of using shared components.
- ❌ Inline hex colors / magic spacing instead of design tokens.
- ❌ Inaccessible custom dropdowns/modals (no keyboard, no focus trap).
- ❌ Leaving any of the 78 Additional Demands or any role's modules unbuilt.
- ❌ Breaking layouts on mobile or in dark mode.

---

## HOW TO COMMUNICATE WITH ME DURING THE BUILD

- Start each phase by listing the files you'll create/modify.
- If a requirement is ambiguous, choose the most reasonable interpretation, **state the assumption**, and proceed (don't stall).
- At the end of each phase, give me: (1) what was built, (2) how to test it, (3) the phase DoD checklist ticked, (4) what's next.
- Keep a running `docs/BUILD_PROGRESS.md` checklist mirroring the traceability matrix, ticking items as you complete them, so we never lose track across sessions.

**Now begin with Phase 0. First, open the five companion docs in `./docs/`, then scaffold the project and confirm the plan.**
