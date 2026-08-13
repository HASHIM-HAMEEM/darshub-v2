export type ClassStatus = "upcoming" | "completed" | "cancelled";
export type ClassType = "one-time" | "recurring";
export type DateDisplay = "gregorian" | "dual" | "hijri";

export type DarsPreferences = {
  appLanguage: "en" | "ar";
  dateDisplay: DateDisplay;
  dateLanguage: "en" | "ar";
  remindersEnabled: boolean;
  reminderLeadMinutes: 10 | 30 | 60;
};

export type Teacher = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  subjects: string[];
  contact?: string;
  mainLocation?: string;
  notes?: string;
};

export type Book = {
  id: string;
  name: string;
  author: string;
  subject: string;
  description?: string;
  studyStatus?: "Current study" | "Planned" | "Completed";
};

export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  mapLink?: string;
  notes?: string;
};

export type DarsClass = {
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  bookId: string;
  date: string;
  startTime: string;
  endTime?: string;
  locationId: string;
  city: string;
  notes?: string;
  type: ClassType;
  recurrenceRule?: string;
  seriesId?: string;
  occurrenceIndex?: number;
  language?: string;
  status: ClassStatus;
  reminderId?: string;
  reminderLeadMinutes?: 10 | 30 | 60;
};

export type ClassDraft = Omit<DarsClass, "id">;

export const subjects = ["Aqeedah", "Fiqh", "Hadith", "Tafsir", "Arabic", "Quran", "Seerah", "Usul", "Tazkiyah"];
