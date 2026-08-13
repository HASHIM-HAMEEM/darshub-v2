import { describe, expect, it } from "vitest";
import { getEffectiveReminderLead, getReminderTime, getSchedulableClasses } from "../lib/reminder-plan";
import type { DarsClass } from "../lib/types/dars";

const classItem = (id: string, date: string, startTime: string, status: DarsClass["status"] = "upcoming"): DarsClass => ({ id, title: "Tafsir study", subject: "Tafsir", teacherId: "teacher-1", bookId: "book-1", date, startTime, locationId: "location-1", city: "Cairo", type: "one-time", status });

describe("Dars reminder planning", () => {
  it("calculates a reminder before the intended local class time", () => {
    expect(getReminderTime(classItem("a", "2027-04-01", "19:00"), 30).toISOString()).toContain("18:30:00");
  });

  it("schedules only future upcoming classes and excludes completed or already-passed reminders", () => {
    const now = new Date("2027-04-01T12:00:00").getTime();
    const items = [classItem("future", "2027-04-01", "19:00"), classItem("past", "2027-04-01", "12:20"), classItem("done", "2027-04-02", "19:00", "completed")];
    expect(getSchedulableClasses(items, 30, now).map((item) => item.id)).toEqual(["future"]);
  });

  it("uses a class-level reminder override when one is set", () => {
    const custom = { ...classItem("custom", "2027-04-01", "19:00"), reminderLeadMinutes: 10 as const };
    expect(getEffectiveReminderLead(custom, 30)).toBe(10);
    expect(getReminderTime(custom, getEffectiveReminderLead(custom, 30)).toISOString()).toContain("18:50:00");
  });
});
