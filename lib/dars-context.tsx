import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { createSerializedTaskQueue, defaultPreferences, loadStudySpace, saveStudySpace, type StoredStudySpace } from "@/lib/dars-storage";
import { syncClassReminders } from "@/lib/reminders";
import { createRecurringOccurrences, extendOngoingSeries, resizeSeries } from "@/lib/recurrence";
import { planToDraft, type AiClassPlan } from "@/lib/ai-import";
import { applyRestore, type RestoreStrategy, type RestoreSummary } from "@/lib/data-import";
import type { Book, ClassDraft, DarsClass, DarsPreferences, Location, RecurrenceEnd, Teacher } from "@/lib/types/dars";
import { cleanBook, cleanLocation, cleanTeacher, keyText, linkedClassCount, syncLocationCity, type BookInput, type ClassMutationResult, type LocationInput, type ReferenceDeleteResult, type ReferenceMutationResult, type TeacherInput, validateBook, validateClassDraft, validateLocation, validateTeacher } from "@/lib/reference-management";

export type ClassReferenceKind = "teacher" | "book" | "location";

type DarsContextValue = {
  classes: DarsClass[]; teachers: Teacher[]; books: Book[]; locations: Location[]; preferences: DarsPreferences; isHydrated: boolean; dataStatus: "hydrating" | "ready" | "error"; saveStatus: "idle" | "saving" | "error"; saveError?: string; classReferenceResult: { kind: ClassReferenceKind; id: string } | null; retryHydration: () => void; retrySave: () => void; returnToClassWithReference: (kind: ClassReferenceKind, id: string) => void; clearClassReferenceResult: () => void;
  saveClass: (draft: ClassDraft, id?: string) => ClassMutationResult; deleteClass: (id: string) => void; completeClass: (id: string) => void;
  saveTeacher: (input: TeacherInput, id?: string) => ReferenceMutationResult; saveBook: (input: BookInput, id?: string) => ReferenceMutationResult; saveLocation: (input: LocationInput, id?: string) => ReferenceMutationResult;
  deleteTeacher: (id: string) => ReferenceDeleteResult; deleteBook: (id: string) => ReferenceDeleteResult; deleteLocation: (id: string) => ReferenceDeleteResult;
  updatePreferences: (patch: Partial<DarsPreferences>) => void; updateFutureSeries: (seriesId: string, fromOccurrenceIndex: number, draft: ClassDraft) => ClassMutationResult; cancelFutureSeries: (seriesId: string, fromOccurrenceIndex: number) => void; changeSeriesEnd: (seriesId: string, end: RecurrenceEnd) => void; importAiPlans: (plans: AiClassPlan[]) => { classes: number; sessions: number; teachers: number; books: number; locations: number; skipped: number }; restoreStudySpace: (space: StoredStudySpace, strategy: RestoreStrategy) => RestoreSummary;
};

const DarsContext = createContext<DarsContextValue | null>(null);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const todayIso = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };

