import { addDays, format, subDays, subMonths } from "date-fns";
import { humanId, newId } from "@/lib/id";
import { nowISO } from "@/lib/clock";
import type {
  AttendanceStatus,
  PaymentMode,
  RoleKey,
  StaffMember,
  Student,
} from "@/types";
import { SERVICE_MODULES } from "@/config/services-registry";
import type { DBShape } from "../db/storage";
import { SeedCtx } from "./context";
import {
  ACTIVITIES,
  BLOOD_GROUPS,
  BOOKS,
  CATEGORIES,
  CLASS_LADDER,
  DEMO_PASSWORD,
  DEMO_PIN,
  DEPARTMENTS,
  FEE_HEADS,
  FIRST_NAMES_F,
  FIRST_NAMES_M,
  GRADE_BANDS,
  HOLIDAYS,
  HOUSES,
  LAB_ITEMS,
  LAST_NAMES,
  RELIGIONS,
  STAFF_COUNTS,
  subjectsForLevel,
} from "./reference";

const STUDENTS_PER_SECTION_MIN = 7;
const STUDENTS_PER_SECTION_MAX = 11;
const ATTENDANCE_DAYS = 12;
const STAFF_ATTENDANCE_DAYS = 20;

const iso = (d: Date) => d.toISOString();
const dkey = (d: Date) => format(d, "yyyy-MM-dd");

/** Last N weekdays (skip Sunday) ending today. */
function schoolDays(count: number): Date[] {
  const out: Date[] = [];
  let cursor = new Date();
  while (out.length < count) {
    if (cursor.getDay() !== 0) out.unshift(new Date(cursor));
    cursor = subDays(cursor, 1);
  }
  return out;
}

function gradeFor(pct: number): string {
  return GRADE_BANDS.find((b) => pct >= b.min && pct <= b.max)?.grade ?? "E";
}

