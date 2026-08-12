import type { Book, DarsClass, Location, Teacher } from "@/lib/types/dars";

export type DarsReferences = { teachers: Teacher[]; books: Book[]; locations: Location[] };

export const formatClassDate = (isoDate: string) => new Intl.DateTimeFormat("en-EG", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${isoDate}T12:00:00`));

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-EG", { hour: "numeric", minute: "2-digit" }).format(date);
};

export const classDateTime = (item: DarsClass) => new Date(`${item.date}T${item.startTime}:00`).getTime();

export const sortClasses = (items: DarsClass[]) => [...items].sort((a, b) => classDateTime(a) - classDateTime(b));

export const getUpcomingClasses = (items: DarsClass[]) => sortClasses(items.filter((item) => item.status === "upcoming"));

export const getNextClass = (items: DarsClass[]) => getUpcomingClasses(items)[0];

export const getRef = <T extends { id: string }>(items: T[], id: string) => items.find((item) => item.id === id);

export const classMatchesQuery = (item: DarsClass, refs: DarsReferences, query: string) => {
  const teacher = getRef(refs.teachers, item.teacherId)?.name ?? "";
  const book = getRef(refs.books, item.bookId)?.name ?? "";
  const location = getRef(refs.locations, item.locationId)?.name ?? "";
  const haystack = [item.title, item.subject, item.city, item.status, teacher, book, location].join(" ").toLocaleLowerCase();
  return haystack.includes(query.trim().toLocaleLowerCase());
};

export const dayDifference = (isoDate: string) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target.getTime() - start.getTime()) / 86400000);
};
