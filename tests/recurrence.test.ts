import { describe, expect, it } from "vitest";
import { createRecurringOccurrences, getOccurrenceDate } from "../lib/recurrence";
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
