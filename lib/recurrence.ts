import type { ClassDraft, DarsClass, RecurrenceEnd } from "@/lib/types/dars";

export const recurringCadences = ["Weekly", "Every 2 weeks", "Monthly"] as const;
export type RecurringCadence = (typeof recurringCadences)[number];
export const defaultRecurringOccurrenceCount = 12;
export const maxSeriesSessions = 200;
export const ongoingHorizonDays = 84;
const ongoingRefillDays = 28;

function fromIso(iso: string) { const [year, month, day] = iso.split("-").map(Number); return new Date(year, month - 1, day); }
function toIso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function cadence(rule?: string): RecurringCadence { return recurringCadences.includes(rule as RecurringCadence) ? rule as RecurringCadence : "Weekly"; }
const addDays = (iso: string, days: number) => { const date = fromIso(iso); date.setDate(date.getDate() + days); return toIso(date); };

export function getOccurrenceDate(seedDate: string, rule: string | undefined, occurrenceIndex: number) {
  const date = fromIso(seedDate); const step = cadence(rule);
  if (step === "Monthly") date.setMonth(date.getMonth() + occurrenceIndex);
  else date.setDate(date.getDate() + occurrenceIndex * (step === "Every 2 weeks" ? 14 : 7));
  return toIso(date);
}

export const weekdayOf = (iso: string) => fromIso(iso).getDay();
export const usesWeekdays = (rule?: string) => cadence(rule) !== "Monthly";

