import { describe, expect, it } from "vitest";
import { createRecurringOccurrences, extendOngoingSeries, getOccurrenceDate, getSeriesDates, normalizeRecurrenceDays, normalizeRecurrenceEnd, resizeSeries } from "../lib/recurrence";
import type { ClassDraft } from "../lib/types/dars";

const draft: ClassDraft = { title: "Riyad", subject: "Hadith", teacherId: "teacher-1", bookId: "book-1", date: "2026-08-28", startTime: "19:00", locationId: "location-1", city: "Cairo", type: "recurring", recurrenceRule: "Weekly", status: "upcoming" };

describe("Dars recurrence planning", () => {
  it("builds weekly occurrences with stable series metadata", () => {
    const occurrences = createRecurringOccurrences(draft, "series-1", (() => { let index = 0; return () => `class-${++index}`; })(), 3);
    expect(occurrences.map((item) => item.date)).toEqual(["2026-08-28", "2026-09-04", "2026-09-11"]);
    expect(occurrences.every((item) => item.seriesId === "series-1" && item.type === "recurring")).toBe(true);
    expect(occurrences.map((item) => item.occurrenceIndex)).toEqual([0, 1, 2]);
  });

  it("supports fortnightly and monthly cadence without timezone drift", () => {
    expect(getOccurrenceDate("2026-08-28", "Every 2 weeks", 2)).toBe("2026-09-25");
    expect(getOccurrenceDate("2026-01-15", "Monthly", 2)).toBe("2026-03-15");
  });
});

describe("multi-day weekly recurrence", () => {
  const ids = () => { let index = 0; return () => `class-${++index}`; };

  it("creates classes on every selected weekday for 12 weeks", () => {
    // 2026-08-29 is a Saturday; Sat, Mon, Wed
    const occurrences = createRecurringOccurrences({ ...draft, date: "2026-08-29", recurrenceDays: [6, 1, 3] }, "series-2", ids());
    expect(occurrences).toHaveLength(36);
    expect(occurrences.slice(0, 4).map((item) => item.date)).toEqual(["2026-08-29", "2026-08-31", "2026-09-02", "2026-09-05"]);
    expect(occurrences.map((item) => item.occurrenceIndex)).toEqual(occurrences.map((_, index) => index));
    expect(occurrences[0].recurrenceDays).toEqual([1, 3, 6]);
  });

  it("starts on the next selected day when the start date is not one of them", () => {
    expect(getSeriesDates("2026-08-28", "Weekly", [0, 2], 1)).toEqual(["2026-08-30", "2026-09-01"]);
  });

  it("supports five days a week and fortnightly weeks", () => {
    expect(getSeriesDates("2026-08-30", "Weekly", [0, 1, 2, 3, 4])).toHaveLength(60);
    expect(getSeriesDates("2026-08-30", "Every 2 weeks", [0, 3], 2)).toEqual(["2026-08-30", "2026-09-02", "2026-09-13", "2026-09-16"]);
  });

  it("defaults to the start date weekday and ignores invalid days", () => {
    expect(normalizeRecurrenceDays(undefined, "2026-08-28")).toEqual([5]);
    expect(normalizeRecurrenceDays([9, 2, 2, -1], "2026-08-28")).toEqual([2]);
    expect(getSeriesDates("2026-01-15", "Monthly", [1, 2], 3)).toEqual(["2026-01-15", "2026-02-15", "2026-03-15"]);
  });
});

