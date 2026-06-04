# EMS Suite — Education Management System

A complete, clickable, role-based **Education Management System** for schools — built as a React web app with a persistent client-side (localStorage) mock backend. **14 roles**, ~90 entities, ~165 screens, full RBAC, recycle bin, bilingual Hindi/English, light/dark, Excel/PDF export, printable templated documents, live bus tracking, and the full marks → results workflow.

> Every interactive control produces a real, visible result — **no dead ends**. Where real infrastructure (payments, GPS, biometric, messaging, video) would be needed, it's faithfully **simulated** with a correct outcome and a subtle "Demo" badge.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:
```bash
npm run build        # tsc --noEmit + vite production build
npm run typecheck    # tsc --noEmit
npm run preview      # preview the production build
```

## Demo accounts

On the login screen, click any **role chip** to sign in instantly, or type the username manually.

| | | |
|---|---|---|
| `super_admin` | `admin` | `principal` |
| `accountant` | `receptionist` | `librarian` |
| `lab_assistant` | `examiner` | `sports_coach` |
| `class_teacher` | `subject_teacher` | `bus_driver` |
| `other_staff` | `parent` | `student` |

- **Password:** `demo1234`
- **Delete PIN:** `1234`

All data persists in your browser. Reset it anytime from **Settings → Reset demo data** (Admin / Super Admin).

## Feature tour

- **Auth & RBAC** — per-role login, forgot/reset, lock screen; route guards (unauthorized → 403); a single permission resolver drives the sidebar, route guards and action gating.
- **Super Admin** — Service Registry to **hide/unhide & activate/deactivate** any module (changes apply instantly everywhere); deactivating the school **cascades** to all members (login blocked, data retained).
- **Students & Staff** — full CRUD with dynamic admission fields, identity IDs (SSMID/Samagra/APAAR…), per-student profile (overview, attendance, results, fees), promotions, transfer certificates.
- **Marks workflow** — subject-teacher enters → class-teacher verifies → **approve & publish** → report cards with auto-computed **ranks**, visible to students/parents.
- **Fees** — collect → **receipt** → balance update, dues/defaulters, reminders, structures, expenses, payroll, reconciliation.
- **Attendance** — quick P/A/L/Leave grid with the **same-day edit lock** (later edits need Principal/Admin); absentee parent alerts; biometric import.
- **Library / Lab / Sports** — catalog, **issue → return → auto-fine**, reservations; lab inventory/issues/bookings/maintenance; activities/teams/events/equipment.
- **Transport** — routes, vehicles, **live map tracking** (Leaflet) with simulated mover, **speed gauge + over-speed alerts** to parents/admin.
- **Communication** — Notification Center (compose → audience + WhatsApp/SMS/Email/push → **sent log**), WhatsApp-style **Chat & Groups** (Select-All), notices, inquiries, complaints, visitor & courier books, appointments.
- **Documents** — printable **Receipt / Mark Sheet / ID Card / Admit Card** (`/print/*`, Print / Save-PDF), template library.
- **Engagement** — Parent/Student **Home** with class topper slider, highest-rated teacher, **single-login child switcher**, syllabus reader, live-video room, ratings, events, holiday calendar.
- **Governance** — PIN-protected delete → **Recycle Bin (15-day restore)**, Activity Monitor (audit log), delete-permission grant matrix, reports & analytics.
- **Everywhere** — global ⌘K command palette, search/filter/sort/paginate/column-visibility + **Excel/PDF export** on lists, **light/dark**, **English/हिंदी**, responsive down to mobile.

## Tech stack

Vite · React 18 · TypeScript · Tailwind + shadcn/ui (Radix) · react-router-dom · Zustand · react-hook-form + zod · TanStack Table · Recharts · react-leaflet · i18next · SheetJS (xlsx) · jsPDF · Framer Motion · lucide-react · date-fns.

## Architecture (high level)

- **`src/data/`** — `db/` (typed localStorage store + versioned seed) and `services/` (one per domain: CRUD + workflows + activity log + soft-delete-to-recycle-bin). Swappable for a real API.
- **`src/config/`** — `roles.ts` (permission matrix), `navigation.ts` (per-role sidebars as data), `services-registry.ts`.
- **`src/components/shared/`** — the config-driven engine: one `DataTable` + `FormModal` + `ResourceListPage` renders most CRUD screens from a `ResourceConfig`.
- **`src/features/`** — role areas + shared-domain screens (bespoke workflows compose the same shared atoms).
- **`src/lib/rbac.ts`** — the single `canAccess` resolver feeding sidebar + guards + actions.

See `docs/` for the full SRS, information architecture, design system, data model, and the live build checklist (`docs/BUILD_PROGRESS.md`).

---
*Demo build — all integrations simulated client-side. Data persists locally per browser.*
