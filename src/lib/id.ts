import { customAlphabet, nanoid } from "nanoid";

/** Internal opaque id. */
export const newId = (): string => nanoid(12);

const numeric = customAlphabet("0123456789", 6);
const alnum = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

/** Counter map so human-readable sequence numbers stay stable within a session. */
const counters: Record<string, number> = {};
function seq(scope: string, start = 1): number {
  counters[scope] = (counters[scope] ?? start - 1) + 1;
  return counters[scope];
}

/** Seed the counter so generated human IDs continue after existing data. */
export function primeCounter(scope: string, value: number) {
  counters[scope] = Math.max(counters[scope] ?? 0, value);
}

const yearOf = (iso?: string) => (iso ? new Date(iso).getFullYear() : new Date().getFullYear());

export const humanId = {
  admission: (year = yearOf()) => `ADM-${year}-${String(seq("admission")).padStart(4, "0")}`,
  receipt: (year = yearOf()) => `RCPT-${year}-${String(seq("receipt")).padStart(6, "0")}`,
  invoice: (year = yearOf()) => `INV-${year}-${String(seq("invoice")).padStart(6, "0")}`,
  voucher: (year = yearOf()) => `VCH-${year}-${String(seq("voucher")).padStart(5, "0")}`,
  employee: () => `EMP-${String(seq("employee")).padStart(4, "0")}`,
  roll: (classLevel: number, n: number) => `${classLevel}${String(n).padStart(3, "0")}`,
  accession: () => `ACC-${String(seq("accession")).padStart(6, "0")}`,
  card: (prefix = "LIB") => `${prefix}-${String(seq("card")).padStart(5, "0")}`,
  badge: () => `V-${numeric()}`,
  tracking: () => `TRK${alnum()}`,
  generic: (prefix: string) => `${prefix}-${alnum()}`,
};
