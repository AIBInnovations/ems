import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { nowISO } from "@/lib/clock";
import { logActivity } from "@/lib/activity";
import { createCrudService } from "@/lib/createService";
import { notificationService } from "./notificationService";
import type { LeaveApplication, LeaveStatus } from "@/types";

const base = createCrudService("leaveApplications", { label: (l) => l.reason, origin: "Leave", noun: "leave application" });

export const leaveService = {
  ...base,

  async apply(input: Partial<LeaveApplication>): Promise<LeaveApplication> {
    await latency();
    const app = db.insert("leaveApplications", { status: "pending", documents: [], extra: {}, ...input } as Partial<LeaveApplication>);
    logActivity("apply", "leaveApplications", app.id, "Submitted a leave application");
    return app;
  },

  async decide(id: string, decision: Exclude<LeaveStatus, "pending">, approverStaffId: string, note?: string) {
    await latency();
    const app = db.update("leaveApplications", id, { status: decision, approverStaffId, decidedAt: nowISO(), decisionNote: note });
    logActivity(decision, "leaveApplications", id, `Leave ${decision}`);
    const recipientId = app.studentId ?? app.applicantId;
    await notificationService.quick(
      `Leave ${decision === "approved" ? "Approved" : "Rejected"}`,
      `Your leave application has been ${decision}.${note ? " Note: " + note : ""}`,
      "member",
      "general",
      recipientId ? [recipientId] : [],
    );
    return app;
  },
};
