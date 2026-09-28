import type { Book, ClassDraft, Location, RecurrenceEnd, Teacher } from "@/lib/types/dars";
import { subjects } from "./types/dars";
import { keyText } from "./reference-management";
import { maxSeriesSessions, normalizeRecurrenceDays } from "./recurrence";

export const aiImportFormat = "darshub-ai-classes";
export const maxAiImportClasses = 100;

type Refs = { teachers: Teacher[]; books: Book[]; locations: Location[] };

export type AiClassPlan = {
  title: string;
  subject: string;
  teacher: { name: string; existingId?: string };
  book: { name: string; author: string; existingId?: string };
  location: { name: string; city: string; area: string; address: string; existingId?: string };
  date: string;
  startTime: string;
  endTime?: string;
  repeat: "none" | "Weekly" | "Every 2 weeks" | "Monthly";
  days?: number[];
  ends?: RecurrenceEnd;
  notes?: string;
};

export type AiImportIssue = { index: number; message: string };
export type AiImportResult = { plans: AiClassPlan[]; issues: AiImportIssue[] };

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const arabicDigits = (text: string) => text.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
const text = (value: unknown) => (typeof value === "string" || typeof value === "number" ? arabicDigits(String(value)).trim().replace(/\s+/g, " ") : "");
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const dayNames: Record<string, number> = {
  sun: 0, sunday: 0, "الأحد": 0, "الاحد": 0, "أحد": 0,
  mon: 1, monday: 1, "الاثنين": 1, "الإثنين": 1, "اثنين": 1,
  tue: 2, tues: 2, tuesday: 2, "الثلاثاء": 2, "ثلاثاء": 2,
  wed: 3, wednesday: 3, "الأربعاء": 3, "الاربعاء": 3, "أربعاء": 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4, "الخميس": 4, "خميس": 4,
  fri: 5, friday: 5, "الجمعة": 5, "جمعة": 5,
  sat: 6, saturday: 6, "السبت": 6, "سبت": 6,
};

export function parseDay(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6) return value;
  const key = text(value).toLocaleLowerCase().replace(/\.$/, "");
  if (/^[0-6]$/.test(key)) return Number(key);
  return dayNames[key];
}

export function parseTime(value: unknown): string | undefined {
  const raw = text(value).toLowerCase().replace(/\s+/g, "").replace("ص", "am").replace("م", "pm");
  const match = raw.match(/^(\d{1,2})(?:[:.](\d{2}))?(am|pm|a\.m\.|p\.m\.)?$/);
  if (!match) return undefined;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const suffix = match[3]?.replace(/\./g, "");
  if (suffix) {
    if (hours < 1 || hours > 12) return undefined;
    hours = (hours % 12) + (suffix === "pm" ? 12 : 0);
  }
  if (hours > 23 || minutes > 59) return undefined;
  return `${pad(hours)}:${pad(minutes)}`;
}

export function parseDate(value: unknown): string | undefined {
  const raw = text(value);
  const match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return undefined;
  return toIso(date);
}

function parseRepeat(value: unknown): AiClassPlan["repeat"] | undefined {
  const key = text(value).toLowerCase().replace(/[_\s]+/g, "-");
  if (!key || ["none", "once", "one-time", "no", "single"].includes(key)) return "none";
  if (["weekly", "every-week", "week"].includes(key)) return "Weekly";
  if (["every-2-weeks", "biweekly", "fortnightly", "every-two-weeks"].includes(key)) return "Every 2 weeks";
  if (["monthly", "every-month", "month"].includes(key)) return "Monthly";
  return undefined;
}

