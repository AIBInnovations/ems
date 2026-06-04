import { COLLECTION_NAMES, type CollectionName, type EntityOf } from "@/types";

/** Bump to force a re-seed (migration boundary). */
export const SCHEMA_VERSION = 7;
export const STORAGE_KEY = `ems-suite:v${SCHEMA_VERSION}`;
export const LEGACY_PREFIX = "ems-suite:v";

export type DBShape = {
  [C in CollectionName]: Record<string, EntityOf<C>>;
};

export function makeEmptyDB(): DBShape {
  const db = {} as DBShape;
  for (const name of COLLECTION_NAMES) {
    (db as Record<string, unknown>)[name] = {};
  }
  return db;
}

export function loadRaw(): DBShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DBShape>;
    // ensure every collection exists even if seed predates a new one
    const base = makeEmptyDB();
    return { ...base, ...parsed } as DBShape;
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let onQuotaError: (() => void) | null = null;

export function setQuotaErrorHandler(fn: () => void) {
  onQuotaError = fn;
}

export function saveRaw(db: DBShape, immediate = false): void {
  const write = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error("[db] save failed", e);
      onQuotaError?.();
    }
  };
  if (immediate) {
    if (saveTimer) clearTimeout(saveTimer);
    write();
    return;
  }
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(write, 250);
}

export function clearStorage(): void {
  try {
    // wipe current + any legacy schema versions
    for (let i = Object.keys(localStorage).length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}
