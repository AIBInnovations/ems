/**
 * Centralized clock so time-based rules (15-day purge, same-day attendance edit)
 * are evaluated consistently and remain testable.
 */
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
} from "date-fns";

export const nowISO = (): string => new Date().toISOString();

/** Local calendar date as YYYY-MM-DD. */
export const todayKey = (): string => format(new Date(), "yyyy-MM-dd");

export const dateKey = (d: Date | string): string =>
  format(typeof d === "string" ? parseISO(d) : d, "yyyy-MM-dd");

export const isToday = (iso: string): boolean => {
  try {
    return isSameDay(parseISO(iso), new Date());
  } catch {
    return false;
  }
};

export const daysUntil = (iso: string): number => differenceInCalendarDays(parseISO(iso), new Date());

export const daysSince = (iso: string): number => differenceInCalendarDays(new Date(), parseISO(iso));

export const addDaysISO = (iso: string, days: number): string => addDays(parseISO(iso), days).toISOString();

export const RECYCLE_TTL_DAYS = 15;

export const expiryFrom = (iso: string, days = RECYCLE_TTL_DAYS): string => addDaysISO(iso, days);
