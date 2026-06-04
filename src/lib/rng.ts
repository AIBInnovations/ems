/**
 * Deterministic seeded RNG (mulberry32) so the demo dataset is reproducible:
 * same data on every reset → stable screenshots and predictable demos.
 */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private next: () => number;
  constructor(seed = 0xc0ffee) {
    this.next = mulberry32(seed);
  }
  float(): number {
    return this.next();
  }
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  bool(p = 0.5): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  sample<T>(arr: readonly T[], count: number): T[] {
    const copy = [...arr];
    const out: T[] = [];
    for (let i = 0; i < count && copy.length; i++) {
      out.push(copy.splice(Math.floor(this.next() * copy.length), 1)[0]);
    }
    return out;
  }
  shuffle<T>(arr: readonly T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  weighted<T>(entries: readonly [T, number][]): T {
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = this.next() * total;
    for (const [val, w] of entries) {
      if ((r -= w) <= 0) return val;
    }
    return entries[entries.length - 1][0];
  }
}
