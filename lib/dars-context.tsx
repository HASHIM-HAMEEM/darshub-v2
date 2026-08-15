import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultPreferences, loadStudySpace, saveStudySpace, type StoredStudySpace } from "@/lib/dars-storage";
import { syncClassReminders } from "@/lib/reminders";
import { createRecurringOccurrences } from "@/lib/recurrence";
import { applyRestore, type RestoreStrategy, type RestoreSummary } from "@/lib/data-import";
import type { Book, ClassDraft, DarsClass, DarsPreferences, Location, Teacher } from "@/lib/types/dars";
import { cleanBook, cleanLocation, cleanTeacher, linkedClassCount, syncLocationCity, type BookInput, type LocationInput, type ReferenceDeleteResult, type ReferenceMutationResult, type TeacherInput, validateBook, validateLocation, validateTeacher } from "@/lib/reference-management";

type DarsContextValue = {
  classes: DarsClass[]; teachers: Teacher[]; books: Book[]; locations: Location[]; preferences: DarsPreferences; isHydrated: boolean;
  saveClass: (draft: ClassDraft, id?: string) => string; deleteClass: (id: string) => void; completeClass: (id: string) => void;
  addTeacher: (input: TeacherInput) => string; addBook: (input: BookInput) => string; addLocation: (input: LocationInput) => string;
  saveTeacher: (input: TeacherInput, id?: string) => ReferenceMutationResult; saveBook: (input: BookInput, id?: string) => ReferenceMutationResult; saveLocation: (input: LocationInput, id?: string) => ReferenceMutationResult;
  deleteTeacher: (id: string) => ReferenceDeleteResult; deleteBook: (id: string) => ReferenceDeleteResult; deleteLocation: (id: string) => ReferenceDeleteResult;
  updatePreferences: (patch: Partial<DarsPreferences>) => void; updateFutureSeries: (seriesId: string, fromOccurrenceIndex: number, draft: ClassDraft) => void; cancelFutureSeries: (seriesId: string, fromOccurrenceIndex: number) => void; restoreStudySpace: (space: StoredStudySpace, strategy: RestoreStrategy) => RestoreSummary;
};