export function buildSeed(): DBShape {
  const ctx = new SeedCtx();
  const rng = ctx.rng;
  const now = nowISO();

  /* ── 1. System ─────────────────────────────────────────── */
  const school = ctx.add("schools", {
    name: "Sunrise Public School",
    diseCode: "23456789012",
    licenseNo: "MP/EDU/2009/4471",
    affiliationNo: "CBSE-1030456",
    address: "12 Vidya Marg, Civil Lines",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462001",
    phone: "+91 755 400 1234",
    email: "office@sunrisepublic.edu.in",
    website: "https://sunrisepublic.edu.in",
    socialLinks: {
      facebook: "https://facebook.com/sunrisepublic",
      instagram: "https://instagram.com/sunrisepublic",
      youtube: "https://youtube.com/@sunrisepublic",
      x: "https://x.com/sunrisepublic",
    },
    principalName: "Dr. Sharma",
    establishedYear: 2009,
    sessionStartMonth: 4,
    defaultLanguage: "en",
    isActive: true,
  });

  for (const s of SERVICE_MODULES) {
    ctx.add("serviceModules", {
      key: s.key,
      label: s.label,
      group: s.group,
      isEnabled: true,
      isVisible: true,
      requiredRoles: [],
    });
  }

  ctx.add("gradeScales", { name: "CBSE Standard", bands: GRADE_BANDS });

  const templateDefs: { type: import("@/types").TemplateType; name: string; style: "classic" | "modern" | "compact" }[] = [
    { type: "marksheet", name: "Classic Mark Sheet", style: "classic" },
    { type: "marksheet", name: "Modern Mark Sheet", style: "modern" },
    { type: "admitcard", name: "Standard Admit Card", style: "classic" },
    { type: "admitcard", name: "Compact Admit Card", style: "compact" },
    { type: "idcard", name: "Portrait ID Card", style: "modern" },
    { type: "idcard", name: "Classic ID Card", style: "classic" },
    { type: "receipt", name: "Default Receipt", style: "classic" },
    { type: "tc", name: "Transfer Certificate", style: "classic" },
    { type: "timetable", name: "Weekly Timetable", style: "modern" },
    { type: "certificate", name: "Achievement Certificate", style: "modern" },
  ];
  templateDefs.forEach((t, i) =>
    ctx.add("templates", {
      type: t.type,
      name: t.name,
      isDefault: i === templateDefs.findIndex((x) => x.type === t.type),
      layoutConfig: {
        accent: rng.pick(["#2f43c4", "#0f766e", "#b45309", "#7c3aed"]),
        showLogo: true,
        logoPosition: "left",
        showGrade: true,
        showPercentage: true,
        style: t.style,
      },
    }),
  );

  HOLIDAYS.forEach((h) => ctx.add("holidays", { ...h, recurring: false }));

  // a few dynamic field definitions to demo extensibility
  const fieldDefs: { scope: import("@/types").FieldDefinition["scope"]; key: string; label: string; type: import("@/types").FieldDefinition["type"]; required: boolean; options?: string[] }[] = [
    { scope: "admission", key: "previousSchool", label: "Previous School", type: "text", required: false },
    { scope: "student", key: "transportMode", label: "Transport Mode", type: "select", required: false, options: ["Bus", "Self", "Walk"] },
    { scope: "staff", key: "panNo", label: "PAN Number", type: "text", required: false },
    { scope: "leave", key: "contactDuringLeave", label: "Contact During Leave", type: "text", required: false },
  ];
  fieldDefs.forEach((f, i) =>
    ctx.add("fieldDefinitions", { ...f, order: i, visibleToRoles: [] }),
  );

  const academicYear = ctx.add("academicYears", {
    name: "2025-26",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    isCurrent: true,
  });

  /* ── 2. Academics: classes, sections, subjects ─────────── */
  const classes = CLASS_LADDER.map((c) =>
    ctx.add("classes", {
      name: c.name,
      numericLevel: c.level,
      academicYearId: academicYear.id,
      sectionIds: [],
      subjectIds: [],
    }),
  );

  // subjects deduped by code per level-group (one Subject row reused across classes)
  const subjectByCode = new Map<string, string>();
  classes.forEach((cls) => {
    const defs = subjectsForLevel(cls.numericLevel);
    const ids: string[] = [];
    defs.forEach((d) => {
      let id = subjectByCode.get(d.code + (cls.numericLevel <= 7 ? "P" : cls.numericLevel <= 10 ? "M" : "S"));
      if (!id) {
        const subj = ctx.add("subjects", {
          name: d.name,
          code: d.code,
          type: d.type,
          classIds: [],
          hasPractical: d.hasPractical ?? false,
          maxMarks: d.maxMarks ?? 100,
          passMarks: d.passMarks ?? 33,
        });
        id = subj.id;
        subjectByCode.set(d.code + (cls.numericLevel <= 7 ? "P" : cls.numericLevel <= 10 ? "M" : "S"), id);
      }
      ids.push(id);
      const subj = ctx.db.subjects[id];
      if (!subj.classIds.includes(cls.id)) subj.classIds.push(cls.id);
    });
    cls.subjectIds = ids;
  });

  const sections = classes.flatMap((cls) =>
    ["A", "B"].map((name, i) => {
      const sec = ctx.add("sections", {
        classId: cls.id,
        name,
        capacity: 40,
        roomNo: `${cls.numericLevel + 1}0${i + 1}`,
      });
      cls.sectionIds.push(sec.id);
      return sec;
    }),
  );

  /* ── 3. People: staff + users ──────────────────────────── */
  const allStaff: StaffMember[] = [];
  const demoUsernameByRole: Partial<Record<RoleKey, string>> = {};

  function makeStaff(roleKey: RoleKey, demo: boolean, idx: number): StaffMember {
    const female = rng.bool(0.45);
    const first = rng.pick(female ? FIRST_NAMES_F : FIRST_NAMES_M);
    const last = rng.pick(LAST_NAMES);
    const staff = ctx.add("staff", {
      employeeId: humanId.employee(),
      firstName: first,
      lastName: last,
      gender: female ? "female" : "male",
      dob: dkey(subMonths(new Date(), rng.int(300, 600))),
      roleKey,
      department: rng.pick(DEPARTMENTS),
      designation: roleKey.replace(/_/g, " "),
      qualifications: rng.sample(["B.Ed", "M.Ed", "M.Sc", "M.A", "B.Sc", "Ph.D", "MBA", "B.Com"], rng.int(1, 2)),
      joiningDate: dkey(subMonths(new Date(), rng.int(6, 120))),
      status: "active",
      contact: {
        phone: `+91 9${rng.int(100000000, 999999999)}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@sunrisepublic.edu.in`,
        address: `${rng.int(1, 200)} ${rng.pick(["MG Road", "Park Street", "Civil Lines", "New Market"])}, Bhopal`,
      },
      rating: Math.round((3.4 + rng.float() * 1.6) * 10) / 10,
      extra: {},
    } as Partial<StaffMember>);
    const username = demo ? roleKey : `${first.toLowerCase()}${staff.employeeId.split("-")[1]}`;
    if (demo) demoUsernameByRole[roleKey] = username;
    // salary structure
    const basic = rng.int(25, 70) * 1000;
    const ss = ctx.add("salaryStructures", {
      staffId: staff.id,
      basic,
      allowances: [
        { name: "HRA", amount: Math.round(basic * 0.2) },
        { name: "DA", amount: Math.round(basic * 0.1) },
      ],
      deductions: [{ name: "PF", amount: Math.round(basic * 0.12) }],
      grossMonthly: Math.round(basic * 1.3),
    });
    ctx.db.staff[staff.id].salaryStructureId = ss.id;
    ctx.add("users", {
      username,
      email: staff.contact.email,
      phone: staff.contact.phone,
      passwordHash: DEMO_PASSWORD,
      roleKey,
      linkedProfileType: "staff",
      linkedProfileId: staff.id,
      status: "active",
      pinHash: DEMO_PIN,
      languagePref: "en",
      lastLoginAt: idx % 3 === 0 ? iso(subDays(new Date(), rng.int(0, 4))) : null,
    });
    allStaff.push(ctx.db.staff[staff.id]);
    return ctx.db.staff[staff.id];
  }

  // super admin + admin (single each, demo)
  makeStaff("super_admin", true, 0);
  makeStaff("admin", true, 0);
  // other non-teaching roles
  for (const [role, count] of Object.entries(STAFF_COUNTS)) {
    for (let i = 0; i < count; i++) makeStaff(role as RoleKey, i === 0, i);
  }

  // teachers — enough to be class teachers (one per section) + extra subject teachers
  const teachers: StaffMember[] = [];
  for (let i = 0; i < sections.length + 8; i++) {
    const isClassTeacherSlot = i < sections.length;
    const demo =
      (i === sections.length - 1 && !demoUsernameByRole.class_teacher) ||
      (i === sections.length + 1 && !demoUsernameByRole.subject_teacher);
    const role: RoleKey = isClassTeacherSlot ? "class_teacher" : "subject_teacher";
    const t = makeStaff(role, false, i);
    teachers.push(t);
    if (isClassTeacherSlot) {
      const sec = sections[i];
      t.classTeacherOf = { classId: sec.classId, sectionId: sec.id };
      sec.classTeacherStaffId = t.id;
      ctx.db.classes[sec.classId].classTeacherStaffId = t.id;
    }
  }
  // designate explicit demo class_teacher (Class 10 A) & subject_teacher
  const class10 = classes.find((c) => c.name === "Class 10")!;
  const class10A = sections.find((s) => s.classId === class10.id && s.name === "A")!;
  const demoClassTeacher = teachers.find((t) => t.classTeacherOf?.sectionId === class10A.id)!;
  renameUser(ctx, demoClassTeacher.id, "class_teacher");
  demoUsernameByRole.class_teacher = "class_teacher";
  const demoSubjectTeacher = teachers.find((t) => t.roleKey === "subject_teacher")!;
  renameUser(ctx, demoSubjectTeacher.id, "subject_teacher");
  demoUsernameByRole.subject_teacher = "subject_teacher";

  /* ── Subject allocation + timetable per section ────────── */
  let teacherCursor = 0;
  const cstBySection = new Map<string, { subjectId: string; teacherId: string }[]>();
  sections.forEach((sec) => {
    const cls = ctx.db.classes[sec.classId];
    const allocs: { subjectId: string; teacherId: string }[] = [];
    cls.subjectIds.forEach((subjectId) => {
      const teacher = teachers[teacherCursor % teachers.length];
      teacherCursor++;
      ctx.add("classSubjectTeachers", {
        classId: cls.id,
        sectionId: sec.id,
        subjectId,
        teacherStaffId: teacher.id,
        academicYearId: academicYear.id,
      });
      if (!teacher.subjectsTaught) teacher.subjectsTaught = [];
      if (!teacher.subjectsTaught.includes(subjectId)) teacher.subjectsTaught.push(subjectId);
      allocs.push({ subjectId, teacherId: teacher.id });
    });
    cstBySection.set(sec.id, allocs);

    // timetable: Mon(1)–Sat(6), 6 periods, rotating subjects
    for (let day = 1; day <= 6; day++) {
      const times = ["08:00", "08:50", "09:40", "10:50", "11:40", "12:30"];
      for (let p = 0; p < 6; p++) {
        const alloc = allocs[(day + p) % allocs.length];
        const start = times[p];
        const [h, m] = start.split(":").map(Number);
        const end = `${String(h + (m + 45 >= 60 ? 1 : 0)).padStart(2, "0")}:${String((m + 45) % 60).padStart(2, "0")}`;
        ctx.add("timetable", {
          classId: cls.id,
          sectionId: sec.id,
          dayOfWeek: day,
          periodNo: p + 1,
          startTime: start,
          endTime: end,
          subjectId: alloc.subjectId,
          teacherStaffId: alloc.teacherId,
          room: sec.roomNo,
          type: p === 3 ? "period" : "period",
        });
      }
    }
  });

  ctx.add("bellSchedules", {
    enabled: true,
    periods: ["08:00", "08:50", "09:40", "10:50", "11:40", "12:30"].map((t, i) => ({
      periodNo: i + 1,
      startTime: t,
      endTime: t,
      label: `Period ${i + 1}`,
    })),
  });

  /* ── Students + guardians ──────────────────────────────── */
  const students: Student[] = [];

  sections.forEach((sec) => {
    const cls = ctx.db.classes[sec.classId];
    const n = rng.int(STUDENTS_PER_SECTION_MIN, STUDENTS_PER_SECTION_MAX);
    for (let i = 0; i < n; i++) {
      const female = rng.bool(0.48);
      const first = rng.pick(female ? FIRST_NAMES_F : FIRST_NAMES_M);
      const last = rng.pick(LAST_NAMES);
      const rollNum = i + 1;
      const student = ctx.add("students", {
        admissionNo: humanId.admission(2025),
        rollNo: humanId.roll(cls.numericLevel + 1, rollNum),
        firstName: first,
        lastName: last,
        gender: female ? "female" : "male",
        dob: dkey(subMonths(new Date(), (cls.numericLevel + 4) * 12 + rng.int(0, 11))),
        bloodGroup: rng.pick(BLOOD_GROUPS),
        classId: cls.id,
        sectionId: sec.id,
        academicYearId: academicYear.id,
        admissionDate: "2025-04-05",
        status: "active",
        house: rng.pick(HOUSES),
        category: rng.pick(CATEGORIES),
        religion: rng.pick(RELIGIONS),
        motherTongue: "Hindi",
        nationality: "Indian",
        ssmid: `SSM${rng.int(1000000, 9999999)}`,
        samagraId: `${rng.int(100000000, 999999999)}`,
        scholarNo: `SCH${rng.int(10000, 99999)}`,
        apaarId: `${rng.int(100000000000, 999999999999)}`,
        aadhaarMasked: `XXXX-XXXX-${rng.int(1000, 9999)}`,
        penNo: `PEN${rng.int(100000, 999999)}`,
        customIds: [],
        address: `${rng.int(1, 300)} ${rng.pick(["Shanti Nagar", "Arera Colony", "Kolar Road", "MP Nagar"])}, Bhopal`,
        city: "Bhopal",
        state: "Madhya Pradesh",
        pincode: "462001",
        emergencyContact: `+91 9${rng.int(100000000, 999999999)}`,
        guardianIds: [],
        previousMarksheetIds: [],
        extra: {},
      });
      students.push(student);

      // guardian (occasionally shared sibling guardian)
      const sibling = rng.bool(0.12) && students.length > 5 ? students[students.length - 2] : null;
      let guardianId: string;
      if (sibling && sibling.guardianIds[0]) {
        guardianId = sibling.guardianIds[0];
        ctx.db.guardians[guardianId].studentIds.push(student.id);
      } else {
        const g = ctx.add("guardians", {
          firstName: rng.pick(FIRST_NAMES_M),
          lastName: last,
          relation: rng.pick(["father", "mother", "guardian"] as const),
          phone: `+91 9${rng.int(100000000, 999999999)}`,
          email: `${last.toLowerCase()}.family@gmail.com`,
          occupation: rng.pick(["Business", "Service", "Doctor", "Engineer", "Teacher", "Farmer"]),
          studentIds: [student.id],
        });
        guardianId = g.id;
      }
      student.guardianIds.push(guardianId);
    }
  });

  // demo student = a Class 10 A student; demo parent = their guardian
  const demoStudent = students.find((s) => s.sectionId === class10A.id) ?? null;
  const demoGuardianId = demoStudent?.guardianIds[0] ?? null;

  // demo student + parent users
  if (demoStudent) {
    ctx.add("users", {
      username: "student",
      passwordHash: DEMO_PASSWORD,
      roleKey: "student",
      linkedProfileType: "student",
      linkedProfileId: demoStudent.id,
      status: "active",
      pinHash: DEMO_PIN,
      languagePref: "en",
      phone: demoStudent.emergencyContact,
    });
  }
  if (demoGuardianId) {
    // ensure demo guardian has a couple of children for the child switcher
    const g = ctx.db.guardians[demoGuardianId];
    const more = students.filter((s) => !g.studentIds.includes(s.id)).slice(0, 1);
    more.forEach((s) => {
      g.studentIds.push(s.id);
      s.guardianIds.push(g.id);
    });
    ctx.add("users", {
      username: "parent",
      passwordHash: DEMO_PASSWORD,
      roleKey: "parent",
      linkedProfileType: "guardian",
      linkedProfileId: g.id,
      status: "active",
      pinHash: DEMO_PIN,
      languagePref: "en",
      phone: g.phone,
    });
  }

  buildAttendance(ctx, students, allStaff);
  buildExams(ctx, students, sections, cstBySection, academicYear.id, gradeFor);
  buildFees(ctx, students, allStaff);
  buildLibrary(ctx, students, allStaff);
  buildLab(ctx, allStaff);
  buildSports(ctx, students, allStaff);
  buildTransport(ctx, students, allStaff);
  buildHomework(ctx, sections, cstBySection);
  buildContent(ctx, classes);
  buildComms(ctx, students, allStaff);
  buildEngagement(ctx, students, teachers, class10A.id);
  buildGovernance(ctx, allStaff);

  return ctx.db;
}

