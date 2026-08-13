import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Book, DarsClass, DarsPreferences, Location, Teacher } from "@/lib/types/dars";

const storageKeys = { classes: "darshub:classes", teachers: "darshub:teachers", books: "darshub:books", locations: "darshub:locations", preferences: "darshub:preferences" } as const;

export type StoredStudySpace = { classes: DarsClass[]; teachers: Teacher[]; books: Book[]; locations: Location[]; preferences: DarsPreferences };

export const defaultPreferences: DarsPreferences = { appLanguage: "en", dateDisplay: "dual", dateLanguage: "en", remindersEnabled: false, reminderLeadMinutes: 30 };

function parseStored<T>(value: string | null, fallback: T): T { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }

export async function loadStudySpace(): Promise<StoredStudySpace> {
  const values = Object.fromEntries(await AsyncStorage.multiGet(Object.values(storageKeys)));
  return { classes: parseStored(values[storageKeys.classes], []), teachers: parseStored(values[storageKeys.teachers], []), books: parseStored(values[storageKeys.books], []), locations: parseStored(values[storageKeys.locations], []), preferences: { ...defaultPreferences, ...parseStored<Partial<DarsPreferences>>(values[storageKeys.preferences], {}) } };
}

export function saveStudySpace(space: StoredStudySpace) { return AsyncStorage.multiSet([[storageKeys.classes, JSON.stringify(space.classes)], [storageKeys.teachers, JSON.stringify(space.teachers)], [storageKeys.books, JSON.stringify(space.books)], [storageKeys.locations, JSON.stringify(space.locations)], [storageKeys.preferences, JSON.stringify(space.preferences)]]); }
