import { db } from "@/data/db";
import { nowISO } from "@/lib/clock";
import { getCurrentActor } from "@/lib/actor";

/** Append an audit entry. Called by every meaningful service mutation. */
export function logActivity(
  action: string,
  entityType: string,
  entityId: string,
  summary: string,
  meta?: Record<string, unknown>,
): void {
  const actor = getCurrentActor();
  db.insert("activityLog", {
    actorUserId: actor.userId,
    actorName: actor.name,
    actorRoleKey: actor.role,
    action,
    entityType,
    entityId,
    summary,
    meta,
    at: nowISO(),
  });
}
