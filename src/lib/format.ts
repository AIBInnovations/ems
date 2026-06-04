import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Money is stored as a number in rupees; format with 2dp Indian grouping. */
export function formatMoney(amount: number, opts: { sign?: boolean } = {}): string {
  const neg = amount < 0;
  const v = Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = neg ? "-" : opts.sign ? "+" : "";
  return `${sign}₹${v}`;
}

/** Compact money for stat cards: ₹4.2L, ₹1.3Cr. */
export function formatMoneyCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export function formatDate(iso?: string | null, pattern = "dd MMM yyyy"): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return "—";
  }
}

export function formatDateTime(iso?: string | null): string {
  return formatDate(iso, "dd MMM yyyy, h:mm a");
}

export function formatTime(hhmm?: string | null): string {
  if (!hhmm) return "—";
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return "—";
  }
}

export function initials(first?: string, last?: string): string {
  const a = (first?.[0] ?? "").toUpperCase();
  const b = (last?.[0] ?? "").toUpperCase();
  return (a + b) || "?";
}

export function fullName(first?: string, last?: string): string {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

export function percent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function fileSize(mb: number): string {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
}

/** Stable, pleasant tint index (0..n) from a string — for initials avatars. */
export function tintIndex(seed: string, buckets = 6): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % buckets;
}