export function normalizeRecurrenceDays(days: readonly number[] | undefined, seedDate: string): number[] {
  const valid = [...new Set((days ?? []).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort((a, b) => a - b);
  return valid.length ? valid : [weekdayOf(seedDate)];
}

export function normalizeRecurrenceEnd(end: RecurrenceEnd | undefined, seedDate: string): RecurrenceEnd {
  if (end?.kind === "count") return { kind: "count", count: Math.min(maxSeriesSessions, Math.max(1, Math.round(Number(end.count) || 1))) };
  if (end?.kind === "until") return { kind: "until", date: end.date >= seedDate ? end.date : seedDate };
  return { kind: "ongoing" };
}

function* candidateDates(seedDate: string, rule: string | undefined, days: readonly number[] | undefined) {
  const step = cadence(rule);
  if (step === "Monthly") {
    for (let index = 0; ; index += 1) yield getOccurrenceDate(seedDate, step, index);
  }
  const selected = normalizeRecurrenceDays(days, seedDate);
  const interval = step === "Every 2 weeks" ? 2 : 1;
  for (let offset = 0; ; offset += 1) {
    if (Math.floor(offset / 7) % interval !== 0) continue;
    const date = addDays(seedDate, offset);
    if (selected.includes(fromIso(date).getDay())) yield date;
  }
}

/** Dates of a series. `ongoing` (or no end) yields `periods` weeks/fortnights/months; `until` is capped at `maxSeriesSessions`. */
export function getSeriesDates(seedDate: string, rule: string | undefined, days: readonly number[] | undefined, periods = defaultRecurringOccurrenceCount, end?: RecurrenceEnd): string[] {
  const step = cadence(rule);
  const horizon = step === "Monthly"
    ? getOccurrenceDate(seedDate, step, periods - 1)
    : addDays(seedDate, periods * 7 * (step === "Every 2 weeks" ? 2 : 1) - 1);
  const dates: string[] = [];
  for (const date of candidateDates(seedDate, rule, days)) {
    if (end?.kind === "count" ? dates.length >= end.count : end?.kind === "until" ? date > end.date : date > horizon) break;
    if (dates.length >= maxSeriesSessions) break;
    dates.push(date);
  }
  return dates;
}

export function createRecurringOccurrences(draft: ClassDraft, seriesId: string, createId: () => string, periods = defaultRecurringOccurrenceCount): DarsClass[] {
  const rule = cadence(draft.recurrenceRule);
  const recurrenceDays = usesWeekdays(rule) ? normalizeRecurrenceDays(draft.recurrenceDays, draft.date) : undefined;
  const recurrenceEnd = normalizeRecurrenceEnd(draft.recurrenceEnd, draft.date);
  return getSeriesDates(draft.date, rule, recurrenceDays, periods, recurrenceEnd.kind === "ongoing" ? undefined : recurrenceEnd).map((date, occurrenceIndex) => ({ ...draft, id: createId(), date, recurrenceRule: rule, recurrenceDays, recurrenceEnd, seriesStart: draft.date, type: "recurring", seriesId, occurrenceIndex }));
}

/** New occurrences that keep every ongoing series scheduled at least `ongoingHorizonDays` ahead of `today`. */
export function extendOngoingSeries(classes: DarsClass[], today: string, createId: () => string): DarsClass[] {
  const series = new Map<string, DarsClass[]>();
  for (const item of classes) {
    if (item.seriesId && item.recurrenceEnd?.kind === "ongoing" && item.seriesStart) series.set(item.seriesId, [...(series.get(item.seriesId) ?? []), item]);
  }
  const additions: DarsClass[] = [];
  const horizon = addDays(today, ongoingHorizonDays);
  for (const [seriesId, items] of series) {
    const latest = items.reduce((best, item) => (item.occurrenceIndex ?? 0) > (best.occurrenceIndex ?? 0) ? item : best);
    if (latest.date >= addDays(today, ongoingRefillDays)) continue;
    if (latest.status === "cancelled") continue;
    const lastIndex = latest.occurrenceIndex ?? 0;
    const { id: _id, reminderId: _reminderId, ...template } = latest;
    let index = 0;
    for (const date of candidateDates(latest.seriesStart!, latest.recurrenceRule, latest.recurrenceDays)) {
      if (date > horizon || index > lastIndex + maxSeriesSessions) break;
      if (index > lastIndex && date >= today) additions.push({ ...template, id: createId(), date, status: "upcoming", seriesId, occurrenceIndex: index });
      index += 1;
    }
  }
  return additions;
}

export function seriesSeed(items: DarsClass[]) {
  const ordered = [...items].sort((a, b) => (a.occurrenceIndex ?? 0) - (b.occurrenceIndex ?? 0));
  const first = ordered[0];
  return first?.seriesStart ?? first?.date ?? "";
}

/** Current end of a series; series created before end options existed are treated as a fixed session count. */
export function seriesEnd(items: DarsClass[]): RecurrenceEnd {
  const withEnd = items.find((item) => item.recurrenceEnd);
  if (withEnd?.recurrenceEnd) return withEnd.recurrenceEnd;
  return { kind: "count", count: Math.max(1, ...items.map((item) => (item.occurrenceIndex ?? 0) + 1)) };
}

/**
 * Applies a new end to an existing series. Past, attended and cancelled sessions are kept; upcoming sessions beyond the
 * new end are removed; missing sessions after the latest existing one are added from `today` onwards.
 */
export function removeOccurrence(classes: DarsClass[], id: string): DarsClass[] {
  const target = classes.find((item) => item.id === id);
  const rest = classes.filter((item) => item.id !== id);
  if (!target?.seriesId || target.occurrenceIndex === undefined) return rest;
  const index = target.occurrenceIndex;
  return rest.map((item) => item.seriesId === target.seriesId ? { ...item, skippedOccurrences: [...new Set([...(item.skippedOccurrences ?? []), index])] } : item);
}

export function resizeSeries(classes: DarsClass[], seriesId: string, end: RecurrenceEnd, today: string, createId: () => string): DarsClass[] {
  const items = classes.filter((item) => item.seriesId === seriesId);
  if (!items.length) return classes;
  const seed = seriesSeed(items);
  const nextEnd = normalizeRecurrenceEnd(end, seed);
  const latest = items.reduce((best, item) => (item.occurrenceIndex ?? 0) > (best.occurrenceIndex ?? 0) ? item : best);
  const rule = latest.recurrenceRule;
  const days = usesWeekdays(rule) ? normalizeRecurrenceDays(latest.recurrenceDays, seed) : undefined;
  const horizon = addDays(today, ongoingHorizonDays);
  const inRange = (index: number, date: string) => nextEnd.kind === "count" ? index < nextEnd.count : nextEnd.kind === "until" ? date <= nextEnd.date : true;
  const kept = classes
    .filter((item) => item.seriesId !== seriesId || item.status !== "upcoming" || item.date < today || inRange(item.occurrenceIndex ?? 0, item.date))
    .map((item) => item.seriesId === seriesId ? { ...item, recurrenceEnd: nextEnd, seriesStart: seed, recurrenceDays: days } : item);
  const present = new Set(kept.filter((item) => item.seriesId === seriesId).map((item) => item.occurrenceIndex ?? 0));
  const skipped = new Set(items.flatMap((item) => item.skippedOccurrences ?? []));
  const lastIndex = latest.occurrenceIndex ?? 0;
  const { id: _id, reminderId: _reminderId, ...template } = latest;
  const additions: DarsClass[] = [];
  let index = 0;
  for (const date of candidateDates(seed, rule, days)) {
    if (!inRange(index, date) || (nextEnd.kind === "ongoing" && date > horizon) || index >= Math.max(lastIndex + 1, maxSeriesSessions)) break;
    if (date >= today && !present.has(index) && !skipped.has(index)) additions.push({ ...template, id: createId(), date, status: "upcoming", seriesId, seriesStart: seed, recurrenceEnd: nextEnd, recurrenceDays: days, occurrenceIndex: index });
    index += 1;
  }
  return [...kept, ...additions];
}
