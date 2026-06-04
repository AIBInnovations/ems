import { newId } from "@/lib/id";
import { nowISO } from "@/lib/clock";
import type { CollectionName, EntityOf } from "@/types";
import { buildSeed } from "../seed";
import {
  clearStorage,
  loadRaw,
  saveRaw,
  type DBShape,
} from "./storage";

let state: DBShape = init();

function init(): DBShape {
  const loaded = loadRaw();
  if (loaded && Object.keys(loaded.schools).length > 0) return loaded;
  const seeded = buildSeed();
  saveRaw(seeded, true);
  return seeded;
}

export const db = {
  /** Direct access to a collection map (read-only intent). */
  raw(): DBShape {
    return state;
  },

  getAll<C extends CollectionName>(
    collection: C,
    includeDeleted = false,
  ): EntityOf<C>[] {
    const rows = Object.values(state[collection]) as EntityOf<C>[];
    return includeDeleted ? rows : rows.filter((r) => !r.deletedAt);
  },

  getById<C extends CollectionName>(collection: C, id: string): EntityOf<C> | null {
    return (state[collection][id] as EntityOf<C> | undefined) ?? null;
  },

  query<C extends CollectionName>(
    collection: C,
    predicate: (row: EntityOf<C>) => boolean,
    includeDeleted = false,
  ): EntityOf<C>[] {
    return db.getAll(collection, includeDeleted).filter(predicate);
  },

  count<C extends CollectionName>(collection: C, predicate?: (row: EntityOf<C>) => boolean): number {
    const rows = db.getAll(collection);
    return predicate ? rows.filter(predicate).length : rows.length;
  },

  insert<C extends CollectionName>(collection: C, partial: Partial<EntityOf<C>>): EntityOf<C> {
    const now = nowISO();
    const row = {
      id: newId(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      ...partial,
    } as EntityOf<C>;
    (state[collection] as Record<string, EntityOf<C>>)[row.id] = row;
    saveRaw(state);
    return row;
  },

  update<C extends CollectionName>(
    collection: C,
    id: string,
    patch: Partial<EntityOf<C>>,
  ): EntityOf<C> {
    const existing = state[collection][id];
    if (!existing) throw new Error(`[db] ${collection}/${id} not found`);
    const next = { ...existing, ...patch, updatedAt: nowISO() } as EntityOf<C>;
    (state[collection] as Record<string, EntityOf<C>>)[id] = next;
    saveRaw(state);
    return next;
  },

  /** Hard remove — used only by recycle-bin purge / permanent delete. */
  remove<C extends CollectionName>(collection: C, id: string): void {
    delete state[collection][id];
    saveRaw(state);
  },

  commit(): void {
    saveRaw(state, true);
  },

  reset(): void {
    clearStorage();
    state = buildSeed();
    saveRaw(state, true);
  },
};

export type Db = typeof db;
