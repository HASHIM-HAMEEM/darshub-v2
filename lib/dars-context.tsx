import { createContext, useContext, useMemo, useState } from "react";
import type { Book, ClassDraft, DarsClass, Location, Teacher } from "@/lib/types/dars";

type DarsContextValue = {
  classes: DarsClass[];
  teachers: Teacher[];
  books: Book[];
  locations: Location[];
  saveClass: (draft: ClassDraft, id?: string) => string;
  deleteClass: (id: string) => void;
  completeClass: (id: string) => void;
  addTeacher: (input: Omit<Teacher, "id">) => string;
  addBook: (input: Omit<Book, "id">) => string;
  addLocation: (input: Omit<Location, "id">) => string;
};

const DarsContext = createContext<DarsContextValue | null>(null);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function DarsProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<DarsClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const value = useMemo<DarsContextValue>(() => ({
    classes,
    teachers,
    books,
    locations,
    saveClass: (draft, id) => {
      const classId = id ?? makeId("class");
      const entry = { ...draft, id: classId };
      setClasses((current) => id ? current.map((item) => item.id === id ? entry : item) : [entry, ...current]);
      return classId;
    },
    deleteClass: (id) => setClasses((current) => current.filter((item) => item.id !== id)),
    completeClass: (id) => setClasses((current) => current.map((item) => item.id === id ? { ...item, status: "completed" } : item)),
    addTeacher: (input) => { const id = makeId("teacher"); setTeachers((current) => [...current, { ...input, id }]); return id; },
    addBook: (input) => { const id = makeId("book"); setBooks((current) => [...current, { ...input, id }]); return id; },
    addLocation: (input) => { const id = makeId("location"); setLocations((current) => [...current, { ...input, id }]); return id; },
  }), [books, classes, locations, teachers]);

  return <DarsContext.Provider value={value}>{children}</DarsContext.Provider>;
}

export function useDars() {
  const context = useContext(DarsContext);
  if (!context) throw new Error("useDars must be used within DarsProvider");
  return context;
}