function renameUser(ctx: SeedCtx, staffId: string, username: string) {
  const user = Object.values(ctx.db.users).find((u) => u.linkedProfileId === staffId);
  if (user) user.username = username;
}

/* ───────────────────────── builders ───────────────────────── */

function buildAttendance(ctx: SeedCtx, students: Student[], staff: StaffMember[]) {
  const rng = ctx.rng;
  const days = schoolDays(ATTENDANCE_DAYS);
  const statuses: [AttendanceStatus, number][] = [
    ["present", 0.86],
    ["absent", 0.06],
    ["late", 0.04],
    ["leave", 0.03],
    ["half_day", 0.01],
  ];
  const teacherId = staff.find((s) => s.roleKey === "class_teacher")?.id ?? staff[0].id;
  students.forEach((st) => {
    days.forEach((d) => {
      const status = rng.weighted(statuses);
      ctx.add("studentAttendance", {
        studentId: st.id,
        classId: st.classId,
        sectionId: st.sectionId,
        date: format(d, "yyyy-MM-dd"),
        status,
        markedByStaffId: teacherId,
        markedAt: d.toISOString(),
        source: "manual",
      });
    });
  });
  const sdays = schoolDays(STAFF_ATTENDANCE_DAYS);
  staff.forEach((s) => {
    sdays.forEach((d) => {
      const present = rng.bool(0.92);
      ctx.add("staffAttendance", {
        staffId: s.id,
        date: format(d, "yyyy-MM-dd"),
        checkIn: present ? "08:05" : undefined,
        checkOut: present ? "15:30" : undefined,
        status: present ? "present" : rng.pick(["absent", "leave"] as const),
        workedHours: present ? 7.25 : 0,
        source: "biometric",
        payrollImpact: true,
      });
    });
  });
}

