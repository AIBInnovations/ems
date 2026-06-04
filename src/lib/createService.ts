import { db } from "@/data/db";
import { latency } from "@/lib/latency";
import { logActivity } from "@/lib/activity";
import { softDelete as binSoftDelete } from "@/lib/bin";
import type { CollectionName, EntityOf } from "@/types";

export interface ServiceMeta<C extends CollectionName> {
  /** Human label for activity log + recycle bin entries. */
  label?: (row: EntityOf<C>) => string;
  /** Recycle-bin origin group (e.g. "Library"). */
  origin?: string;
  /** Verb used in the create/update activity summary. */
  noun?: string;
}

/**
 * Generic CRUD service. Domain services spread this and add workflow methods.
 * Signature-compatible with a future API-backed service (swap the body, keep the shape).
 */
export function createCrudService<C extends CollectionName>(collection: C, meta: ServiceMeta<C> = {}) {
  const noun = meta.noun ?? collection;
  const label = (row: EntityOf<C> | null) => (row ? meta.label?.(row) : undefined) ?? noun;

  return {
    collection,
    async list(filter?: (row: EntityOf<C>) => boolean): Promise<EntityOf<C>[]> {
      await latency();
      const rows = db.getAll(collection);
      return filter ? rows.filter(filter) : rows;
    },
    async get(id: string): Promise<EntityOf<C> | null> {
      await latency();
      return db.getById(collection, id);
    },
    async create(input: Partial<EntityOf<C>>): Promise<EntityOf<C>> {
      await latency();
      const row = db.insert(collection, input);
      logActivity("create", collection, row.id, `Created ${label(row)}`);
      return row;
    },
    async update(id: string, patch: Partial<EntityOf<C>>): Promise<EntityOf<C>> {
      await latency();
      const row = db.update(collection, id, patch);
      logActivity("update", collection, id, `Updated ${label(row)}`);
      return row;
    },
    async softDelete(id: string): Promise<void> {
      await latency();
      const row = db.getById(collection, id);
      binSoftDelete(collection, id, label(row), meta.origin ?? noun);
    },
    // Synchronous read helpers for render paths that already have data in memory.
    allSync(filter?: (row: EntityOf<C>) => boolean): EntityOf<C>[] {
      const rows = db.getAll(collection);
      return filter ? rows.filter(filter) : rows;
    },
    getSync(id: string): EntityOf<C> | null {
      return db.getById(collection, id);
    },
    querySync(predicate: (row: EntityOf<C>) => boolean): EntityOf<C>[] {
      return db.query(collection, predicate);
    },
  };
}

export type CrudServiceImpl<C extends CollectionName> = ReturnType<typeof createCrudService<C>>;
