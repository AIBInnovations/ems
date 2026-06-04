import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { fullName } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import { createCrudService } from "@/lib/createService";
import type { UserStatus } from "@/types";

const base = createCrudService("staff", { label: (s) => fullName(s.firstName, s.lastName), origin: "Staff", noun: "staff member" });

export const staffService = {
  ...base,

  /** Activate/deactivate a member: flips both the staff record and its login. */
  async setActive(staffId: string, active: boolean) {
    await latency();
    const status: UserStatus = active ? "active" : "inactive";
    db.update("staff", staffId, { status });
    const user = db.query("users", (u) => u.linkedProfileId === staffId)[0];
    if (user) db.update("users", user.id, { status });
    logActivity(active ? "activate" : "deactivate", "staff", staffId, `${active ? "Activated" : "Deactivated"} member`);
  },

  userFor(staffId: string) {
    return db.query("users", (u) => u.linkedProfileId === staffId)[0] ?? null;
  },
};
