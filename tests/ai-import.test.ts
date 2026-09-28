import { describe, expect, it } from "vitest";
import { buildAiPrompt, extractJson, localizeAiIssue, parseAiImport, parseTime, planToDraft } from "../lib/ai-import";
import type { Book, Location, Teacher } from "../lib/types/dars";

const refs = {
  teachers: [{ id: "t1", name: "Sheikh Ahmad", subjects: ["Hadith"] }] as Teacher[],
  books: [{ id: "b1", name: "Riyad as-Salihin", author: "an-Nawawi", subject: "Hadith" }] as Book[],
  locations: [{ id: "l1", name: "Central Masjid", city: "Cairo", area: "Nasr City", address: "" }] as Location[],
};

const reply = `Sure! Here's your schedule:
\`\`\`json
{
  "format": "darshub-ai-classes",
  "version": 1,
  "classes": [
    { "title": "Riyad", "subject": "hadith", "teacher": "sheikh ahmad", "book": { "name": "Riyad as-Salihin", "author": "an-Nawawi" }, "location": { "name": "Central Masjid", "city": "Cairo" }, "date": "2026-10-03", "startTime": "7:30 PM", "endTime": "20:30", "repeat": "weekly", "days": ["sat", "Monday", "الأربعاء", 4], "ends": { "type": "ongoing" } },
    { "title": "Tajweed", "subject": "Quran", "teacher": "Ustadh Omar", "book": "Tuhfat al-Atfal", "location": "Online", "city": "Online", "date": "2026-10-05", "startTime": "06:00", "repeat": "every 2 weeks", "days": "thu", "ends": { "type": "sessions", "count": 15 } },
    { "title": "Seminar", "teacher": "Sheikh Ahmad", "book": "Riyad as-Salihin", "location": "Central Masjid", "date": "2026-10-10", "startTime": "10:00", "repeat": "none" },
    { "title": "Broken", "teacher": "X", "book": "Y", "location": "Z", "date": "10/10/2026", "startTime": "10:00" },
  ]
}
\`\`\`
Let me know if you need changes.`;

describe("AI import", () => {
  it("extracts JSON from fenced replies with trailing commas", () => {
    expect(extractJson("text ```json\n{\"a\": [1,],}\n``` more")).toEqual({ a: [1] });
    expect(() => extractJson("no json here")).toThrow();
  });

  it("parses times in 12h and 24h", () => {
    expect(parseTime("7:30 PM")).toBe("19:30");
    expect(parseTime("12am")).toBe("00:00");
    expect(parseTime("٦:٠٥")).toBe("06:05");
    expect(parseTime("25:00")).toBeUndefined();
  });

  it("maps classes, reuses known references and reports invalid entries", () => {
    const { plans, issues } = parseAiImport(reply, refs);
    expect(plans).toHaveLength(3);
    expect(issues).toEqual([{ index: 3, message: "\"date\" must be YYYY-MM-DD." }]);
    const [riyad, tajweed, seminar] = plans;
    expect(riyad).toMatchObject({ subject: "Hadith", startTime: "19:30", endTime: "20:30", repeat: "Weekly", days: [1, 3, 4, 6], ends: { kind: "ongoing" } });
    expect(riyad.teacher.existingId).toBe("t1");
    expect(riyad.book.existingId).toBe("b1");
    expect(riyad.location.existingId).toBe("l1");
    expect(tajweed).toMatchObject({ repeat: "Every 2 weeks", days: [4], ends: { kind: "count", count: 15 } });
    expect(tajweed.teacher.existingId).toBeUndefined();
    expect(tajweed.location).toMatchObject({ name: "Online", city: "Online" });
    expect(seminar).toMatchObject({ repeat: "none", subject: "Hadith" });
    expect(planToDraft(seminar, { teacherId: "t1", bookId: "b1", locationId: "l1", city: "Cairo" })).toMatchObject({ type: "one-time", recurrenceRule: undefined });
  });

  it("rejects bad shapes with a clear message", () => {
    expect(parseAiImport("{\"foo\": 1}", refs).issues[0].message).toContain("classes");
    expect(parseAiImport("[]", refs).issues[0].message).toContain("empty");
    const badEnd = parseAiImport(JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01", startTime: "10:00", repeat: "weekly", ends: { type: "sessions", count: 0 } }]), refs);
    expect(badEnd.issues[0].message).toContain("ends");
    const badEndTime = parseAiImport(JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01", startTime: "10:00", endTime: "09:00" }]), refs);
    expect(badEndTime.issues[0].message).toContain("after");
  });

  it("builds a prompt that lists known references and the format", () => {
    const prompt = buildAiPrompt(refs, new Date(2026, 8, 27), "en");
    expect(prompt).toContain("Sheikh Ahmad");
    expect(prompt).toContain("darshub-ai-classes");
    expect(prompt).toContain("Today is 2026-09-27 (Sunday)");
    expect(parseAiImport(prompt, refs).plans).toHaveLength(3);
  });
});

describe("AI import localization", () => {
  it("has an Arabic message for every validation error", () => {
    const samples = ["nope", "{\"foo\":1}", "[]", "[1]", "[{}]", JSON.stringify([{ title: "A" }]), JSON.stringify([{ title: "A", teacher: "T" }]), JSON.stringify([{ title: "A", teacher: "T", book: "B" }]), JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L" }]),
      JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01" }]), JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01", startTime: "10:00", endTime: "x" }]),
      JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01", startTime: "10:00", endTime: "09:00" }]), JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01", startTime: "10:00", repeat: "yearly" }]),
      JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01", startTime: "10:00", repeat: "weekly", days: ["xyz"] }]), JSON.stringify([{ title: "A", teacher: "T", book: "B", location: "L", date: "2026-10-01", startTime: "10:00", repeat: "weekly", ends: { type: "sessions", count: -1 } }])];
    for (const sample of samples) {
      const [issue] = parseAiImport(sample, refs).issues;
      expect(issue, sample).toBeDefined();
      expect(localizeAiIssue(issue.message, "ar"), issue.message).not.toBe(issue.message);
    }
  });
});
