# 📘 Education Management System (EMS) — Build Documentation Package

**Project codename:** `ems-suite`
**Type:** Role-based Education Management *software* (admin/dashboard application), web + responsive — built as a fully working, clickable React application with a persistent mock-data layer.
**Source of truth:** The 84-page supplied PDF (`Education_Management_System_Complete_Transcription.md`). **Every** point in that PDF has been captured here. Nothing has been dropped — see the **Requirements Traceability Matrix** in `02_SRS.md` (Appendix A).

---

## 1. What is in this package

You asked for a complete prompt + SRS + "all the things" so you can paste them into the **Claude extension inside VS Code** (Claude Code) and have it build the software for you. This package contains seven documents. Read them in this order:

| # | File | What it is | Who/what it's for |
|---|------|-----------|-------------------|
| 00 | `00_README_START_HERE.md` | This file — the index + how to use the package | You |
| 01 | `01_MASTER_BUILD_PROMPT.md` | **The main prompt.** Paste this into Claude Code. It tells Claude exactly what to build, the stack, the rules, and the build order (phases). | Claude Code |
| 02 | `02_SRS.md` | Formal **Software Requirements Specification** — every functional + non-functional requirement, plus the full traceability matrix proving no PDF point was skipped. | You + Claude Code (reference) |
| 03 | `03_PERSONAS_AND_USER_STORIES.md` | 14 personas + hundreds of user stories with acceptance criteria, grouped by role. | You + Claude Code (reference) |
| 04 | `04_INFORMATION_ARCHITECTURE.md` | Every **sidebar, section, route, page, modal, and dropdown** for all 14 roles. This is the navigation blueprint. | Claude Code (reference) |
| 05 | `05_DESIGN_SYSTEM.md` | The **UI/UX design system** — colors, typography, spacing, components, motion, accessibility. Makes the result professional, elegant, smooth. | Claude Code (reference) |
| 06 | `06_DATA_MODEL.md` | All **entities, fields, and relationships** + the mock-data/seed strategy so everything is clickable and "works". | Claude Code (reference) |

---

## 2. How to use this in VS Code (step-by-step)

1. **Create a new empty folder** on your computer, e.g. `ems-suite/`.
2. Inside it, create a `docs/` folder and **drop all seven `.md` files** into `docs/`.
3. Open the folder in **VS Code**.
4. Open the **Claude Code** extension panel.
5. Paste the entire contents of **`01_MASTER_BUILD_PROMPT.md`** as your first message. It instructs Claude to read the other docs in `docs/` for detail.
6. Build is organized into **phases** (see the prompt). After each phase, tell Claude: *"Phase complete. Run it, verify the Definition of Done for this phase, then continue to the next phase."*
7. If a session runs long or hits limits, start a fresh chat and paste: *"Continue building ems-suite. Read `docs/01_MASTER_BUILD_PROMPT.md` and `docs/04_INFORMATION_ARCHITECTURE.md`, review what already exists in the repo, and resume from the first unfinished phase in the checklist."*

> **Tip:** Claude Code works best when it can see the docs. Keeping them in `docs/` (not pasted inline every time) lets Claude open and re-read them as needed, which keeps context usage low and accuracy high.

---

## 3. Scope decisions made for you (read this)

The PDF describes a product targeting **React, web + Android + iOS, with live GPS, attendance machines, payment gateway, WhatsApp/SMS/Email APIs**. Those native/hardware/third-party pieces require real backend infrastructure, credentials, and physical devices that cannot exist inside a VS Code front-end build. So this package is engineered to deliver the **complete software experience as a working web application** with these explicit, honest substitutions:

| PDF asks for | What we build (so it's fully clickable & demoable) | Upgrade path (noted in SRS) |
|---|---|---|
| Real payment gateway | A simulated checkout flow that generates real receipts and updates balances | Swap mock `paymentService` for Razorpay/Stripe SDK |
| Live GPS bus tracking, speed | An animated map with simulated bus movement, speed, and geofence/speed-limit alerts | Connect to a GPS/IoT feed |
| Attendance machine (biometric) | A "device sync" button that imports a mock biometric punch file → drives salary calc | Integrate device SDK/CSV import |
| WhatsApp / SMS / Email APIs | A unified **Notification Center** that composes, queues, and logs messages (shown as "sent") | Wire to Twilio / WhatsApp Cloud API / SMTP |
| Live video / live classes | A streaming UI shell (join/host room, participant list, controls) using a placeholder video surface | Integrate WebRTC / Agora / 100ms |
| Native mobile (Android/iOS) | A **fully responsive** web app (mobile-first layouts) that behaves like an app | Wrap with Capacitor or build React Native |

**Everything else** — all 14 role logins, dashboards, CRUD, approvals, workflows, modals, dropdowns, search, export to Excel/PDF, recycle bin, PIN-protected delete, RBAC, ratings, chat groups, dynamic forms, templates, bilingual Hindi/English, recycle bin, holiday calendar, syllabus reader, leave workflows, marks-verification workflow, etc. — is built as **real, working, persistent client-side functionality**. Nothing is a dead button.

---

## 4. The one rule that governs the whole build

> **No dead ends.** From the login screen to the deepest sub-page, *every* button, link, tab, dropdown, toggle, modal, form, filter, search box, export, and action must do something real and visible. If a feature needs a backend that doesn't exist, it is simulated with the mock-data layer so the user still sees a correct, satisfying result. A button that does nothing is a bug.

---

*Prepared as a complete hand-off package. Proceed to `01_MASTER_BUILD_PROMPT.md`.*
