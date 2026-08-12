import { describe, expect, it } from "vitest";
import { classMatchesQuery, dayDifference, formatClassDate, formatClassDateParts, getNextClass, getUpcomingClasses, sortClasses } from "../lib/dars-utils";
import type { DarsClass } from "../lib/types/dars";

const classItem = (id: string, date: string, startTime: string, status: DarsClass["status"] = "upcoming"): DarsClass => ({
  id,
  title: id === "one" ? "Hadith circle" : "Arabic reading",
  subject: id === "one" ? "Hadith" : "Arabic",
  teacherId: id === "one" ? "teacher-a" : "teacher-b",
  bookId: "book-a",
  date,
  startTime,
  locationId: "loc-a",
  city: "Cairo",
  type: "one-time",
  status,
});

describe("Dars schedule utilities", () => {
  it("orders classes by date and start time and selects the first upcoming class", () => {
    const items = [classItem("late", "2027-04-02", "20:00"), classItem("early", "2027-04-01", "17:00"), classItem("done", "2027-03-31", "19:00", "completed")];
    expect(sortClasses(items).map((item) => item.id)).toEqual(["done", "early", "late"]);
    expect(getUpcomingClasses(items).map((item) => item.id)).toEqual(["early", "late"]);
    expect(getNextClass(items)?.id).toBe("early");
  });

  it("matches a class against linked teacher, book, and location details", () => {
    const item = classItem("one", "2027-04-01", "17:00");
    const refs = { teachers: [{ id: "teacher-a", name: "Shaykh Ahmad", subjects: ["Hadith"] }], books: [{ id: "book-a", name: "Riyad as-Salihin", author: "Imam an-Nawawi", subject: "Hadith" }], locations: [{ id: "loc-a", name: "Masjid Al-Fath", address: "", city: "Cairo", area: "Downtown" }] };
    expect(classMatchesQuery(item, refs, "ahmad")).toBe(true);
    expect(classMatchesQuery(item, refs, "riyad")).toBe(true);
    expect(classMatchesQuery(item, refs, "masjid")).toBe(true);
    expect(classMatchesQuery(item, refs, "Alexandria")).toBe(false);
  });

  it("measures the device-local calendar day as a zero-day offset", () => {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(dayDifference(localToday)).toBe(0);
  });

  it("renders Gregorian, Hijri, and combined date preferences without dropping calendar context", () => {
    const gregorian = formatClassDate("2027-04-01", "gregorian");
    const hijri = formatClassDate("2027-04-01", "hijri");
    const dual = formatClassDate("2027-04-01", "dual");
    expect(gregorian).toContain("Apr");
    expect(hijri).not.toBe(gregorian);
    expect(dual).toContain("·");
    expect(dual).toContain(gregorian);
    expect(dual).toContain(hijri);
  });

  it("derives class-card date pieces from locale parts instead of assuming English word order", () => {
    const english = formatClassDateParts("2027-04-01", "en-EG");
    const arabic = formatClassDateParts("2027-04-01", "ar-EG");
    expect(english.weekday).toBeTruthy();
    expect(english.day).toBeTruthy();
    expect(arabic.weekday).toBeTruthy();
    expect(arabic.day).toBeTruthy();
    expect(arabic.day).not.toBe(english.day);
  });
});