const DarsContext = createContext<DarsContextValue | null>(null);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function DarsProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<DarsClass[]>([]); const [teachers, setTeachers] = useState<Teacher[]>([]); const [books, setBooks] = useState<Book[]>([]); const [locations, setLocations] = useState<Location[]>([]); const [preferences, setPreferences] = useState<DarsPreferences>(defaultPreferences); const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => { let active = true; void loadStudySpace().then((saved) => { if (!active) return; setClasses(saved.classes); setTeachers(saved.teachers); setBooks(saved.books); setLocations(saved.locations); setPreferences(saved.preferences); setIsHydrated(true); }).catch(() => setIsHydrated(true)); return () => { active = false; }; }, []);
  useEffect(() => { if (!isHydrated) return; void saveStudySpace({ classes, teachers, books, locations, preferences }); }, [books, classes, isHydrated, locations, preferences, teachers]);
  useEffect(() => { if (!isHydrated) return; void syncClassReminders(classes, preferences).catch(() => undefined); }, [classes, isHydrated, preferences]);

  const value = useMemo<DarsContextValue>(() => ({
    classes, teachers, books, locations, preferences, isHydrated,
    saveClass: (draft, id) => { const classId = id ?? makeId("class"); const existing = classes.find((item) => item.id === classId); const entry = { ...draft, id: classId, reminderId: existing?.reminderId, seriesId: existing?.seriesId, occurrenceIndex: existing?.occurrenceIndex }; if (id) { setClasses((current) => current.map((item) => item.id === id ? entry : item)); return classId; } if (draft.type === "recurring") { const matchingSeed = classes.find((item) => item.type === "recurring" && item.occurrenceIndex === 0 && item.title === draft.title && item.date === draft.date && item.startTime === draft.startTime && item.teacherId === draft.teacherId && item.bookId === draft.bookId && item.locationId === draft.locationId); if (matchingSeed) return matchingSeed.id; const seriesId = makeId("series"); const occurrences = createRecurringOccurrences(draft, seriesId, () => makeId("class")); setClasses((current) => [...occurrences, ...current]); return occurrences[0]?.id ?? classId; } setClasses((current) => [entry, ...current]); return classId; },
    deleteClass: (id) => setClasses((current) => current.filter((item) => item.id !== id)),
    completeClass: (id) => setClasses((current) => current.map((item) => item.id === id ? { ...item, status: "completed" } : item)),
    addTeacher: (input) => { const id = makeId("teacher"); setTeachers((current) => [...current, { ...cleanTeacher(input), id }]); return id; },
    addBook: (input) => { const id = makeId("book"); setBooks((current) => [...current, { ...cleanBook(input), id }]); return id; },
    addLocation: (input) => { const id = makeId("location"); setLocations((current) => [...current, { ...cleanLocation(input), id }]); return id; },
    saveTeacher: (input, id) => { const message = validateTeacher(input, teachers, id); if (message) return { ok: false, message }; const savedId = id ?? makeId("teacher"); const entry = { ...cleanTeacher(input), id: savedId }; setTeachers((current) => id ? current.map((item) => item.id === id ? entry : item) : [...current, entry]); return { ok: true, id: savedId }; },
    saveBook: (input, id) => { const message = validateBook(input, books, id); if (message) return { ok: false, message }; const savedId = id ?? makeId("book"); const entry = { ...cleanBook(input), id: savedId }; setBooks((current) => id ? current.map((item) => item.id === id ? entry : item) : [...current, entry]); return { ok: true, id: savedId }; },
    saveLocation: (input, id) => { const message = validateLocation(input, locations, id); if (message) return { ok: false, message }; const savedId = id ?? makeId("location"); const entry = { ...cleanLocation(input), id: savedId }; setLocations((current) => id ? current.map((item) => item.id === id ? entry : item) : [...current, entry]); if (id) setClasses((current) => syncLocationCity(current, id, entry.city)); return { ok: true, id: savedId }; },
    deleteTeacher: (id) => { const linkedClasses = linkedClassCount(classes, "teacher", id); if (linkedClasses) return { ok: false, linkedClasses, message: "This teacher is used by existing classes." }; setTeachers((current) => current.filter((item) => item.id !== id)); return { ok: true, linkedClasses: 0 }; },
    deleteBook: (id) => { const linkedClasses = linkedClassCount(classes, "book", id); if (linkedClasses) return { ok: false, linkedClasses, message: "This book is used by existing classes." }; setBooks((current) => current.filter((item) => item.id !== id)); return { ok: true, linkedClasses: 0 }; },
    deleteLocation: (id) => { const linkedClasses = linkedClassCount(classes, "location", id); if (linkedClasses) return { ok: false, linkedClasses, message: "This location is used by existing classes." }; setLocations((current) => current.filter((item) => item.id !== id)); return { ok: true, linkedClasses: 0 }; },
    updatePreferences: (patch) => setPreferences((current) => ({ ...current, ...patch })),
    updateFutureSeries: (seriesId, fromOccurrenceIndex, draft) => { const { status: _status, ...seriesDraft } = draft; setClasses((current) => current.map((item) => item.seriesId === seriesId && (item.occurrenceIndex ?? 0) >= fromOccurrenceIndex && item.status === "upcoming" ? { ...item, ...seriesDraft, id: item.id, date: item.date, status: item.status, seriesId, occurrenceIndex: item.occurrenceIndex, type: "recurring" } : item)); },
    cancelFutureSeries: (seriesId, fromOccurrenceIndex) => setClasses((current) => current.map((item) => item.seriesId === seriesId && (item.occurrenceIndex ?? 0) >= fromOccurrenceIndex && item.status === "upcoming" ? { ...item, status: "cancelled" } : item)),
    restoreStudySpace: (space, strategy) => { const result = applyRestore({ classes, teachers, books, locations, preferences }, space, strategy); setClasses(result.space.classes); setTeachers(result.space.teachers); setBooks(result.space.books); setLocations(result.space.locations); setPreferences(result.space.preferences); return result.summary; },
  }), [books, classes, isHydrated, locations, preferences, teachers]);
  return <DarsContext.Provider value={value}>{children}</DarsContext.Provider>;
}

export function useDars() { const context = useContext(DarsContext); if (!context) throw new Error("useDars must be used within DarsProvider"); return context; }