function parseEnds(value: unknown, date: string): RecurrenceEnd | undefined | "invalid" {
  if (value === undefined || value === null || value === "") return { kind: "ongoing" };
  if (typeof value === "number") return parseEnds({ type: "sessions", count: value }, date);
  if (typeof value === "string") {
    const iso = parseDate(value);
    if (iso) return parseEnds({ type: "date", date: iso }, date);
    return ["ongoing", "unknown", "open", "none", "never"].includes(value.trim().toLowerCase()) ? { kind: "ongoing" } : "invalid";
  }
  if (!isRecord(value)) return "invalid";
  const kind = text(value.type ?? value.kind).toLowerCase();
  if (["sessions", "count", "after"].includes(kind) || value.count !== undefined || value.sessions !== undefined) {
    const count = Number(text(value.count ?? value.sessions));
    if (!Number.isInteger(count) || count < 1 || count > maxSeriesSessions) return "invalid";
    return { kind: "count", count };
  }
  if (["date", "until", "on"].includes(kind) || value.date !== undefined) {
    const until = parseDate(value.date ?? value.until);
    if (!until || until < date) return "invalid";
    return { kind: "until", date: until };
  }
  if (!kind || ["ongoing", "unknown", "open", "never"].includes(kind)) return { kind: "ongoing" };
  return "invalid";
}

