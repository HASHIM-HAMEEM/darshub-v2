import { describe, expect, it } from "vitest";
import { MAX_SCHEDULED_REMINDERS, getEffectiveReminderLead, getReminderTime, getSchedulableClasses, planReminders, reminderCopy, reminderIdentifier } from "../lib/reminder-plan";
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

describe("Dars reminder schedule plan", () => {
  const now = new Date("2027-04-01T12:00:00").getTime();

  it("adds a start-time alarm and keeps it even after the lead reminder has passed", () => {
    const soon = classItem("soon", "2027-04-01", "12:10");
    const later = classItem("later", "2027-04-01", "19:00");
    const plan = planReminders([later, soon], { leadMinutes: 30, alarmAtStart: true }, now);
    expect(plan.map((item) => `${item.classId}:${item.kind}`)).toEqual(["soon:start", "later:lead", "later:start"]);
    expect(plan[0].identifier).toBe(reminderIdentifier("soon", "start"));
  });

  it("caps the schedule to the nearest reminders so the OS alarm limit is never exceeded", () => {
    const items = Array.from({ length: 80 }, (_, index) => classItem(`c${index}`, `2027-05-${String((index % 28) + 1).padStart(2, "0")}`, "19:00"));
    const plan = planReminders(items, { leadMinutes: 30, alarmAtStart: false }, now);
    expect(plan).toHaveLength(MAX_SCHEDULED_REMINDERS);
    expect(plan.every((item, index) => index === 0 || plan[index - 1].date.getTime() <= item.date.getTime())).toBe(true);
  });

  it("writes localized reminder copy with the place", () => {
    expect(reminderCopy({ title: "Tafsir", startTime: "19:00" }, { kind: "lead", leadMinutes: 30 }, "en", "Masjid").body).toBe("Starts in 30 minutes (19:00) · Masjid");
    expect(reminderCopy({ title: "Tafsir", startTime: "19:00" }, { kind: "start", leadMinutes: 0 }, "ar").title).toContain("Tafsir");
  });
});
