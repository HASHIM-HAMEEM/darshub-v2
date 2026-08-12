import { useDars } from "@/lib/dars-context";

export function useDisplayPreferences() {
  const { preferences } = useDars();
  return { ...preferences, locale: preferences.dateLanguage === "ar" ? "ar-EG" : "en-EG", isArabicDates: preferences.dateLanguage === "ar" };
}