function buildExams(
  ctx: SeedCtx,
  students: Student[],
  sections: { id: string; classId: string }[],
  cstBySection: Map<string, { subjectId: string; teacherId: string }[]>,
  yearId: string,
  gradeFor: (n: number) => string,
) {
  const rng = ctx.rng;
  const published = ctx.add("exams", {
    name: "Half-Yearly Examination",
    academicYearId: yearId,
    type: "term",
    startDate: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    endDate: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    classIds: [],
    maxMarksDefault: 100,
    status: "published",
  });
  const ongoing = ctx.add("exams", {
    name: "Unit Test II",
    academicYearId: yearId,
    type: "unit",
    startDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 8), "yyyy-MM-dd"),
    classIds: [],
    maxMarksDefault: 25,
    status: "ongoing",
  });

  sections.forEach((sec) => {
    const allocs = cstBySection.get(sec.id) ?? [];
    const secStudents = students.filter((s) => s.sectionId === sec.id);
    // marks + verification (published)
    allocs.forEach((a) => {
      secStudents.forEach((st) => {
        const absent = rng.bool(0.03);
        const marks = absent ? 0 : rng.int(28, 99);
        ctx.add("marksEntries", {
          examId: published.id,
          classId: sec.classId,
          sectionId: sec.id,
          subjectId: a.subjectId,
          studentId: st.id,
          marksObtained: marks,
          maxMarks: 100,
          isAbsent: absent,
          enteredByStaffId: a.teacherId,
          enteredAt: nowISO(),
        });
      });
      ctx.add("markVerifications", {
        examId: published.id,
        classId: sec.classId,
        sectionId: sec.id,
        subjectId: a.subjectId,
        stage: "published",
        actedByStaffId: a.teacherId,
        actedAt: nowISO(),
        scope: "all",
      });
    });
    // report cards with rank
    const scored = secStudents.map((st) => {
      const subjMarks = allocs.map((a) => {
        const me = ctx.all("marksEntries").find((m) => m.examId === published.id && m.studentId === st.id && m.subjectId === a.subjectId);
        return { subjectId: a.subjectId, marks: me?.marksObtained ?? 0, max: 100, grade: gradeFor(me?.marksObtained ?? 0) };
      });
      const total = subjMarks.reduce((s, m) => s + m.marks, 0);
      const pct = subjMarks.length ? total / subjMarks.length : 0;
      return { st, subjMarks, total, pct };
    });
    scored.sort((a, b) => b.pct - a.pct);
    scored.forEach((row, idx) => {
      const failed = row.subjMarks.some((m) => m.marks < 33);
      ctx.add("reportCards", {
        studentId: row.st.id,
        examId: published.id,
        classId: sec.classId,
        sectionId: sec.id,
        subjects: row.subjMarks,
        total: row.total,
        percentage: Math.round(row.pct * 100) / 100,
        grade: gradeFor(row.pct),
        rank: idx + 1,
        result: failed ? "compartment" : "pass",
        publishedAt: nowISO(),
      });
    });
    // ongoing: a couple of subjects entered, awaiting verification (for the teacher workflow demo)
    allocs.slice(0, 2).forEach((a) => {
      secStudents.forEach((st) => {
        ctx.add("marksEntries", {
          examId: ongoing.id,
          classId: sec.classId,
          sectionId: sec.id,
          subjectId: a.subjectId,
          studentId: st.id,
          marksObtained: rng.int(8, 25),
          maxMarks: 25,
          isAbsent: false,
          enteredByStaffId: a.teacherId,
          enteredAt: nowISO(),
        });
      });
      ctx.add("markVerifications", {
        examId: ongoing.id,
        classId: sec.classId,
        sectionId: sec.id,
        subjectId: a.subjectId,
        stage: "entered",
        scope: "single",
      });
    });
  });
}

function buildFees(ctx: SeedCtx, students: Student[], staff: StaffMember[]) {
  const rng = ctx.rng;
  const accountant = staff.find((s) => s.roleKey === "accountant")?.id ?? staff[0].id;
  const heads = FEE_HEADS.map((h) => ctx.add("feeHeads", h));
  const tuition = heads.find((h) => h.name === "Tuition Fee")!;
  const exam = heads.find((h) => h.name === "Exam Fee")!;
  const library = heads.find((h) => h.name === "Library Fee")!;

  const structure = ctx.add("feeStructures", {
    name: "Standard 2025-26",
    academicYearId: ctx.all("academicYears")[0].id,
    items: [
      { feeHeadId: tuition.id, amount: 2500, dueDay: 10 },
      { feeHeadId: exam.id, amount: 800, dueDay: 10 },
      { feeHeadId: library.id, amount: 600, dueDay: 10 },
    ],
    applicableTo: "all",
  });

  const concession = ctx.add("concessions", {
    name: "Sibling Discount",
    type: "percent",
    value: 10,
    appliesToHeads: [tuition.id],
    grantedByStaffId: accountant,
    reason: "Second child in school",
  });

  const modes: PaymentMode[] = ["cash", "upi", "card", "netbanking", "online"];
  students.forEach((st, i) => {
    const assignment = ctx.add("feeAssignments", {
      studentId: st.id,
      feeStructureId: structure.id,
      academicYearId: structure.academicYearId,
      concessionId: i % 9 === 0 ? concession.id : null,
      customAdjustments: [],
    });
    st.feeAssignmentId = assignment.id;
    const totalDue = 3900;
    const roll = rng.float();
    let paid = totalDue;
    let status: import("@/types").FeeStatus = "paid";
    if (roll < 0.18) { paid = 0; status = "due"; }
    else if (roll < 0.32) { paid = Math.round(totalDue / 2); status = "partial"; }
    else if (roll < 0.42) { paid = 0; status = "overdue"; }
    const dueDate = format(roll < 0.42 ? subDays(new Date(), 8) : addDays(new Date(), 6), "yyyy-MM-dd");
    const bill = ctx.add("feeBills", {
      invoiceNo: humanId.invoice(2025),
      studentId: st.id,
      period: "Q2 2025-26",
      lineItems: [
        { feeHeadId: tuition.id, amount: 2500 },
        { feeHeadId: exam.id, amount: 800 },
        { feeHeadId: library.id, amount: 600 },
      ],
      lateFee: status === "overdue" ? 100 : 0,
      concessionApplied: i % 9 === 0 ? 250 : 0,
      totalDue,
      totalPaid: paid,
      balance: totalDue - paid + (status === "overdue" ? 100 : 0),
      status,
      dueDate,
    });
    if (paid > 0) {
      ctx.add("payments", {
        receiptNo: humanId.receipt(2025),
        billId: bill.id,
        studentId: st.id,
        amount: paid,
        mode: rng.pick(modes),
        paidAt: iso(subDays(new Date(), rng.int(1, 30))),
        collectedByStaffId: accountant,
        channel: rng.bool(0.4) ? "online" : "counter",
        status: "success",
      });
    }
  });

  // expenses + reimbursement + reconciliation
  const cats = ["utilities", "maintenance", "supplies", "transport", "other"] as const;
  for (let i = 0; i < 18; i++) {
    ctx.add("expenses", {
      voucherNo: humanId.voucher(),
      category: rng.pick(cats),
      amount: rng.int(2, 60) * 1000,
      date: format(subDays(new Date(), rng.int(1, 60)), "yyyy-MM-dd"),
      paidTo: rng.pick(["MP Power Co", "City Stationers", "AquaPure", "BuildRight", "FuelStop"]),
      mode: rng.pick(["cash", "netbanking", "cheque"] as const),
      description: "Operational expense",
      enteredByStaffId: accountant,
      status: "recorded",
    });
  }
  // a teacher reimbursement request
  const aTeacher = staff.find((s) => s.roleKey === "class_teacher")!;
  ctx.add("expenses", {
    voucherNo: humanId.voucher(),
    category: "supplies",
    amount: 3200,
    date: format(subDays(new Date(), 3), "yyyy-MM-dd"),
    paidTo: aTeacher.firstName + " " + aTeacher.lastName,
    mode: "cash",
    description: "Science exhibition materials",
    enteredByStaffId: aTeacher.id,
    requestedByStaffId: aTeacher.id,
    isReimbursement: true,
    status: "pending",
  });

  // payroll for last month (from attendance)
  staff.forEach((s) => {
    if (s.roleKey === "super_admin") return;
    const ss = ctx.all("salaryStructures").find((x) => x.staffId === s.id);
    if (!ss) return;
    const present = ctx.all("staffAttendance").filter((a) => a.staffId === s.id && a.status === "present").length;
    ctx.add("payrollRecords", {
      staffId: s.id,
      month: format(subMonths(new Date(), 1), "yyyy-MM"),
      presentDays: present,
      paidDays: present,
      computedGross: ss.grossMonthly,
      deductions: ss.deductions.reduce((a, d) => a + d.amount, 0),
      netPay: ss.grossMonthly - ss.deductions.reduce((a, d) => a + d.amount, 0),
      status: "finalized",
      source: "attendance",
      generatedAt: nowISO(),
    });
  });

  ctx.add("bankReconciliations", {
    statementRef: "HDFC-OCT-2025",
    date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
    entries: ctx.all("payments").slice(0, 10).map((p) => ({ paymentId: p.id, amount: p.amount, matched: rng.bool(0.8) })),
    status: "open",
  });
}