describe("series end options", () => {
  const ids = () => { let index = 0; return () => `new-${++index}`; };
  const base: ClassDraft = { ...draft, date: "2026-09-26", recurrenceDays: [6, 1] };

  it("stops after a fixed number of sessions on the chosen days", () => {
    const dates = getSeriesDates("2026-09-26", "Weekly", [6, 1], undefined, { kind: "count", count: 5 });
    expect(dates).toEqual(["2026-09-26", "2026-09-28", "2026-10-03", "2026-10-05", "2026-10-10"]);
  });

  it("stops on an end date", () => {
    expect(getSeriesDates("2026-09-26", "Weekly", [6], undefined, { kind: "until", date: "2026-10-10" })).toEqual(["2026-09-26", "2026-10-03", "2026-10-10"]);
  });

  it("clamps invalid ends", () => {
    expect(normalizeRecurrenceEnd({ kind: "count", count: 0 }, "2026-09-26")).toEqual({ kind: "count", count: 1 });
    expect(normalizeRecurrenceEnd({ kind: "count", count: 999 }, "2026-09-26")).toEqual({ kind: "count", count: 200 });
    expect(normalizeRecurrenceEnd({ kind: "until", date: "2026-01-01" }, "2026-09-26")).toEqual({ kind: "until", date: "2026-09-26" });
    expect(normalizeRecurrenceEnd(undefined, "2026-09-26")).toEqual({ kind: "ongoing" });
  });

  it("changes an ongoing course to 6 sessions, keeping attended ones and removing extra upcoming ones", () => {
    const series = createRecurringOccurrences({ ...base, recurrenceEnd: { kind: "ongoing" } }, "s", ids());
    series[0].status = "completed";
    const resized = resizeSeries(series, "s", { kind: "count", count: 6 }, "2026-09-27", ids());
    expect(resized).toHaveLength(6);
    expect(resized[0].status).toBe("completed");
    expect(resized.every((item) => item.recurrenceEnd?.kind === "count")).toBe(true);
  });

  it("extends a fixed course to more sessions and to an end date", () => {
    const series = createRecurringOccurrences({ ...base, recurrenceEnd: { kind: "count", count: 4 } }, "s", ids());
    const longer = resizeSeries(series, "s", { kind: "count", count: 10 }, "2026-09-27", ids());
    expect(longer.map((item) => item.occurrenceIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(longer[9].date).toBe("2026-10-26");
    const until = resizeSeries(series, "s", { kind: "until", date: "2026-10-12" }, "2026-09-27", ids());
    expect(until.map((item) => item.date)).toEqual(["2026-09-26", "2026-09-28", "2026-10-03", "2026-10-05", "2026-10-10", "2026-10-12"]);
  });

  it("never re-adds past sessions or deleted gaps and keeps other classes", () => {
    const series = createRecurringOccurrences({ ...base, recurrenceEnd: { kind: "count", count: 4 } }, "s", ids());
    const withoutSecond = [...series.filter((item) => item.occurrenceIndex !== 1), { ...series[0], id: "other", seriesId: undefined }];
    const resized = resizeSeries(withoutSecond, "s", { kind: "count", count: 6 }, "2026-10-01", ids());
    expect(resized.filter((item) => item.seriesId === "s").map((item) => item.occurrenceIndex)).toEqual([0, 2, 3, 4, 5]);
    expect(resized.some((item) => item.id === "other")).toBe(true);
    const upToToday = resizeSeries(series, "s", { kind: "until", date: "2026-09-26" }, "2026-10-04", ids());
    expect(upToToday.map((item) => item.date)).toEqual(["2026-09-26", "2026-09-28", "2026-10-03"]);
  });

  it("switching to ongoing fills the horizon", () => {
    const series = createRecurringOccurrences({ ...base, recurrenceEnd: { kind: "count", count: 2 } }, "s", ids());
    const ongoing = resizeSeries(series, "s", { kind: "ongoing" }, "2026-09-27", ids());
    expect(ongoing.length).toBeGreaterThan(20);
    expect(ongoing.every((item) => item.date <= "2026-12-20")).toBe(true);
  });

  it("auto-extends ongoing series when they run low, and leaves fixed ones alone", () => {
    const ongoing = createRecurringOccurrences({ ...base, recurrenceEnd: { kind: "ongoing" } }, "s", ids());
    expect(extendOngoingSeries(ongoing, "2026-09-27", ids())).toHaveLength(0);
    const later = extendOngoingSeries(ongoing, "2026-12-01", ids());
    expect(later.length).toBeGreaterThan(0);
    expect(later[0].occurrenceIndex).toBe(ongoing.length);
    expect(later.every((item) => item.date >= "2026-12-01" && item.status === "upcoming")).toBe(true);
    const fixed = createRecurringOccurrences({ ...base, recurrenceEnd: { kind: "count", count: 3 } }, "f", ids());
    expect(extendOngoingSeries(fixed, "2027-01-01", ids())).toHaveLength(0);
  });
});

describe("series safety", () => {
  it("does not auto-extend a series whose future was cancelled", () => {
    const series = createRecurringOccurrences({ ...draft, date: "2026-09-26", recurrenceEnd: { kind: "ongoing" } }, "c", (() => { let i = 0; return () => `c-${++i}`; })());
    const cancelled = series.map((item) => (item.occurrenceIndex ?? 0) >= 2 ? { ...item, status: "cancelled" as const } : item);
    expect(extendOngoingSeries(cancelled, "2026-12-15", () => "x")).toHaveLength(0);
  });

  it("new series without an explicit end are ongoing", () => {
    const [first] = createRecurringOccurrences(draft, "o", () => "id", 1);
    expect(first.recurrenceEnd).toEqual({ kind: "ongoing" });
  });
});
