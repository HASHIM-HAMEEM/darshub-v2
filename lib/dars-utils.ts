import type { DateDisplay, DarsClass, Location, Teacher, Book } from "@/lib/types/dars";

export type DarsReferences = { teachers: Teacher[]; books: Book[]; locations: Location[] };
const toDate = (isoDate: string) => new Date(`${isoDate}T12:00:00`);

export const formatClassDate = (isoDate: string, display: DateDisplay = "gregorian", locale = "en-EG") => {
  const date = toDate(isoDate); const gregorian = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(date); const hijriLocale = locale.startsWith("ar") ? "ar-EG-u-ca-islamic-umalqura" : "en-EG-u-ca-islamic-umalqura"; const hijri = new Intl.DateTimeFormat(hijriLocale, { day: "numeric", month: "long", year: "numeric" }).format(date);
  return display === "hijri" ? hijri : display === "dual" ? `${gregorian} · ${hijri}` : gregorian;
};
export const formatClassDateParts = (isoDate: string, locale = "en-EG") => {
  const parts = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).formatToParts(toDate(isoDate));
  return { weekday: parts.find((part) => part.type === "weekday")?.value ?? "", day: parts.find((part) => part.type === "day")?.value ?? "" };
};
export const formatTime = (time: string, locale = "en-EG") => { const [hours, minutes] = time.split(":").map(Number); const date = new Date(); date.setHours(hours, minutes, 0, 0); return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date); };
export const classDateTime = (item: DarsClass) => new Date(`${item.date}T${item.startTime}:00`).getTime();
export const sortClasses = (items: DarsClass[]) => [...items].sort((a, b) => classDateTime(a) - classDateTime(b));
export const getUpcomingClasses = (items: DarsClass[]) => sortClasses(items.filter((item) => item.status === "upcoming"));
export const getNextClass = (items: DarsClass[]) => getUpcomingClasses(items)[0];
export const getRef = <T extends { id: string }>(items: T[], id: string) => items.find((item) => item.id === id);
export const classMatchesQuery = (item: DarsClass, refs: DarsReferences, query: string) => [item.title, item.subject, item.city, item.status, getRef(refs.teachers, item.teacherId)?.name ?? "", getRef(refs.books, item.bookId)?.name ?? "", getRef(refs.locations, item.locationId)?.name ?? ""].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
export const dayDifference = (isoDate: string) => { const start = new Date(); start.setHours(12, 0, 0, 0); return Math.round((toDate(isoDate).getTime() - start.getTime()) / 86400000); };
