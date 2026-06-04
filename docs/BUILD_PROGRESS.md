# EMS Suite — Build Progress

> Living checklist. **Open this first each session; update it last.** Mirrors the SRS
> traceability matrix and the phase DoDs. Resume from the first unchecked item.

## Decisions / assumptions (read first)
- Folder convention = doc 01 tree, with `db.ts` split into `src/data/db/{storage,index}.ts` + `src/data/seed/*`.
- `schemaVersion` = 4 (`src/data/db/storage.ts`). Bump → forces re-seed.
- i18n strategy: `t("key", "English default")` inline; Hindi overrides in `src/i18n/hi.json`; common keys also in `en.json`.
- Visual: design-system doc as written — Ink-Indigo/Marigold/Teal, **dark navy sidebar**, Bricolage + Plus Jakarta Sans (+ Mukta for Hindi). CONFIRMED by user.
- Binaries (uploads) → IndexedDB later; seed avatars are initials-on-tint (no image bytes).
- Demo accounts: username = role key, password `demo1234`, delete PIN `1234`.

## Verification status
- `npx tsc --noEmit` → clean. `npm run build` → succeeds (3329 modules; vendor chunks split).
- Playwright smoke: login → admin dashboard → students table (10 rows) → dark mode → **no console errors**. ✅

---

## Phase 0 — Foundation & engine  ✅ DONE
- [x] Scaffold Vite + React 18 + TS, Tailwind, design tokens (`index.css`, `tailwind.config.ts`), fonts.
- [x] Types + zod contracts (`src/types/*`: enums, ~90 entities, collections map, rbac, nav, resource).
- [x] Mock data layer: `db/storage`, `db/index` (typed CRUD), coherent versioned **seed** (~275 students, 59 staff, all domains).
- [x] `createCrudService` factory, `bin` (soft-delete/restore/purge/autoPurge), `activity` log, `latency`, `rng`, `id`, `clock`, `format`, `export`.
- [x] 26 shadcn/ui primitives (`components/ui/*`).
- [x] Shared components: InitialsAvatar, StatusPill, RoleBadge, EmptyState, PageHeader, StatCard, Charts, ExportMenu, **DataTable**, **FormModal**, **dialogs** (PIN→confirm→bin), **ResourceListPage** engine.
- [x] Stores: ui (theme/lang/density/sidebar), auth, services (registry + grants + school cascade).
- [x] i18n (en/hi) + RBAC resolver (`lib/rbac` `useCan`/`canAccessNow`).
- **DoD:** ✅ boots; theme + language toggle; students list via config with sort/filter/paginate/column-vis/row-select + Export (xlsx/pdf); delete → PIN → confirm → Recycle Bin.

## Phase 1 — Auth & RBAC  🟡 MOSTLY DONE
- [x] Login (15 one-click demo chips, brand panel, password + PIN hint).
- [x] Forgot/reset password flow (simulated). Lock screen.
- [x] `config/roles.ts` allow/deny matrix (all 16 role keys) + `ROLE_BASE_ROUTE` + `ROLE_AREA`.
- [x] Route guards (`Guard` in `router.tsx`): area-match + permission + service → `/403`. 403/404 pages.
- [x] Sidebar + router generated from `config/navigation.ts` (14 areas, 165 items), RBAC-filtered.
- [x] Services-registry store wired to `useCan` (toggling a service hides nav + 403s route + greys actions).
- [ ] Super-Admin screens to actually toggle services / activate-deactivate members / school cascade UI (logic exists in store; **screens pending** — Phase 2/3).
- [ ] Verify deactivation-blocks-login + Admin→school cascade end-to-end via UI.

## Phase 2 — Shared-domain resources  🟢 SUBSTANTIALLY DONE
- [x] **36 ResourceConfig screens** wired & typechecking & verified rendering: students, staff, classes, subjects, exams, books, reservations, fines, labItems, labIssues, labBookings, labMaintenance, activities, teams, equipment, vehicles, routes, incidents, notices, inquiries, complaints, visitors, couriers, appointments, expenses, payroll, feeStructures, events, holidays, ratings, discipline, templates, fields, homework, learning, leave. (Generated via parallel workflow against the studentResource template.)
- [x] Bespoke workflow screens: **Notification Center** (compose→send→log), **Fee Collection** (collect→receipt→balance), **Marks** (enter→verify→approve→publish→ranks), **Activity Monitor**, **Service Registry** (hide/unhide + activate/deactivate + school cascade).
- [x] Recycle Bin, Settings (reset demo), Profile, Help, Search.
- [x] `screens.tsx` registry maps ~80 of ~95 route slugs to real screens (area-aware). Verified across admin/super-admin/teacher/accountant/parent with RBAC 403 enforced; **zero console errors**.
- [x] Bespoke screens DONE: **attendance grid** (same-day edit lock), **transport live-map** (leaflet + simulated mover + speed alert), **chat** (1:1 + groups + select-all), **syllabus reader** (page nav + jump), **live-video room**, **library issue/return** (auto-fine), **leave decide** (approve/reject actions), **Home** (topper/top-3 slider/highest-rated teacher + parent child-switcher).
- [x] Print routes `/print/{receipt,marksheet,id-card,admit-card}/:id` + PrintLayout (Print / Save-PDF). Verified.
- [x] Seed content added (syllabusBooks + quiz + liveClass); schemaVersion → 5.
- [x] Fixed Button asChild+loading Slot crash. Re-verified parent/student/teacher screens — zero console errors.
- [ ] Remaining bespoke: admission approve dialog, biometric import UI, reports/analytics dashboards, reconciliation, school-profile editor, delete-permissions grant matrix, timetable grid, promotions wizard, timetable/TC print views.
- [ ] ~12 long-tail slugs still on functional `PlaceholderScreen`.