function buildLibrary(ctx: SeedCtx, students: Student[], staff: StaffMember[]) {
  const rng = ctx.rng;
  const librarian = staff.find((s) => s.roleKey === "librarian")?.id ?? staff[0].id;
  const books = BOOKS.map((b) => {
    const total = rng.int(3, 12);
    return ctx.add("books", {
      isbn: `978-${rng.int(1000000000, 9999999999)}`,
      title: b.title,
      author: b.author,
      publisher: rng.pick(["Penguin", "NCERT", "S. Chand", "Oxford", "Rupa"]),
      category: b.category,
      language: b.language,
      totalCopies: total,
      availableCopies: total,
      shelf: `${rng.pick(["A", "B", "C", "D"])}-${rng.int(1, 20)}`,
      isDigital: rng.bool(0.2),
    });
  });
  // members + loans
  const memberStudents = rng.sample(students, 40);
  const members = memberStudents.map((st) =>
    ctx.add("libraryMembers", {
      memberType: "student",
      personId: st.id,
      cardNo: humanId.card("LIB"),
      maxBooks: 3,
      joinedAt: "2025-04-10",
      status: "active",
    }),
  );
  members.forEach((m, i) => {
    if (i % 2 !== 0) return;
    const book = rng.pick(books);
    const copy = ctx.add("bookCopies", { bookId: book.id, accessionNo: humanId.accession(), status: "issued", condition: "good" });
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    const overdue = rng.bool(0.3);
    const issueDate = subDays(new Date(), overdue ? 25 : 8);
    const dueDate = addDays(issueDate, 14);
    const loan = ctx.add("bookLoans", {
      copyId: copy.id,
      bookId: book.id,
      memberId: m.id,
      issueDate: format(issueDate, "yyyy-MM-dd"),
      dueDate: format(dueDate, "yyyy-MM-dd"),
      returnDate: null,
      status: overdue ? "overdue" : "issued",
      issuedByStaffId: librarian,
    });
    if (overdue) {
      const fine = ctx.add("libraryFines", {
        loanId: loan.id,
        memberId: m.id,
        amount: 11 * 2,
        reason: "late",
        status: "pending",
      });
      loan.fineId = fine.id;
    }
  });
  // a reservation
  ctx.add("bookReservations", {
    bookId: books[0].id,
    memberId: members[1].id,
    reservedAt: nowISO(),
    status: "active",
    queuePosition: 1,
  });
}

function buildLab(ctx: SeedCtx, staff: StaffMember[]) {
  const rng = ctx.rng;
  const labAsst = staff.find((s) => s.roleKey === "lab_assistant")?.id ?? staff[0].id;
  const items = LAB_ITEMS.map((it) =>
    ctx.add("labItems", {
      name: it.name,
      category: it.category,
      labType: it.labType,
      quantity: it.qty,
      unit: it.unit,
      reorderLevel: it.reorder,
      location: `${it.labType} Lab`,
      condition: "good",
    }),
  );
  // an issue + a low-stock + maintenance
  ctx.add("labIssues", {
    itemId: items[0].id,
    quantity: 2,
    issuedToType: "staff",
    issuedToId: staff.find((s) => s.roleKey === "subject_teacher")!.id,
    purpose: "Practical demonstration",
    issueDate: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    returnDate: null,
    status: "issued",
    issuedByStaffId: labAsst,
  });
  items[3].quantity = items[3].reorderLevel - 20; // chemical low stock
  ctx.add("labMaintenance", {
    labType: "physics",
    type: "safety-check",
    date: format(subDays(new Date(), 6), "yyyy-MM-dd"),
    note: "Quarterly safety inspection completed",
    byStaffId: labAsst,
    status: "done",
  });
  ctx.add("labBookings", {
    labType: "chemistry",
    classId: ctx.all("classes").find((c) => c.name === "Class 9")!.id,
    sectionId: "",
    subjectId: "",
    teacherStaffId: staff.find((s) => s.roleKey === "subject_teacher")!.id,
    date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    startTime: "10:50",
    endTime: "11:35",
    purpose: "Acid-base titration",
    status: "approved",
  });
}

function buildSports(ctx: SeedCtx, students: Student[], staff: StaffMember[]) {
  const rng = ctx.rng;
  const coaches = staff.filter((s) => s.roleKey === "sports_coach");
  ACTIVITIES.forEach((a, i) => {
    const coach = coaches[i % Math.max(1, coaches.length)];
    const activity = ctx.add("activities", {
      name: a.name,
      category: a.category,
      coachStaffId: coach?.id,
      iconKey: a.icon,
      schedule: [{ day: rng.int(1, 6), startTime: "15:30", endTime: "16:30", venue: "Playground" }],
      description: `${a.name} training and competitions`,
    });
    const roster = rng.sample(students, rng.int(8, 14));
    const team = ctx.add("teams", {
      activityId: activity.id,
      name: `${a.name} Team A`,
      ageGroup: "U-16",
      gender: "mixed",
      coachStaffId: coach?.id,
      playerStudentIds: roster.map((s) => s.id),
    });
    roster.forEach((s) =>
      ctx.add("players", { studentId: s.id, activityId: activity.id, teamId: team.id, joinedAt: "2025-04-15", level: rng.pick(["beginner", "intermediate", "advanced"]) }),
    );
    if (i < 3) {
      ctx.add("activityEvents", {
        activityId: activity.id,
        title: `Inter-School ${a.name} Tournament`,
        date: format(addDays(new Date(), rng.int(5, 20)), "yyyy-MM-dd"),
        venue: "District Stadium",
        type: "competition",
        participants: roster.slice(0, 6).map((s) => s.id),
        result: i === 0 ? "Winners" : undefined,
      });
    }
    ctx.add("equipment", { activityId: activity.id, name: `${a.name} Kit`, quantity: rng.int(5, 20), condition: "good", status: "available" });
  });
}

