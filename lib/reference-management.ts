import type { Book, ClassDraft, DarsClass, Location, Teacher } from "@/lib/types/dars";

export type ReferenceMutationResult = { ok: true; id: string } | { ok: false; message: string };
export type ReferenceDeleteResult = { ok: boolean; linkedClasses: number; message?: string };
export type ClassMutationResult = { ok: true; id: string; draft: ClassDraft } | { ok: false; message: string };

export type TeacherInput = Omit<Teacher, "id">;
export type BookInput = Omit<Book, "id">;
export type LocationInput = Omit<Location, "id">;

export const cleanText = (value: string | undefined) => value?.trim().replace(/\s+/g, " ") ?? "";
export const keyText = (value: string | undefined) => cleanText(value).toLocaleLowerCase();

export function cleanTeacher(input: TeacherInput): TeacherInput {
  const subjects = input.subjects.map(cleanText).filter(Boolean);
  return { ...input, name: cleanText(input.name), title: cleanText(input.title) || undefined, subjects: [...new Set(subjects)], mainLocation: cleanText(input.mainLocation) || undefined, bio: cleanText(input.bio) || undefined, contact: cleanText(input.contact) || undefined, notes: cleanText(input.notes) || undefined };
}

export function cleanBook(input: BookInput): BookInput {
  return { ...input, name: cleanText(input.name), author: cleanText(input.author), subject: cleanText(input.subject), description: cleanText(input.description) || undefined };
}

export function cleanLocation(input: LocationInput): LocationInput {
  return { ...input, name: cleanText(input.name), address: cleanText(input.address), city: cleanText(input.city), area: cleanText(input.area), mapLink: cleanText(input.mapLink) || undefined, notes: cleanText(input.notes) || undefined };
}

export function isValidMapLink(value: string | undefined) {
  if (!cleanText(value)) return true;
  try { const url = new URL(cleanText(value)); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
}

export function validateTeacher(input: TeacherInput, records: Teacher[], editingId?: string): string | undefined {
  const value = cleanTeacher(input);
  if (!value.name) return "Add a teacher name.";
  if (!value.subjects.length) return "Add at least one subject.";
  if (records.some((record) => record.id !== editingId && keyText(record.name) === keyText(value.name))) return "A teacher with this name already exists.";
  return undefined;
}

export function validateBook(input: BookInput, records: Book[], editingId?: string): string | undefined {
  const value = cleanBook(input);
  if (!value.name || !value.author) return "Add both the book name and author.";
  if (records.some((record) => record.id !== editingId && keyText(record.name) === keyText(value.name) && keyText(record.author) === keyText(value.author))) return "This book and author are already in your library.";
  return undefined;
}

export function validateLocation(input: LocationInput, records: Location[], editingId?: string): string | undefined {
  const value = cleanLocation(input);
  if (!value.name || !value.city || !value.area) return "Add the place name, city, and area.";
  if (!isValidMapLink(value.mapLink)) return "Add a valid web link for the map, starting with https://.";
  if (records.some((record) => record.id !== editingId && keyText(record.name) === keyText(value.name) && keyText(record.city) === keyText(value.city) && keyText(record.area) === keyText(value.area))) return "A matching location already exists.";
  return undefined;
}

export function linkedClassCount(classes: DarsClass[], reference: "teacher" | "book" | "location", id: string) {
  const key = reference === "teacher" ? "teacherId" : reference === "book" ? "bookId" : "locationId";
  return classes.filter((entry) => entry[key] === id).length;
}

export function syncLocationCity(classes: DarsClass[], locationId: string, city: string) {
  return classes.map((entry) => entry.locationId === locationId ? { ...entry, city } : entry);
}

const isoDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const timeOfDay = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateClassDraft(input: ClassDraft, references: { teachers: Teacher[]; books: Book[]; locations: Location[] }): { ok: true; draft: ClassDraft } | { ok: false; message: string } {
  const title = cleanText(input.title);
  if (!title) return { ok: false, message: "Add a class title." };
  if (!references.teachers.some((item) => item.id === input.teacherId)) return { ok: false, message: "Choose a saved teacher before continuing." };
  if (!references.books.some((item) => item.id === input.bookId)) return { ok: false, message: "Choose a saved book before continuing." };
  const location = references.locations.find((item) => item.id === input.locationId);
  if (!location) return { ok: false, message: "Choose a saved location before continuing." };
  if (!isoDate.test(input.date)) return { ok: false, message: "Use a valid date in YYYY-MM-DD format." };
  if (!timeOfDay.test(input.startTime)) return { ok: false, message: "Use a valid start time in HH:MM format." };
  const endTime = cleanText(input.endTime);
  if (endTime && !timeOfDay.test(endTime)) return { ok: false, message: "Use a valid end time in HH:MM format." };
  if (endTime && endTime <= input.startTime) return { ok: false, message: "End time must be later than start time." };
  return { ok: true, draft: { ...input, title, city: location.city, endTime: endTime || undefined, notes: cleanText(input.notes) || undefined, recurrenceRule: input.type === "recurring" ? input.recurrenceRule || "Weekly" : undefined } };
}