/** Pulls the first JSON object/array out of an AI reply (which may include ``` fences or prose). */
export function extractJson(input: string): unknown {
  const trimmed = input.trim().replace(/^\uFEFF/, "");
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : trimmed).replace(/[“”]/g, "\"").replace(/[‘’]/g, "'");
  const start = body.search(/[[{]/);
  if (start < 0) throw new Error("no-json");
  const open = body[start];
  const end = body.lastIndexOf(open === "{" ? "}" : "]");
  if (end <= start) throw new Error("no-json");
  const slice = body.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(slice);
}

function findByName<T extends { id: string; name: string }>(records: T[], name: string) {
  return records.find((record) => keyText(record.name) === keyText(name));
}

export function parseAiImport(input: string, refs: Refs): AiImportResult {
  let root: unknown;
  try {
    root = extractJson(input);
  } catch {
    return { plans: [], issues: [{ index: -1, message: "This doesn't look like JSON. Paste the full reply from the AI." }] };
  }
  const list = Array.isArray(root) ? root : isRecord(root) && Array.isArray(root.classes) ? root.classes : isRecord(root) && root.title ? [root] : null;
  if (!list) return { plans: [], issues: [{ index: -1, message: "The JSON needs a \"classes\" list." }] };
  if (!list.length) return { plans: [], issues: [{ index: -1, message: "The \"classes\" list is empty." }] };
  if (list.length > maxAiImportClasses) return { plans: [], issues: [{ index: -1, message: `Import up to ${maxAiImportClasses} classes at a time.` }] };
  const plans: AiClassPlan[] = [];
  const issues: AiImportIssue[] = [];
  list.forEach((entry, index) => {
    const fail = (message: string) => issues.push({ index, message });
    if (!isRecord(entry)) return fail("Each class must be an object.");
    const title = text(entry.title);
    if (!title) return fail("Missing \"title\".");
    const teacherName = text(isRecord(entry.teacher) ? entry.teacher.name : entry.teacher);
    if (!teacherName) return fail("Missing \"teacher\".");
    const bookSource = isRecord(entry.book) ? entry.book : { name: entry.book, author: entry.bookAuthor ?? entry.author };
    const bookName = text(bookSource.name);
    if (!bookName) return fail("Missing \"book\".");
    const locationSource = isRecord(entry.location) ? entry.location : { name: entry.location, city: entry.city, area: entry.area, address: entry.address };
    const locationName = text(locationSource.name);
    if (!locationName) return fail("Missing \"location\".");
    const date = parseDate(entry.date ?? entry.startDate);
    if (!date) return fail("\"date\" must be YYYY-MM-DD.");
    const startTime = parseTime(entry.startTime ?? entry.time);
    if (!startTime) return fail("\"startTime\" must be HH:MM (24-hour).");
    const endRaw = entry.endTime;
    const endTime = endRaw === undefined || endRaw === null || endRaw === "" ? undefined : parseTime(endRaw);
    if (endRaw && !endTime) return fail("\"endTime\" must be HH:MM (24-hour).");
    if (endTime && endTime <= startTime) return fail("\"endTime\" must be after \"startTime\".");
    const repeat = parseRepeat(entry.repeat ?? entry.recurrence);
    if (!repeat) return fail("\"repeat\" must be none, weekly, every-2-weeks or monthly.");
    let days: number[] | undefined;
    if (repeat === "Weekly" || repeat === "Every 2 weeks") {
      const rawDays = Array.isArray(entry.days) ? entry.days : entry.days ? [entry.days] : [];
      const parsed = rawDays.map(parseDay);
      if (parsed.some((day) => day === undefined)) return fail("\"days\" must use names like \"mon\" or \"saturday\".");
      days = normalizeRecurrenceDays(parsed as number[], date);
    }
    const ends = repeat === "none" ? undefined : parseEnds(entry.ends ?? entry.end, date);
    if (ends === "invalid") return fail("\"ends\" must be ongoing, {\"type\":\"sessions\",\"count\":N} or {\"type\":\"date\",\"date\":\"YYYY-MM-DD\"}.");
    const subjectRaw = text(entry.subject);
    const subject = subjects.find((item) => item.toLowerCase() === subjectRaw.toLowerCase()) ?? (subjectRaw || "Hadith");
    const teacher = findByName(refs.teachers, teacherName);
    const book = findByName(refs.books, bookName);
    const location = findByName(refs.locations, locationName);
    const city = text(locationSource.city) || location?.city || "";
    plans.push({
      title,
      subject,
      teacher: { name: teacher?.name ?? teacherName, existingId: teacher?.id },
      book: { name: book?.name ?? bookName, author: book?.author ?? (text(bookSource.author) || "Unknown"), existingId: book?.id },
      location: { name: location?.name ?? locationName, city: city || "—", area: location?.area ?? (text(locationSource.area) || city || "—"), address: location?.address ?? text(locationSource.address), existingId: location?.id },
      date,
      startTime,
      endTime,
      repeat,
      days,
      ends,
      notes: text(entry.notes) || undefined,
    });
  });
  return { plans, issues };
}

export function planToDraft(plan: AiClassPlan, ids: { teacherId: string; bookId: string; locationId: string; city: string }): ClassDraft {
  const recurring = plan.repeat !== "none";
  return {
    title: plan.title,
    subject: plan.subject,
    teacherId: ids.teacherId,
    bookId: ids.bookId,
    locationId: ids.locationId,
    city: ids.city,
    date: plan.date,
    startTime: plan.startTime,
    endTime: plan.endTime,
    notes: plan.notes,
    type: recurring ? "recurring" : "one-time",
    recurrenceRule: recurring ? plan.repeat : undefined,
    recurrenceDays: plan.days,
    recurrenceEnd: plan.ends,
    language: "Arabic",
    status: "upcoming",
  };
}

export function buildAiPrompt(refs: Refs, today: Date, language: "en" | "ar") {
  const example = {
    format: aiImportFormat,
    version: 1,
    classes: [
      { title: "Riyad as-Salihin", subject: "Hadith", teacher: "Sheikh Ahmad", book: { name: "Riyad as-Salihin", author: "Imam an-Nawawi" }, location: { name: "Central Masjid", city: "Cairo", area: "Nasr City", address: "" }, date: "2026-10-03", startTime: "19:30", endTime: "20:30", repeat: "weekly", days: ["sat", "mon", "wed"], ends: { type: "ongoing" }, notes: "" },
      { title: "Tajweed course", subject: "Quran", teacher: "Ustadh Omar", book: { name: "Tuhfat al-Atfal", author: "al-Jamzuri" }, location: { name: "Online", city: "Online", area: "Zoom" }, date: "2026-10-05", startTime: "06:00", endTime: null, repeat: "weekly", days: ["mon", "thu"], ends: { type: "sessions", count: 15 } },
      { title: "Seerah seminar", subject: "Seerah", teacher: "Sheikh Ahmad", book: { name: "Ar-Raheeq al-Makhtum", author: "al-Mubarakpuri" }, location: { name: "Central Masjid", city: "Cairo", area: "Nasr City" }, date: "2026-10-10", startTime: "10:00", repeat: "none" },
    ],
  };
  const known = [
    refs.teachers.length ? `Teachers I already have (reuse these exact names): ${refs.teachers.map((item) => item.name).join(", ")}` : "",
    refs.books.length ? `Books I already have: ${refs.books.map((item) => `${item.name} (${item.author})`).join(", ")}` : "",
    refs.locations.length ? `Places I already have: ${refs.locations.map((item) => `${item.name} – ${item.city}`).join(", ")}` : "",
  ].filter(Boolean).join("\n");
  return [
    "You are helping me fill my DarsHub class schedule. Interview me (by voice or text) until you know every class I attend: title, subject, teacher, book and its author, place (name, city, area), first date, start time, optional end time, which weekdays it repeats on, and when it ends (a number of sessions, an end date, or not decided yet).",
    `Today is ${toIso(today)} (${today.toLocaleDateString("en-US", { weekday: "long" })}). Turn words like "next Saturday" into real dates.`,
    language === "ar" ? "I may speak Arabic. Keep names as I say them, but keep the JSON keys and fixed values in English." : "",
    known,
    "When I say I'm done, reply with ONLY one JSON code block in exactly this format, no other text:",
    "```json",
    JSON.stringify(example, null, 2),
    "```",
    "Rules:",
    `- subject is one of: ${subjects.join(", ")}.`,
    "- date is the first session, YYYY-MM-DD. startTime/endTime are 24-hour HH:MM; endTime may be null.",
    "- repeat is one of: none, weekly, every-2-weeks, monthly.",
    "- days (for weekly / every-2-weeks) uses sun, mon, tue, wed, thu, fri, sat. A class on 4 days a week lists 4 days.",
    "- ends is {\"type\":\"ongoing\"} when the end is not known, {\"type\":\"sessions\",\"count\":N} for a fixed number of sessions, or {\"type\":\"date\",\"date\":\"YYYY-MM-DD\"}.",
    "- One entry per class; do not list every session separately.",
  ].filter(Boolean).join("\n");
}

const arabicIssues: Record<string, string> = {
  "This doesn't look like JSON. Paste the full reply from the AI.": "هذا لا يبدو JSON. الصق رد الذكاء الاصطناعي كاملاً.",
  "The JSON needs a \"classes\" list.": "يجب أن يحتوي JSON على قائمة \"classes\".",
  "The \"classes\" list is empty.": "قائمة \"classes\" فارغة.",
  [`Import up to ${maxAiImportClasses} classes at a time.`]: `يمكن استيراد ${maxAiImportClasses} درس كحد أقصى في كل مرة.`,
  "Each class must be an object.": "يجب أن يكون كل درس كائناً.",
  "Missing \"title\".": "العنوان \"title\" مفقود.",
  "Missing \"teacher\".": "المعلم \"teacher\" مفقود.",
  "Missing \"book\".": "الكتاب \"book\" مفقود.",
  "Missing \"location\".": "المكان \"location\" مفقود.",
  "\"date\" must be YYYY-MM-DD.": "يجب أن يكون \"date\" بصيغة YYYY-MM-DD.",
  "\"startTime\" must be HH:MM (24-hour).": "يجب أن يكون \"startTime\" بصيغة HH:MM (٢٤ ساعة).",
  "\"endTime\" must be HH:MM (24-hour).": "يجب أن يكون \"endTime\" بصيغة HH:MM (٢٤ ساعة).",
  "\"endTime\" must be after \"startTime\".": "يجب أن يكون \"endTime\" بعد \"startTime\".",
  "\"repeat\" must be none, weekly, every-2-weeks or monthly.": "يجب أن يكون \"repeat\" واحداً من: none أو weekly أو every-2-weeks أو monthly.",
  "\"days\" must use names like \"mon\" or \"saturday\".": "استخدم في \"days\" أسماء مثل \"mon\" أو \"saturday\".",
  "\"ends\" must be ongoing, {\"type\":\"sessions\",\"count\":N} or {\"type\":\"date\",\"date\":\"YYYY-MM-DD\"}.": "يجب أن يكون \"ends\" إما ongoing أو {\"type\":\"sessions\",\"count\":N} أو {\"type\":\"date\",\"date\":\"YYYY-MM-DD\"}.",
};

export function localizeAiIssue(message: string, language: "en" | "ar") {
  return language === "ar" ? arabicIssues[message] ?? message : message;
}