function buildTransport(ctx: SeedCtx, students: Student[], staff: StaffMember[]) {
  const rng = ctx.rng;
  const drivers = staff.filter((s) => s.roleKey === "bus_driver");
  const helpers = staff.filter((s) => s.roleKey === "bus_helper");
  // Bhopal-ish coordinates for stops
  const routeSeeds = [
    { name: "Route 1 — Arera Colony", base: [23.2156, 77.4304] },
    { name: "Route 2 — Kolar Road", base: [23.1765, 77.4220] },
    { name: "Route 3 — MP Nagar", base: [23.2330, 77.4350] },
  ];
  const assignedStudents = rng.sample(students, Math.min(60, students.length));
  let sIdx = 0;
  routeSeeds.forEach((rs, i) => {
    const driver = drivers[i % Math.max(1, drivers.length)];
    const helper = helpers[i % Math.max(1, helpers.length)];
    const vehicle = ctx.add("vehicles", {
      vehicleNo: `MP04-BUS-${1000 + i}`,
      type: "bus",
      capacity: 40,
      model: rng.pick(["Tata Starbus", "Ashok Leyland", "Eicher Skyline"]),
      driverStaffId: driver?.id,
      helperStaffId: helper?.id ?? null,
      fitnessExpiry: "2026-08-31",
      insuranceExpiry: "2026-05-15",
      status: "active",
    });
    const route = ctx.add("routes", {
      name: rs.name,
      vehicleId: vehicle.id,
      stopIds: [],
      startTime: "07:00",
      endTime: "08:00",
      distanceKm: rng.int(8, 18),
      speedLimitKmph: 80,
    });
    if (driver) { driver.assignedVehicleId = vehicle.id; driver.assignedRouteId = route.id; driver.licenseNo = `MP04 2021${rng.int(1000, 9999)}`; driver.licenseExpiry = "2027-03-31"; }
    const stopCount = rng.int(4, 6);
    for (let k = 0; k < stopCount; k++) {
      const stop = ctx.add("stops", {
        routeId: route.id,
        name: `${rs.name.split("—")[1].trim()} Stop ${k + 1}`,
        lat: rs.base[0] + k * 0.004 + rng.float() * 0.001,
        lng: rs.base[1] + k * 0.004 + rng.float() * 0.001,
        sequence: k,
        pickupTime: `07:${String(10 + k * 8).padStart(2, "0")}`,
        dropTime: `15:${String(10 + k * 8).padStart(2, "0")}`,
      });
      route.stopIds.push(stop.id);
    }
    const routeStops = route.stopIds;
    const count = i === 0 ? 24 : i === 1 ? 20 : 16;
    for (let k = 0; k < count && sIdx < assignedStudents.length; k++, sIdx++) {
      const st = assignedStudents[sIdx];
      st.transportRouteId = route.id;
      ctx.add("tripAssignments", {
        studentId: st.id,
        routeId: route.id,
        stopId: rng.pick(routeStops),
        type: "both",
      });
    }
    // today's morning trip (route 1 is "started" with live tracking + speed alert)
    const trip = ctx.add("trips", {
      routeId: route.id,
      vehicleId: vehicle.id,
      driverStaffId: driver?.id ?? "",
      date: format(new Date(), "yyyy-MM-dd"),
      kind: "morning",
      status: i === 0 ? "started" : "scheduled",
      startedAt: i === 0 ? iso(subDays(new Date(), 0)) : undefined,
      presentCount: i === 0 ? 18 : 0,
      absentCount: i === 0 ? 2 : 0,
    });
    if (i === 0) {
      const firstStop = ctx.db.stops[route.stopIds[0]];
      ctx.add("incidents", {
        tripId: trip.id,
        vehicleId: vehicle.id,
        driverStaffId: driver?.id ?? "",
        type: "route-issue",
        description: "Minor traffic delay near Arera junction",
        date: format(new Date(), "yyyy-MM-dd"),
        severity: "low",
        status: "open",
        photos: [],
      });
      ctx.add("vehicleChecklists", {
        vehicleId: vehicle.id,
        driverStaffId: driver?.id ?? "",
        date: format(new Date(), "yyyy-MM-dd"),
        items: [
          { label: "Brakes", ok: true },
          { label: "Lights", ok: true },
          { label: "Tyres", ok: true },
          { label: "First-aid kit", ok: true },
          { label: "Fire extinguisher", ok: false, note: "Refill due" },
        ],
        fuelLevel: 70,
        odometer: 48210,
        status: "issues",
      });
      // seed a current live location with an over-speed example
      ctx.add("vehicleChecklists", {
        vehicleId: vehicle.id,
        driverStaffId: driver?.id ?? "",
        date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
        items: [{ label: "Brakes", ok: true }],
        fuelLevel: 55,
        odometer: 48190,
        status: "ok",
      });
      void firstStop;
    }
  });
}

function buildHomework(
  ctx: SeedCtx,
  sections: { id: string; classId: string }[],
  cstBySection: Map<string, { subjectId: string; teacherId: string }[]>,
) {
  const rng = ctx.rng;
  sections.slice(0, 14).forEach((sec) => {
    const allocs = cstBySection.get(sec.id) ?? [];
    allocs.slice(0, 2).forEach((a) => {
      ctx.add("homework", {
        classId: sec.classId,
        sectionId: sec.id,
        subjectId: a.subjectId,
        teacherStaffId: a.teacherId,
        title: rng.pick(["Chapter exercises", "Worksheet", "Reading & summary", "Project work"]),
        description: "Complete the assigned exercises and submit by due date.",
        assignedDate: format(subDays(new Date(), 2), "yyyy-MM-dd"),
        dueDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        attachments: [],
        status: "open",
      });
    });
  });
}