export function DarsProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<DarsClass[]>([]); const [teachers, setTeachers] = useState<Teacher[]>([]); const [books, setBooks] = useState<Book[]>([]); const [locations, setLocations] = useState<Location[]>([]); const [preferences, setPreferences] = useState<DarsPreferences>(defaultPreferences); const [isHydrated, setIsHydrated] = useState(false); const [dataStatus, setDataStatus] = useState<DarsContextValue["dataStatus"]>("hydrating"); const [saveStatus, setSaveStatus] = useState<DarsContextValue["saveStatus"]>("idle"); const [saveError, setSaveError] = useState<string>(); const [saveRevision, setSaveRevision] = useState(0); const [classReferenceResult, setClassReferenceResult] = useState<DarsContextValue["classReferenceResult"]>(null); const queue = useRef(createSerializedTaskQueue()).current;

  const hydrate = useCallback(() => { let active = true; setDataStatus("hydrating"); setIsHydrated(false); void loadStudySpace().then((saved) => { if (!active) return; setClasses(saved.classes); setTeachers(saved.teachers); setBooks(saved.books); setLocations(saved.locations); setPreferences(saved.preferences); setDataStatus("ready"); setIsHydrated(true); }).catch((error: unknown) => { if (!active) return; setDataStatus("error"); setSaveError(error instanceof Error ? error.message : "Dars could not read local study data."); }); return () => { active = false; }; }, []);
  useEffect(() => hydrate(), [hydrate]);
  useEffect(() => { if (!isHydrated) return; const snapshot: StoredStudySpace = { classes, teachers, books, locations, preferences }; setSaveStatus("saving"); void queue.run(() => saveStudySpace(snapshot)).then(() => { setSaveStatus("idle"); setSaveError(undefined); }).catch((error: unknown) => { setSaveStatus("error"); setSaveError(error instanceof Error ? error.message : "Dars could not save your latest changes locally."); }); }, [books, classes, isHydrated, locations, preferences, queue, saveRevision, teachers]);
  const [reminderEpoch, setReminderEpoch] = useState(0);
  useEffect(() => { const subscription = AppState.addEventListener("change", (state) => { if (state === "active") setReminderEpoch((value) => value + 1); }); return () => subscription.remove(); }, []);
  useEffect(() => { if (!isHydrated) return; const additions = extendOngoingSeries(classes, todayIso(), () => makeId("class")); if (additions.length) setClasses((current) => [...current, ...additions.filter((entry) => !current.some((item) => item.seriesId === entry.seriesId && item.occurrenceIndex === entry.occurrenceIndex))]); }, [classes, isHydrated, reminderEpoch]);
  useEffect(() => { if (!isHydrated) return; void syncClassReminders(classes, preferences, locations).catch(() => undefined); }, [classes, isHydrated, locations, preferences, reminderEpoch]);

  const value = useMemo<DarsContextValue>(() => ({
    classes, teachers, books, locations, preferences, isHydrated, dataStatus, saveStatus, saveError, classReferenceResult, retryHydration: () => { void hydrate(); }, retrySave: () => setSaveRevision((current) => current + 1), returnToClassWithReference: (kind, id) => setClassReferenceResult({ kind, id }), clearClassReferenceResult: () => setClassReferenceResult(null),
    saveClass: (draft, id) => { const checked = validateClassDraft(draft, { teachers, books, locations }); if (!checked.ok) return checked; const savedDraft = checked.draft; const classId = id ?? makeId("class"); const existing = classes.find((item) => item.id === classId); if (id && !existing) return { ok: false, message: "This class no longer exists." }; const entry = { ...savedDraft, id: classId, reminderId: existing?.reminderId, seriesId: existing?.seriesId, occurrenceIndex: existing?.occurrenceIndex }; if (id) { setClasses((current) => current.map((item) => item.id === id ? entry : item)); return { ok: true, id: classId, draft: savedDraft }; } if (savedDraft.type === "recurring") { const matchingSeed = classes.find((item) => item.type === "recurring" && item.occurrenceIndex === 0 && item.title === savedDraft.title && item.date === savedDraft.date && item.startTime === savedDraft.startTime && item.teacherId === savedDraft.teacherId && item.bookId === savedDraft.bookId && item.locationId === savedDraft.locationId); if (matchingSeed) return { ok: true, id: matchingSeed.id, draft: savedDraft }; const seriesId = makeId("series"); const occurrences = createRecurringOccurrences(savedDraft, seriesId, () => makeId("class")); setClasses((current) => [...occurrences, ...current]); return { ok: true, id: occurrences[0]?.id ?? classId, draft: savedDraft }; } setClasses((current) => [entry, ...current]); return { ok: true, id: classId, draft: savedDraft }; },
    deleteClass: (id) => setClasses((current) => current.filter((item) => item.id !== id)),
    completeClass: (id) => setClasses((current) => current.map((item) => item.id === id ? { ...item, status: "completed" } : item)),
    saveTeacher: (input, id) => { const message = validateTeacher(input, teachers, id); if (message) return { ok: false, message }; const savedId = id ?? makeId("teacher"); const entry = { ...cleanTeacher(input), id: savedId }; setTeachers((current) => id ? current.map((item) => item.id === id ? entry : item) : [...current, entry]); return { ok: true, id: savedId }; },
    saveBook: (input, id) => { const message = validateBook(input, books, id); if (message) return { ok: false, message }; const savedId = id ?? makeId("book"); const entry = { ...cleanBook(input), id: savedId }; setBooks((current) => id ? current.map((item) => item.id === id ? entry : item) : [...current, entry]); return { ok: true, id: savedId }; },
    saveLocation: (input, id) => { const message = validateLocation(input, locations, id); if (message) return { ok: false, message }; const savedId = id ?? makeId("location"); const entry = { ...cleanLocation(input), id: savedId }; setLocations((current) => id ? current.map((item) => item.id === id ? entry : item) : [...current, entry]); if (id) setClasses((current) => syncLocationCity(current, id, entry.city)); return { ok: true, id: savedId }; },
    deleteTeacher: (id) => { const linkedClasses = linkedClassCount(classes, "teacher", id); if (linkedClasses) return { ok: false, linkedClasses, message: "This teacher is used by existing classes." }; setTeachers((current) => current.filter((item) => item.id !== id)); return { ok: true, linkedClasses: 0 }; },
    deleteBook: (id) => { const linkedClasses = linkedClassCount(classes, "book", id); if (linkedClasses) return { ok: false, linkedClasses, message: "This book is used by existing classes." }; setBooks((current) => current.filter((item) => item.id !== id)); return { ok: true, linkedClasses: 0 }; },
    deleteLocation: (id) => { const linkedClasses = linkedClassCount(classes, "location", id); if (linkedClasses) return { ok: false, linkedClasses, message: "This location is used by existing classes." }; setLocations((current) => current.filter((item) => item.id !== id)); return { ok: true, linkedClasses: 0 }; },
    updatePreferences: (patch) => setPreferences((current) => ({ ...current, ...patch })),
    updateFutureSeries: (seriesId, fromOccurrenceIndex, draft) => { const checked = validateClassDraft(draft, { teachers, books, locations }); if (!checked.ok) return checked; const { status: _status, ...seriesDraft } = checked.draft; const first = classes.find((item) => item.seriesId === seriesId && (item.occurrenceIndex ?? 0) >= fromOccurrenceIndex && item.status === "upcoming"); if (!first) return { ok: false, message: "There are no upcoming classes left in this series." }; setClasses((current) => current.map((item) => item.seriesId === seriesId && (item.occurrenceIndex ?? 0) >= fromOccurrenceIndex && item.status === "upcoming" ? { ...item, ...seriesDraft, id: item.id, date: item.date, status: item.status, seriesId, occurrenceIndex: item.occurrenceIndex, type: "recurring" } : item)); return { ok: true, id: first.id, draft: checked.draft }; },
    importAiPlans: (plans) => {
      const nextTeachers = [...teachers]; const nextBooks = [...books]; const nextLocations = [...locations]; const created: DarsClass[] = [];
      const counts = { classes: 0, sessions: 0, teachers: 0, books: 0, locations: 0, skipped: 0 };
      for (const plan of plans) {
        let teacher = nextTeachers.find((item) => keyText(item.name) === keyText(plan.teacher.name));
        if (!teacher) { teacher = { ...cleanTeacher({ name: plan.teacher.name, subjects: [plan.subject] }), id: makeId("teacher") }; nextTeachers.push(teacher); counts.teachers += 1; }
        let book = nextBooks.find((item) => keyText(item.name) === keyText(plan.book.name));
        if (!book) { book = { ...cleanBook({ name: plan.book.name, author: plan.book.author, subject: plan.subject, studyStatus: "Current study" }), id: makeId("book") }; nextBooks.push(book); counts.books += 1; }
        let location = nextLocations.find((item) => keyText(item.name) === keyText(plan.location.name));
        if (!location) { location = { ...cleanLocation({ name: plan.location.name, city: plan.location.city, area: plan.location.area, address: plan.location.address }), id: makeId("location") }; nextLocations.push(location); counts.locations += 1; }
        const checked = validateClassDraft(planToDraft(plan, { teacherId: teacher.id, bookId: book.id, locationId: location.id, city: location.city }), { teachers: nextTeachers, books: nextBooks, locations: nextLocations });
        if (!checked.ok) { counts.skipped += 1; continue; }
        const entries = checked.draft.type === "recurring" ? createRecurringOccurrences(checked.draft, makeId("series"), () => makeId("class")) : [{ ...checked.draft, id: makeId("class") }];
        if (!entries.length) { counts.skipped += 1; continue; }
        created.push(...entries); counts.classes += 1; counts.sessions += entries.length;
      }
      setTeachers(nextTeachers); setBooks(nextBooks); setLocations(nextLocations); setClasses((current) => [...created, ...current]);
      return counts;
    },
    changeSeriesEnd: (seriesId, end) => setClasses((current) => resizeSeries(current, seriesId, end, todayIso(), () => makeId("class"))),
    cancelFutureSeries: (seriesId, fromOccurrenceIndex) => setClasses((current) => current.map((item) => item.seriesId === seriesId && (item.occurrenceIndex ?? 0) >= fromOccurrenceIndex && item.status === "upcoming" ? { ...item, status: "cancelled" } : item)),
    restoreStudySpace: (space, strategy) => { const result = applyRestore({ classes, teachers, books, locations, preferences }, space, strategy); setClasses(result.space.classes); setTeachers(result.space.teachers); setBooks(result.space.books); setLocations(result.space.locations); setPreferences({ ...defaultPreferences, ...result.space.preferences }); return result.summary; },
  }), [books, classReferenceResult, classes, dataStatus, hydrate, isHydrated, locations, preferences, saveError, saveStatus, teachers]);
  return <DarsContext.Provider value={value}>{children}</DarsContext.Provider>;
}

export function useDars() { const context = useContext(DarsContext); if (!context) throw new Error("useDars must be used within DarsProvider"); return context; }