## Phase 3 — Role experiences  ✅ DONE
- [x] **13 role-specific priority dashboards** (`features/dashboard/roles/*` + `DashboardRouter` dispatch by role). Each surfaces only that role's highest-priority daily work — fee chart lives ONLY on Accountant; Super Admin = members/services; Principal = approvals/attendance (no fees); Teacher = "my class" tasks; Driver = trip/route/counts; etc. Verified: fee chart on Accountant only, 0 page errors across all roles. Shared `features/dashboard/blocks.tsx` (DashHeader/StatGrid/Panel/ListCard/QuickActions + data helpers).
- [x] Parent/Student **Home** with engagement widgets + child-switcher.
- [x] UX polish: `scrollbar-gutter:stable` (0px layout shift on dialog open — verified), fade-only page transitions, rebuilt Donut (center total + HTML legend), promotions/documents-center/school-profile real screens, doc row-actions (ID/marksheet/admit/TC), TC print.
- [ ] **Nav completeness gaps to close:** teacher needs a `leave` route (decide student leave); admin/principal/parent need `tracking` (live map); examiner verification → MarksScreen (wired by slug, confirm nav). Audit each role's sidebar vs IA §3–16 and ensure every item maps to a real screen (not placeholder).
- [ ] Specialize dashboards per role (currently shared RoleDashboard for staff roles; parent/student use Home).

## Phase 3 — Role experiences  ⬜ PENDING
- [ ] Per-role dashboards (generic `RoleDashboard` exists; specialize per role with role-appropriate cards/charts).
- [ ] Wire every sidebar item for all 14 areas to a real screen with correct permission/scope.
- [ ] Parent child-switcher; Driver big-tap UI; Student/Parent comfortable density.

## Phase 4 — Cross-cutting (78 FR-X) & polish  🟢 MOSTLY DONE
**FR-X audit (78 demands):** ~74/78 fully implemented, 4 simulated/partial. Map:
- 1 ActivityMonitor · 2 print docs+StudentDetail · 3/17 NotificationCenter+Fee reminders+student bulk-notify · 4 inquiryResource · 5 visitor/courier · 6/22 complaintResource · 7 ratingResource(admin-only) · 8/42 AttendanceScreen(same-day lock) · 9 attendance/perf views · 10 Chat+Marks+StudentDetail · 11/12/13 Chat groups+Select-All · 14/70 LiveTracking(map+speed alert) · 16/47 per-doc print + list export *(batch-zip = enhancement)* · 18 teachers→staff · 19/20/21 inquiries/visitor/courier · 23 feeStructure+concessions · 24 Reports+payroll · 25/26 expenses(+reimbursement) · 27 **RateTeachers (new)** · 28 ServiceRegistry · 29/30/71/75 Home widgets · 31 classroomResource · 32 list export · 33 school socials · 34 Profile/StudentDetail · 35/68 Marks workflow · 36 PIN-delete→RecycleBin · 37 PermissionMatrix · 38 autoPromote(service) · 39 routes/vehicles · 40 LiveTracking counts · 41 learningResource · 43/55 NotificationCenter(WA/SMS) · 44 payroll(source=attendance) · 45 **biometric sync (new)** · 46 FeeCollection · 48 **staff activate/deactivate (new)** · 49/50 ServiceRegistry cascade · 51 templates · 52 MarksheetPrint(%+grade) · 53 uploadLimits(settings model) · 54/65 Timetable · 56 register-import *(stub)* · 57 fieldResource(dynamic) · 58 attendance parent alert · 59 leave decide · 60 SyllabusReader · 61 StudentDetail results · 62 child-switcher · 63 activities(dynamic) · 64 holidayResource · 66 **prayer on Home (new)** · 67 BellSchedule(model) *(no ring UI)* · 69 Chat · 72 IDs/School · 73 rank on Home/StudentDetail · 74 extraClasses(model) · 76 EN/हिं toggle · 77 ReceiptPrint · 78 LiveVideoRoom.
- **Simulated/partial (noted, not dead):** 15 in-school student GPS (optional, not built), 16/47 batch document zip (per-doc print + Excel/PDF list export work), 67 bell-ring UI, 74 extra-class scheduling form. All have data models; flagged as enhancements.
- [x] Home widgets (topper/highest-rated/top-3 slider). [x] ⌘K palette. [x] Code-split heavy chart/map screens (`React.lazy`) — charts+maps deferred from initial bundle.
- [ ] Deep Hindi translation of screen bodies (chrome + toggle work; screen text falls back to English via `t(key, "English")`).
- [ ] Responsive/motion final pass.

## Phase 5 — Final QA  ⬜ PENDING
- [ ] Click every route as every role; verify marquee workflows; root `README.md` (run + creds + tour).

---
## Next action
Finish Phase 2 bespoke screens: (1) Attendance grid w/ same-day edit rule, (2) Transport live-map (react-leaflet + simulated mover + speed alert), (3) Print/PDF routes (`/print/receipt/:id` etc.) + PrintLayout, (4) Library issue/return dialog, (5) Chat, (6) Syllabus reader, (7) leave decide + admission approve actions. Then Phase 3 per-role dashboards. Register each new slug in `src/app/screens.tsx`.