function buildContent(ctx: SeedCtx, classes: { id: string; name: string; subjectIds: string[] }[]) {
  const rng = ctx.rng;
  const targets = classes.filter((c) => ["Class 9", "Class 10"].includes(c.name));
  const chapters = ["Introduction & Overview", "Core Concepts", "Worked Examples", "Practice Problems", "Real-world Applications", "Summary & Key Points", "Revision Exercises", "Sample Questions"];
  targets.forEach((cls) => {
    cls.subjectIds.slice(0, 3).forEach((subjectId) => {
      const subj = ctx.db.subjects[subjectId];
      ctx.add("syllabusBooks", {
        classId: cls.id,
        subjectId,
        title: `${subj?.name ?? "Subject"} — ${cls.name}`,
        totalPages: chapters.length,
        pages: chapters.map((title, i) => ({
          pageNo: i + 1,
          title: `Chapter ${i + 1}: ${title}`,
          body: `${title}\n\nThis chapter covers ${subj?.name ?? "the subject"} for ${cls.name}. It introduces the key ideas, provides worked examples, and ends with practice exercises to reinforce understanding.\n\n• Learning objective ${i + 1}.1 — understand the fundamentals.\n• Learning objective ${i + 1}.2 — apply concepts to problems.\n• Learning objective ${i + 1}.3 — review and self-assess.\n\nWork through the examples carefully and attempt all practice questions before moving to the next chapter.`,
        })),
      });
    });
  });
  // a scheduled live class + a quiz on the demo class
  const demo = targets.find((c) => c.name === "Class 10");
  if (demo) {
    const subjectId = demo.subjectIds[0];
    const cst = ctx.all("classSubjectTeachers").find((c) => c.classId === demo.id && c.subjectId === subjectId);
    ctx.add("liveClasses", {
      title: `${ctx.db.subjects[subjectId]?.name ?? "Live"} Revision Class`,
      classId: demo.id,
      hostStaffId: cst?.teacherStaffId ?? "",
      scheduledAt: iso(addDays(new Date(), 1)),
      status: "scheduled",
      recipientScope: "class",
      joinUrl: "demo://room/" + newId(),
      participants: [],
    });
    ctx.add("quizzes", {
      classId: demo.id,
      subjectId,
      title: "Quick Quiz — Chapter 1",
      totalMarks: 5,
      dueDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
      questions: [
        { id: newId(), text: "What is the SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], correctIndex: 0, marks: 1 },
        { id: newId(), text: "Water freezes at?", options: ["0°C", "100°C", "50°C", "-10°C"], correctIndex: 0, marks: 1 },
        { id: newId(), text: "2 + 2 × 2 = ?", options: ["6", "8", "4", "10"], correctIndex: 0, marks: 1 },
      ],
    });
  }
  void rng;
}

function buildComms(ctx: SeedCtx, students: Student[], staff: StaffMember[]) {
  const rng = ctx.rng;
  const admin = staff.find((s) => s.roleKey === "admin")!;
  ctx.add("notifications", {
    title: "Half-Yearly Results Published",
    body: "Results for the Half-Yearly Examination are now available. Please check the Results section.",
    audience: "all",
    audienceRefs: [],
    channels: ["push", "sms", "email"],
    attachments: [],
    status: "sent",
    sentByStaffId: admin.id,
    sentAt: iso(subDays(new Date(), 2)),
    category: "exam",
    deliveryLog: [],
  });
  ctx.add("notifications", {
    title: "Fee Reminder — Q2",
    body: "This is a gentle reminder that Q2 fees are due. Kindly pay at the earliest to avoid late charges.",
    audience: "parents",
    audienceRefs: [],
    channels: ["whatsapp", "sms"],
    attachments: [],
    status: "sent",
    sentByStaffId: staff.find((s) => s.roleKey === "accountant")!.id,
    sentAt: iso(subDays(new Date(), 1)),
    category: "fee",
    deliveryLog: [],
  });
  ctx.add("notices", {
    title: "Annual Sports Day — Save the Date",
    body: "The Annual Sports Day will be held on the school grounds. Parents are cordially invited.",
    audience: "all",
    attachments: [],
    publishedAt: iso(subDays(new Date(), 4)),
    publishedByStaffId: staff.find((s) => s.roleKey === "principal")!.id,
    pinned: true,
  });

  // inquiries
  ["website", "app", "walk-in", "phone"].forEach((src, i) =>
    ctx.add("inquiries", {
      source: src as import("@/types").Inquiry["source"],
      name: `${rng.pick(FIRST_NAMES_M)} ${rng.pick(LAST_NAMES)}`,
      phone: `+91 9${rng.int(100000000, 999999999)}`,
      email: "parent@example.com",
      subject: "Admission inquiry for Class " + rng.int(1, 9),
      message: "I would like to know about the admission process and fee structure.",
      status: i === 0 ? "replied" : "new",
      reply: i === 0 ? "Thank you for your interest. Our admission desk will contact you shortly." : undefined,
    }),
  );

  // complaints
  ctx.add("complaints", {
    fromName: "Parent of " + students[0].firstName,
    category: "Transport",
    subject: "Bus arriving late",
    description: "The morning bus has been arriving 15 minutes late this week.",
    status: "open",
    targetRole: "principal",
  });

  // visitors + couriers + appointments
  for (let i = 0; i < 6; i++) {
    const inOnly = rng.bool(0.4);
    ctx.add("visitors", {
      visitorName: `${rng.pick(FIRST_NAMES_M)} ${rng.pick(LAST_NAMES)}`,
      phone: `+91 9${rng.int(100000000, 999999999)}`,
      purpose: rng.pick(["Meet Principal", "Fee enquiry", "Admission", "Document collection"]),
      inTime: iso(subDays(new Date(), rng.int(0, 3))),
      outTime: inOnly ? null : iso(subDays(new Date(), rng.int(0, 3))),
      badgeNo: humanId.badge(),
      status: inOnly ? "in" : "out",
    });
  }
  for (let i = 0; i < 5; i++) {
    ctx.add("couriers", {
      direction: rng.pick(["inward", "outward"] as const),
      company: rng.pick(["BlueDart", "DTDC", "India Post", "Delhivery"]),
      party: rng.pick(["CBSE Board", "Vendor", "Parent", "District Office"]),
      description: rng.pick(["Examination papers", "Office supplies", "Certificates", "Official letter"]),
      refNo: humanId.tracking(),
      date: format(subDays(new Date(), rng.int(0, 10)), "yyyy-MM-dd"),
      amount: rng.bool(0.5) ? rng.int(40, 400) : undefined,
      receivedByStaffId: staff.find((s) => s.roleKey === "receptionist")!.id,
      status: rng.pick(["received", "dispatched", "delivered"] as const),
    });
  }
  for (let i = 0; i < 4; i++) {
    ctx.add("appointments", {
      withStaffId: staff.find((s) => s.roleKey === "principal")!.id,
      requestedByName: `${rng.pick(FIRST_NAMES_M)} ${rng.pick(LAST_NAMES)}`,
      phone: `+91 9${rng.int(100000000, 999999999)}`,
      purpose: rng.pick(["Discuss progress", "Admission counselling", "Fee concession request"]),
      dateTime: iso(addDays(new Date(), rng.int(1, 5))),
      status: rng.pick(["requested", "confirmed"] as const),
    });
  }

  // chat: a direct thread + a group
  const adminUser = Object.values(ctx.db.users).find((u) => u.roleKey === "admin")!;
  const teacherUser = Object.values(ctx.db.users).find((u) => u.username === "class_teacher")!;
  const parentUser = Object.values(ctx.db.users).find((u) => u.roleKey === "parent");
  if (parentUser) {
    const direct = ctx.add("chatThreads", {
      kind: "direct",
      memberUserIds: [teacherUser.id, parentUser.id],
      createdByUserId: parentUser.id,
      lastMessageAt: iso(subDays(new Date(), 0)),
    });
    ctx.add("chatMessages", { threadId: direct.id, senderUserId: parentUser.id, text: "Good morning, how is my child doing in Maths?", attachments: [], sentAt: iso(subDays(new Date(), 0)), readBy: [parentUser.id] });
    ctx.add("chatMessages", { threadId: direct.id, senderUserId: teacherUser.id, text: "Good morning! Doing well, scored 88 in the recent test.", attachments: [], sentAt: iso(new Date()), readBy: [teacherUser.id] });
  }
  const group = ctx.add("chatThreads", {
    kind: "group",
    title: "Class 10-A Parents",
    description: "Official class group",
    memberUserIds: [teacherUser.id, adminUser.id, ...(parentUser ? [parentUser.id] : [])],
    adminUserIds: [teacherUser.id],
    createdByUserId: teacherUser.id,
    lastMessageAt: iso(subDays(new Date(), 1)),
  });
  ctx.add("chatMessages", { threadId: group.id, senderUserId: teacherUser.id, text: "PTM is scheduled for this Saturday at 10 AM.", attachments: [], sentAt: iso(subDays(new Date(), 1)), readBy: [teacherUser.id] });
}

function buildEngagement(ctx: SeedCtx, students: Student[], teachers: StaffMember[], classSectionId: string) {
  const rng = ctx.rng;
  // ratings (so Admin can demo "who rated")
  const studentUsers = Object.values(ctx.db.users).filter((u) => u.roleKey === "student");
  const rater = studentUsers[0] ?? Object.values(ctx.db.users).find((u) => u.roleKey === "parent")!;
  rng.sample(teachers, 6).forEach((t, i) => {
    ctx.add("ratings", {
      raterUserId: rater?.id ?? "",
      raterName: rater?.username ?? "student",
      targetType: "teacher",
      targetId: t.id,
      stars: rng.int(3, 5),
      comment: i % 2 === 0 ? "Very helpful and clear in explanations." : undefined,
    });
  });

  // prayer
  ctx.add("prayers", { title: "Morning Prayer", kind: "text", content: "Asato ma sadgamaya, Tamaso ma jyotirgamaya, Mrityorma amritam gamaya. Om Shanti Shanti Shanti.", language: "sa", enabled: true, order: 0 });
  ctx.add("prayers", { title: "School Anthem", kind: "audio", url: "demo://anthem", language: "en", enabled: true, order: 1 });

  // events
  ctx.add("events", { title: "Parent-Teacher Meeting", description: "Quarterly PTM for all classes.", date: format(addDays(new Date(), 5), "yyyy-MM-dd"), type: "ptm", audience: "parents", venue: "School Auditorium", attachments: [], status: "approved" });
  ctx.add("events", { title: "Annual Day", description: "Cultural performances and prize distribution.", date: "2026-03-21", type: "cultural", audience: "all", venue: "Main Ground", attachments: [], status: "planned" });

  // top-3 sliders (students by rank, teachers by rating)
  const top3Students = ctx.all("reportCards").filter((r) => r.sectionId === classSectionId).sort((a, b) => a.rank - b.rank).slice(0, 3);
  ctx.add("highlightSliders", {
    kind: "top-students",
    classId: ctx.all("sections").find((s) => s.id === classSectionId)?.classId,
    entries: top3Students.map((r, i) => ({ personType: "student", personId: r.studentId, metric: `${r.percentage}%`, rank: i + 1 })),
    rotateSeconds: 6,
  });
  const topTeachers = [...teachers].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  ctx.add("highlightSliders", {
    kind: "top-teachers",
    entries: topTeachers.map((t, i) => ({ personType: "staff", personId: t.id, metric: `${t.rating}★`, rank: i + 1 })),
    rotateSeconds: 6,
  });

  // service charges
  ctx.add("serviceCharges", { label: "App Service Charge", amount: 50, appliesTo: "all", note: "Annual platform charge", visible: true });
  ctx.add("serviceCharges", { label: "SMS Pack", amount: 30, appliesTo: "parent", note: "Optional SMS alerts", visible: true });

  // classroom activity feed
  const ct = teachers.find((t) => t.classTeacherOf?.sectionId === classSectionId);
  if (ct) {
    ctx.add("classroomActivities", {
      classId: ct.classTeacherOf!.classId,
      sectionId: classSectionId,
      teacherStaffId: ct.id,
      date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      title: "Science Model Making",
      description: "Students built working models of the solar system today.",
      photos: [],
      type: "classwork",
    });
  }

  // leave applications (pending → for class teacher demo)
  const aStudent = students.find((s) => s.sectionId === classSectionId);
  if (aStudent) {
    ctx.add("leaveApplications", {
      applicantType: "parent-for-student",
      applicantId: aStudent.guardianIds[0] ?? "",
      studentId: aStudent.id,
      type: "sick",
      fromDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      toDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
      reason: "Fever and rest advised by doctor",
      documents: [],
      status: "pending",
      extra: {},
    });
  }

  // discipline + achievement
  if (aStudent) {
    ctx.add("disciplineRecords", { studentId: aStudent.id, type: "achievement", date: format(subDays(new Date(), 7), "yyyy-MM-dd"), description: "Won first prize in district science fair", byStaffId: ct?.id ?? "" });
  }
}

function buildGovernance(ctx: SeedCtx, staff: StaffMember[]) {
  const rng = ctx.rng;
  const adminUser = Object.values(ctx.db.users).find((u) => u.roleKey === "admin")!;
  // pre-soft-deleted recycle bin items
  const books = ctx.all("books");
  if (books[books.length - 1]) {
    const b = books[books.length - 1];
    b.deletedAt = nowISO();
    ctx.add("recycleBin", {
      entityType: "books",
      entityId: b.id,
      snapshot: { ...b },
      label: `Book — ${b.title}`,
      deletedByUserId: adminUser.id,
      deletedByName: "admin",
      expiresAt: format(addDays(new Date(), 13), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      origin: "Library",
    });
  }

  // activity log backfill (representative)
  const actions = [
    { action: "login", entity: "users", summary: "Signed in" },
    { action: "create", entity: "students", summary: "Added a new student" },
    { action: "approve", entity: "admissions", summary: "Approved an admission" },
    { action: "collect", entity: "payments", summary: "Collected a fee payment" },
    { action: "publish", entity: "reportCards", summary: "Published exam results" },
    { action: "update", entity: "timetable", summary: "Updated the timetable" },
    { action: "send", entity: "notifications", summary: "Sent a notification" },
    { action: "issue", entity: "bookLoans", summary: "Issued a library book" },
    { action: "delete", entity: "books", summary: "Moved a book to recycle bin" },
  ];
  for (let i = 0; i < 45; i++) {
    const a = rng.pick(actions);
    const actor = rng.pick(staff);
    ctx.add("activityLog", {
      actorUserId: Object.values(ctx.db.users).find((u) => u.linkedProfileId === actor.id)?.id ?? adminUser.id,
      actorName: `${actor.firstName} ${actor.lastName}`,
      actorRoleKey: actor.roleKey,
      action: a.action,
      entityType: a.entity,
      entityId: newId(),
      summary: a.summary,
      at: iso(subDays(new Date(), rng.int(0, 14))),
    });
  }
}
