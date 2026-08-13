import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultPreferences, loadStudySpace, saveStudySpace } from "@/lib/dars-storage";
import { syncClassReminders } from "@/lib/reminders";
import { createRecurringOccurrences } from "@/lib/recurrence";
import type { Book, ClassDraft, DarsClass, DarsPreferences, Location, Teacher } from "@/lib/types/dars";

type DarsContextValue = {
  classes: DarsClass[]; teachers: Teacher[]; books: Book[]; locations: Location[]; preferences: DarsPreferences; isHydrated: boolean;
  saveClass: (draft: ClassDraft, id?: string) => string; deleteClass: (id: string) => void; completeClass: (id: string) => void;
  addTeacher: (input: Omit<Teacher, "id">) => string; addBook: (input: Omit<Book, "id">) => string; addLocation: (input: Omit<Location, "id">) => string;
  updatePreferences: (patch: Partial<DarsPreferences>) => void;
};

const DarsContext = createContext<DarsContextValue | null>(null);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function DarsProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<DarsClass[]>([]); const [teachers, setTeachers] = useState<Teacher[]>([]); const [books, setBooks] = useState<Book[]>([]); const [locations, setLocations] = useState<Location[]>([]); const [preferences, setPreferences] = useState<DarsPreferences>(defaultPreferences); const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => { let active = true; void loadStudySpace().then((saved) => { if (!active) return; setClasses(saved.classes); setTeachers(saved.teachers); setBooks(saved.books); setLocations(saved.locations); setPreferences(saved.preferences); setIsHydrated(true); }).catch(() => setIsHydrated(true)); return () => { active = false; }; }, []);
  useEffect(() => { if (!isHydrated) return; void saveStudySpace({ classes, teachers, books, locations, preferences }); void syncClassReminders(classes, preferences).catch(() => undefined); }, [books, classes, isHydrated, locations, preferences, teachers]);

  const value = useMemo<DarsContextValue>(() => ({
    classes, teachers, books, locations, preferences, isHydrated,
    saveClass: (draft, id) => { const classId = id ?? makeId("class"); const existing = classes.find((item) => item.id === classId); const entry = { ...draft, id: classId, reminderId: existing?.reminderId, seriesId: existing?.seriesId, occurrenceIndex: existing?.occurrenceIndex }; if (id) { setClasses((current) => current.map((item) => item.id === id ? entry : item)); return classId; } if (draft.type === "recurring") { const matchingSeed = classes.find((item) => item.type === "recurring" && item.occurrenceIndex === 0 && item.title === draft.title && item.date === draft.date && item.startTime === draft.startTime && item.teacherId === draft.teacherId && item.bookId === draft.bookId && item.locationId === draft.locationId); if (matchingSeed) return matchingSeed.id; const seriesId = makeId("series"); const occurrences = createRecurringOccurrences(draft, seriesId, () => makeId("class")); setClasses((current) => [...occurrences, ...current]); return occurrences[0]?.id ?? classId; } setClasses((current) => [entry, ...current]); return classId; },
    deleteClass: (id) => setClasses((current) => current.filter((item) => item.id !== id)),
    completeClass: (id) => setClasses((current) => current.map((item) => item.id === id ? { ...item, status: "completed" } : item)),
    addTeacher: (input) => { const id = makeId("teacher"); setTeachers((current) => [...current, { ...input, id }]); return id; },
    addBook: (input) => { const id = makeId("book"); setBooks((current) => [...current, { ...input, id }]); return id; },
    addLocation: (input) => { const id = makeId("location"); setLocations((current) => [...current, { ...input, id }]); return id; },
    updatePreferences: (patch) => setPreferences((current) => ({ ...current, ...patch })),
  }), [books, classes, isHydrated, locations, preferences, teachers]);
  return <DarsContext.Provider value={value}>{children}</DarsContext.Provider>;
}

export function useDars() { const context = useContext(DarsContext); if (!context) throw new Error("useDars must be used within DarsProvider"); return context; }
