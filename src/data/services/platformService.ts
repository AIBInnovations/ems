import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { logActivity } from "@/lib/activity";
import { useServicesStore } from "@/store/services";
import type { School } from "@/types";

export interface SchoolMetrics {
  students: number;
  staff: number;
  monthlyRevenue: number;
  attendancePct: number;
}

/** Resolve a school's metrics: live for the primary school, stored summary for sisters. */
export function schoolMetrics(school: School): SchoolMetrics {
  if (!school.isPrimary && school.metrics) return school.metrics;
  const students = db.getAll("students").length;
  const staff = db.getAll("staff").filter((s) => s.roleKey !== "super_admin").length;
  const monthlyRevenue = db.getAll("payments").reduce((s, p) => (p.status === "success" ? s + p.amount : s), 0);
  const att = db.getAll("studentAttendance");
  const latest = att.reduce((m, a) => (a.date > m ? a.date : m), "");
  const todays = att.filter((a) => a.date === latest);
  const attendancePct = todays.length ? Math.round((todays.filter((a) => a.status === "present").length / todays.length) * 100) : 0;
  return { students, staff, monthlyRevenue, attendancePct };
}

export interface PlatformStats {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  totalStudents: number;
  totalStaff: number;
  totalRevenue: number; // fee collection rolled up across schools
  mrr: number; // subscription monthly recurring revenue
  overdueAccounts: number;
  schools: { school: School; metrics: SchoolMetrics }[];
}

export function platformStats(): PlatformStats {
  const schools = db.getAll("schools");
  const rows = schools.map((school) => ({ school, metrics: schoolMetrics(school) }));
  const active = schools.filter((s) => s.isActive);
  return {
    totalSchools: schools.length,
    activeSchools: active.length,
    suspendedSchools: schools.length - active.length,
    totalStudents: rows.reduce((s, r) => s + r.metrics.students, 0),
    totalStaff: rows.reduce((s, r) => s + r.metrics.staff, 0),
    totalRevenue: rows.reduce((s, r) => s + r.metrics.monthlyRevenue, 0),
    mrr: schools.reduce((s, sc) => (sc.subscriptionStatus !== "trial" && sc.isActive ? s + Math.round((sc.subscriptionAmount ?? 0) / 12) : s), 0),
    overdueAccounts: schools.filter((s) => s.subscriptionStatus === "overdue").length,
    schools: rows,
  };
}

export const platformService = {
  list: async () => {
    await latency();
    return db.getAll("schools");
  },

  /** Activate/suspend a school. The primary school's flag drives the login cascade. */
  async setSchoolActive(schoolId: string, active: boolean) {
    await latency();
    db.update("schools", schoolId, { isActive: active });
    logActivity(active ? "activate" : "deactivate", "schools", schoolId, `${active ? "Activated" : "Suspended"} school`);
    const primary = db.getAll("schools").find((s) => s.isPrimary);
    if (primary && primary.id === schoolId) useServicesStore.getState().setSchoolActive(active);
  },

  async setPlan(schoolId: string, plan: NonNullable<School["plan"]>, subscriptionAmount: number) {
    await latency();
    db.update("schools", schoolId, { plan, subscriptionAmount });
    logActivity("plan", "schools", schoolId, `Changed plan to ${plan}`);
  },

  async markBilling(schoolId: string, status: NonNullable<School["subscriptionStatus"]>) {
    await latency();
    db.update("schools", schoolId, { subscriptionStatus: status });
    logActivity("billing", "schools", schoolId, `Marked subscription ${status}`);
  },
};
