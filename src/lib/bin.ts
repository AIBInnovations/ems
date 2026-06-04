import { db } from "@/data/db";
import { nowISO, expiryFrom, daysUntil } from "@/lib/clock";
import { getCurrentActor } from "@/lib/actor";
import { logActivity } from "@/lib/activity";
import type { CollectionName } from "@/types";

/**
 * The single soft-delete path: sets deletedAt + creates a RecycleBinItem (15-day TTL).
 * PIN verification + confirm happen in the UI before this is ever called.
 */
export function softDelete(collection: CollectionName, id: string, label: string, origin: string): void {
  const row = db.getById(collection, id);
  if (!row) return;
  const now = nowISO();
  db.update(collection, id, { deletedAt: now } as never);
  const actor = getCurrentActor();
  db.insert("recycleBin", {
    entityType: collection,
    entityId: id,
    snapshot: { ...row, deletedAt: now },
    label,
    deletedByUserId: actor.userId,
    deletedByName: actor.name,
    expiresAt: expiryFrom(now),
    origin,
  });
  logActivity("delete", collection, id, `Moved to recycle bin: ${label}`);
}

export function restore(binItemId: string): void {
  const item = db.getById("recycleBin", binItemId);
  if (!item) return;
  db.update(item.entityType as CollectionName, item.entityId, { deletedAt: null } as never);
  db.remove("recycleBin", binItemId);
  logActivity("restore", item.entityType, item.entityId, `Restored: ${item.label}`);
}

export function purge(binItemId: string): void {
  const item = db.getById("recycleBin", binItemId);
  if (!item) return;
  db.remove(item.entityType as CollectionName, item.entityId);
  db.remove("recycleBin", binItemId);
  logActivity("purge", item.entityType, item.entityId, `Permanently deleted: ${item.label}`);
}

/** Runs once on app load: hard-removes items older than 15 days. */
export function autoPurge(): number {
  const items = db.getAll("recycleBin");
  let removed = 0;
  for (const item of items) {
    if (daysUntil(item.expiresAt) < 0) {
      db.remove(item.entityType as CollectionName, item.entityId);
      db.remove("recycleBin", item.id);
      removed++;
    }
  }
  return removed;
}
