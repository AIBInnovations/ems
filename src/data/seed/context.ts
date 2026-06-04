import { newId } from "@/lib/id";
import { nowISO } from "@/lib/clock";
import { Rng } from "@/lib/rng";
import type { CollectionName, EntityOf } from "@/types";
import { makeEmptyDB, type DBShape } from "../db/storage";

export const SEED_RNG = 0xed5ca7e;

export class SeedCtx {
  db: DBShape = makeEmptyDB();
  rng = new Rng(SEED_RNG);

  /** Insert a fully-formed row (id + timestamps auto-filled unless provided). */
  add<C extends CollectionName>(collection: C, partial: Partial<EntityOf<C>>): EntityOf<C> {
    const now = nowISO();
    const row = {
      id: newId(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      ...partial,
    } as EntityOf<C>;
    (this.db[collection] as Record<string, EntityOf<C>>)[row.id] = row;
    return row;
  }

  all<C extends CollectionName>(collection: C): EntityOf<C>[] {
    return Object.values(this.db[collection]) as EntityOf<C>[];
  }
}
