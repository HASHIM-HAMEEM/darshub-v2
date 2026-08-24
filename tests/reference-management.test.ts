import { describe, expect, it } from "vitest";
import { cleanLocation, isValidMapLink, linkedClassCount, syncLocationCity, validateBook, validateClassDraft, validateLocation, validateTeacher } from "../lib/reference-management";

describe("reference management", () => {
  it("rejects duplicate teacher and book identities while allowing edits to retain their own record", () => {
    const teachers = [{ id: "teacher-1", name: "Shaykh Mahmoud", subjects: ["Hadith"] }];
    const books = [{ id: "book-1", name: "Bulugh al-Maram", author: "Ibn Hajar", subject: "Hadith" }];
    expect(validateTeacher({ name: "  shaykh   mahmoud ", subjects: ["Fiqh"] }, teachers)).toContain("already exists");
    expect(validateTeacher({ name: "Shaykh Mahmoud", subjects: ["Fiqh"] }, teachers, "teacher-1")).toBeUndefined();
    expect(validateBook({ name: "Bulugh al-Maram", author: " ibn hajar ", subject: "Hadith" }, books)).toContain("already");
    expect(validateBook({ name: "Bulugh al-Maram", author: "Ibn Hajar", subject: "Hadith" }, books, "book-1")).toBeUndefined();
  });

  it("validates a complete, distinct location and only accepts web map links", () => {
    const records = [{ id: "location-1", name: "Masjid Al-Huda", address: "1 Main St", city: "Cairo", area: "Nasr City" }];
    expect(validateLocation({ name: "Masjid Al-Huda", address: "New", city: "Cairo", area: "Nasr City", mapLink: "https://maps.google.com" }, records)).toContain("already exists");
    expect(validateLocation({ name: "Masjid Al-Noor", address: "2 Main St", city: "Cairo", area: "Maadi", mapLink: "maps.google.com" }, records)).toContain("valid web link");
    expect(isValidMapLink("https://maps.google.com/?q=masjid")).toBe(true);
    expect(cleanLocation({ name: " Masjid  Al-Noor ", address: " 2 Main St ", city: " Cairo ", area: " Maadi ", mapLink: " https://maps.google.com " })).toMatchObject({ name: "Masjid Al-Noor", city: "Cairo", area: "Maadi" });
  });

  it("counts record usage to protect linked records from deletion", () => {
    const classes = [{ id: "class-1", teacherId: "teacher-1", bookId: "book-1", locationId: "location-1" }, { id: "class-2", teacherId: "teacher-1", bookId: "book-2", locationId: "location-2" }] as never;
    expect(linkedClassCount(classes, "teacher", "teacher-1")).toBe(2);
    expect(linkedClassCount(classes, "book", "book-1")).toBe(1);
    expect(linkedClassCount(classes, "location", "location-3")).toBe(0);
  });

  it("keeps linked class cities synchronized when a location is corrected", () => {
    const classes = [{ id: "class-1", locationId: "location-1", city: "Cairo" }, { id: "class-2", locationId: "location-2", city: "Alexandria" }] as never;
    expect(syncLocationCity(classes, "location-1", "Giza")).toMatchObject([{ id: "class-1", city: "Giza" }, { id: "class-2", city: "Alexandria" }]);
  });

  it("requires live references and well-formed class time values while deriving the city from location", () => {
    const references = { teachers: [{ id: "teacher-1", name: "Shaykh", subjects: ["Hadith"] }], books: [{ id: "book-1", name: "Book", author: "Author", subject: "Hadith" }], locations: [{ id: "location-1", name: "Masjid", address: "", city: "Giza", area: "Dokki" }] };
    const base = { title: "Lesson", subject: "Hadith", teacherId: "teacher-1", bookId: "book-1", locationId: "location-1", city: "Wrong city", date: "2026-08-15", startTime: "19:00", endTime: "20:00", type: "one-time" as const, status: "upcoming" as const };
    expect(validateClassDraft(base, references)).toMatchObject({ ok: true, draft: { city: "Giza" } });
    expect(validateClassDraft({ ...base, teacherId: "missing" }, references)).toMatchObject({ ok: false });
    expect(validateClassDraft({ ...base, startTime: "7pm" }, references)).toMatchObject({ ok: false });
    expect(validateClassDraft({ ...base, endTime: "18:30" }, references)).toMatchObject({ ok: false });
  });
});
