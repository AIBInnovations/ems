import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO } from "@/lib/clock";
import { logActivity } from "@/lib/activity";
import { notificationService } from "./notificationService";

export const transportService = {
  async startTrip(tripId: string) {
    await latency();
    db.update("trips", tripId, { status: "started", startedAt: nowISO() });
    logActivity("trip", "trips", tripId, "Started trip");
  },
  async endTrip(tripId: string) {
    await latency();
    db.update("trips", tripId, { status: "completed", endedAt: nowISO() });
    logActivity("trip", "trips", tripId, "Completed trip");
  },
  async markBoarding(tripId: string, studentId: string, type: "pickup" | "drop", status: "present" | "absent" | "missed") {
    await latency(60, 160);
    const existing = db.query("transportAttendance", (a) => a.tripId === tripId && a.studentId === studentId && a.type === type)[0];
    const trip = db.getById("trips", tripId);
    const payload = { tripId, studentId, type, status, time: nowISO(), markedByDriverId: trip?.driverStaffId ?? "" };
    if (existing) db.update("transportAttendance", existing.id, payload);
    else db.insert("transportAttendance", payload);
    // recompute counts
    const present = db.query("transportAttendance", (a) => a.tripId === tripId && a.status === "present").length;
    const absent = db.query("transportAttendance", (a) => a.tripId === tripId && a.status !== "present").length;
    db.update("trips", tripId, { presentCount: present, absentCount: absent });
  },
  /** Fired by the live tracker when speed exceeds the route limit. */
  async raiseSpeedAlert(routeId: string, speed: number, limit: number) {
    const route = db.getById("routes", routeId);
    const studentIds = db.query("tripAssignments", (t) => t.routeId === routeId).map((t) => t.studentId);
    await notificationService.send({
      title: "⚠ Bus Over-Speed Alert",
      body: `${route?.name ?? "Bus"} is travelling at ${Math.round(speed)} km/h, above the ${limit} km/h limit.`,
      audience: "member",
      audienceRefs: studentIds,
      channels: ["push", "sms"],
      category: "transport",
    });
    logActivity("alert", "routes", routeId, `Over-speed alert: ${Math.round(speed)} km/h`);
  },
};
