import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { DateField, FormNotice, FormSection, InlineLink, PickerField, SeriesEndFields, SwitchRow, TextField, TimeField, WeekdayPicker } from "@/components/form-ui";
import { EmptyState, PrimaryButton, TopBar } from "@/components/dars-ui";
import { directional, hairline, space, type } from "@/constants/design";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { formatClassDate } from "@/lib/dars-utils";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { goBackOrHome } from "@/lib/navigation";
import { getSeriesDates, normalizeRecurrenceDays, normalizeRecurrenceEnd, recurringCadences, usesWeekdays } from "@/lib/recurrence";
import { subjects, type ClassDraft, type DarsClass } from "@/lib/types/dars";

const extraDraft = (source: DarsClass): ClassDraft => {
  const { id: _id, seriesId: _seriesId, occurrenceIndex: _index, reminderId: _reminderId, recurrenceDays: _days, recurrenceEnd: _end, seriesStart: _start, ...rest } = source;
  return { ...rest, endTime: rest.endTime ?? "", notes: rest.notes ?? "", type: "one-time", recurrenceRule: "", status: "upcoming", date: today() };
};
const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
function createDraft(existing: DarsClass | undefined, defaults: { teacherId: string; bookId: string; locationId: string; city: string }): ClassDraft { if (existing) { const { id: _id, ...draft } = existing; return { ...draft, endTime: draft.endTime ?? "", notes: draft.notes ?? "", recurrenceRule: draft.recurrenceRule ?? "", language: draft.language ?? "Arabic" }; } return { title: "", subject: "Hadith", teacherId: defaults.teacherId, bookId: defaults.bookId, date: today(), startTime: "19:00", endTime: "", locationId: defaults.locationId, city: defaults.city, notes: "", type: "one-time", recurrenceRule: "", language: "Arabic", status: "upcoming" }; }

export default function ClassFormScreen() {
  const colors = useColors(); const { id, scope, extraFor } = useLocalSearchParams<{ id?: string; scope?: string; extraFor?: string }>(); const { dateDisplay, locale } = useDisplayPreferences(); const { classes, teachers, books, locations, saveClass, updateFutureSeries, classReferenceResult, clearClassReferenceResult } = useDars(); const { language, isRTL } = useI18n(); const existing = useMemo(() => classes.find((item) => item.id === id), [classes, id]); const hydratedClassId = useRef<string | undefined>(existing?.id);
  const copy = language === "ar" ? { add: "إضافة درس", edit: "تعديل الدرس", details: "تفاصيل الدرس", title: "العنوان", subject: "المادة", teacher: "المعلم", book: "الكتاب", time: "الوقت", date: "التاريخ", start: "وقت البداية", end: "وقت النهاية (اختياري)", place: "المكان", location: "المكان", city: "المدينة", notes: "ملاحظات إضافية", recurring: "درس متكرر", repeat: "نمط التكرار", recurrenceHelp: "سننشئ ١٢ موعداً قادماً لهذا الدرس.", save: "حفظ الدرس", saveChanges: "حفظ التعديلات", missing: "أضف التفاصيل المطلوبة للحفظ.", setup: "أكمل المراجع أولاً.", addTeacher: "أضف معلماً أولاً", addBook: "أضف كتاباً أولاً", addLocation: "أضف مكاناً أولاً" } : { add: "Add Class", edit: "Edit Class", details: "Class Details", title: "Title", subject: "Subject", teacher: "Teacher", book: "Book", time: "Time", date: "Date", start: "Start Time", end: "End Time (optional)", place: "Place", location: "Location", city: "City", notes: "Extra Notes", recurring: "Recurring class", repeat: "Repeat", recurrenceHelp: "We’ll create the next 12 upcoming occurrences.", save: "Save Class", saveChanges: "Save Changes", missing: "Add the required details to save.", setup: "Complete your references first.", addTeacher: "Add a teacher first", addBook: "Add a book first", addLocation: "Add a location first" };
  const [draft, setDraft] = useState<ClassDraft>(() => !existing && extraFor && classes.some((item) => item.id === extraFor) ? extraDraft(classes.find((item) => item.id === extraFor)!) : createDraft(existing, { teacherId: teachers[0]?.id ?? "", bookId: books[0]?.id ?? "", locationId: locations[0]?.id ?? "", city: locations[0]?.city ?? "Cairo" })); const [saveError, setSaveError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!existing || hydratedClassId.current === existing.id) return; hydratedClassId.current = existing.id; setDraft(createDraft(existing, { teacherId: teachers[0]?.id ?? "", bookId: books[0]?.id ?? "", locationId: locations[0]?.id ?? "", city: locations[0]?.city ?? "Cairo" })); }, [books, existing, locations, teachers]);
  useEffect(() => { if (existing) return; setDraft((current) => { const nextTeacher = current.teacherId || teachers[0]?.id || ""; const nextBook = current.bookId || books[0]?.id || ""; const nextLocation = current.locationId || locations[0]?.id || ""; const nextCity = current.locationId ? current.city : locations.find((item) => item.id === nextLocation)?.city || current.city; return { ...current, teacherId: nextTeacher, bookId: nextBook, locationId: nextLocation, city: nextCity }; }); }, [books, existing, locations, teachers]);
  useEffect(() => { if (!classReferenceResult) return; setDraft((current) => { if (classReferenceResult.kind === "teacher" && teachers.some((item) => item.id === classReferenceResult.id)) return { ...current, teacherId: classReferenceResult.id }; if (classReferenceResult.kind === "book" && books.some((item) => item.id === classReferenceResult.id)) return { ...current, bookId: classReferenceResult.id }; if (classReferenceResult.kind === "location") { const location = locations.find((item) => item.id === classReferenceResult.id); return location ? { ...current, locationId: location.id, city: location.city } : current; } return current; }); clearClassReferenceResult(); }, [books, classReferenceResult, clearClassReferenceResult, locations, teachers]);
  const set = <K extends keyof ClassDraft>(key: K, value: ClassDraft[K]) => setDraft((current) => ({ ...current, [key]: value })); const options = { subjects: subjects.map((value) => ({ label: value, value })), teachers: teachers.map((value) => ({ label: value.name, value: value.id })), books: books.map((value) => ({ label: value.name, value: value.id })), locations: locations.map((value) => ({ label: `${value.name} · ${value.city}`, value: value.id })) };
  const missingRoute = !teachers.length ? "/teacher/form?returnTo=class" : !books.length ? "/book/form?returnTo=class" : "/location/form?returnTo=class"; const setupLabel = !teachers.length ? copy.addTeacher : !books.length ? copy.addBook : copy.addLocation;
  const save = () => { if (saving) return; setSaving(true); setSaveError(""); const result = scope === "series" && existing?.seriesId ? updateFutureSeries(existing.seriesId, existing.occurrenceIndex ?? 0, draft) : saveClass(draft, existing?.id); if (!result.ok) { setSaveError(result.message); setSaving(false); return; } haptic.success(); router.replace(`/class/${result.id}` as never); };
  const writing = directional(isRTL);
  const ar = language === "ar";
  const clearError = () => setSaveError("");
  const seriesEndValue = normalizeRecurrenceEnd(draft.recurrenceEnd, draft.date);
  const seriesDates = draft.type === "recurring" ? getSeriesDates(draft.date, draft.recurrenceRule, draft.recurrenceDays, undefined, seriesEndValue.kind === "ongoing" ? undefined : seriesEndValue) : [];
  const lastSeriesDate = seriesDates.length ? formatClassDate(seriesDates[seriesDates.length - 1], dateDisplay, locale) : "";
  const seriesHelp = seriesEndValue.kind === "ongoing"
    ? ar ? `سننشئ ${seriesDates.length} موعداً ونضيف المزيد تلقائياً حتى تحدد النهاية.` : `We’ll schedule ${seriesDates.length} classes now and keep adding more until you set an end.`
    : seriesDates.length ? ar ? `${seriesDates.length} حصة، آخرها ${lastSeriesDate}.` : `${seriesDates.length} sessions, the last on ${lastSeriesDate}.` : ar ? "لا توجد حصص في هذه الفترة." : "No sessions fall in this range.";
  const seriesMode = scope === "series" && Boolean(existing?.seriesId);
  const heading = seriesMode ? (ar ? "تعديل المواعيد القادمة" : "Edit future occurrences") : existing ? copy.edit : copy.add;
  return (
    <ScreenContainer>
      <TopBar onBack={goBackOrHome} title={heading} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}>
        {!teachers.length || !books.length || !locations.length ? (
          <EmptyState
            icon="library-add"
            title={copy.setup}
            message={ar ? "يحتاج كل درس إلى معلم وكتاب ومكان محفوظ." : "Every class links to a saved teacher, book, and place."}
            actionLabel={setupLabel}
            onAction={() => router.push(missingRoute as never)}
          />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {seriesMode ? (
                <FormNotice
                  tone="info"
                  message={ar ? "ستُطبق التغييرات على هذا الموعد وكل المواعيد القادمة في السلسلة." : "Changes apply to this and every future occurrence in the series."}
                />
              ) : null}
              <FormSection title={copy.details}>
                <TextField
                  label={copy.title}
                  value={draft.title}
                  onChangeText={(value) => {
                    set("title", value);
                    clearError();
                  }}
                  placeholder={ar ? "مثال: شرح رياض الصالحين" : "e.g., Explanation of Riyad as-Salihin"}
                  required
                />
                <PickerField label={copy.subject} value={draft.subject} options={options.subjects} onSelect={(value) => set("subject", value)} placeholder={copy.subject} />
                <View style={styles.reference}>
                  <PickerField label={copy.teacher} value={draft.teacherId} options={options.teachers} onSelect={(value) => set("teacherId", value)} placeholder={copy.teacher} required />
                  <InlineLink label={ar ? "معلم جديد" : "New teacher"} onPress={() => router.push("/teacher/form?returnTo=class" as never)} />
                </View>
                <View style={styles.reference}>
                  <PickerField label={copy.book} value={draft.bookId} options={options.books} onSelect={(value) => set("bookId", value)} placeholder={copy.book} required />
                  <InlineLink label={ar ? "كتاب جديد" : "New book"} onPress={() => router.push("/book/form?returnTo=class" as never)} />
                </View>
              </FormSection>
              <FormSection title={copy.time}>
                <DateField
                  label={copy.date}
                  value={draft.date}
                  onChange={(value) => {
                    set("date", value);
                    clearError();
                  }}
                  required
                />
                <View style={[styles.pair, isRTL && styles.rowReverse]}>
                  <View style={styles.flex}>
                    <TimeField
                      label={ar ? "البداية" : "Starts"}
                      value={draft.startTime}
                      onChange={(value) => {
                        set("startTime", value);
                        clearError();
                      }}
                      required
                    />
                  </View>
                  <View style={styles.flex}>
                    <TimeField
                      label={ar ? "النهاية" : "Ends"}
                      value={draft.endTime ?? ""}
                      fallback={draft.startTime}
                      clearable
                      onChange={(value) => {
                        set("endTime", value);
                        clearError();
                      }}
                    />
                  </View>
                </View>
                <SwitchRow
                  label={copy.recurring}
                  detail={draft.type === "recurring" ? (existing ? undefined : seriesHelp) : undefined}
                  value={draft.type === "recurring"}
                  onValueChange={(value) =>
                    setDraft((current) => ({ ...current, type: value ? "recurring" : "one-time", recurrenceRule: value ? current.recurrenceRule || "Weekly" : current.recurrenceRule }))
                  }
                />
                {draft.type === "recurring" ? (
                  <PickerField
                    label={copy.repeat}
                    value={draft.recurrenceRule || "Weekly"}
                    options={recurringCadences.map((value) => ({ label: ar ? (value === "Weekly" ? "أسبوعياً" : value === "Every 2 weeks" ? "كل أسبوعين" : "شهرياً") : value, value }))}
                    onSelect={(value) => set("recurrenceRule", value)}
                    placeholder={copy.repeat}
                  />
                ) : null}
                {draft.type === "recurring" && !existing && usesWeekdays(draft.recurrenceRule) ? (
                  <WeekdayPicker
                    label={ar ? "أيام الدرس" : "Class days"}
                    value={normalizeRecurrenceDays(draft.recurrenceDays, draft.date)}
                    onChange={(days) => set("recurrenceDays", days)}
                  />
                ) : null}
                {draft.type === "recurring" && !existing ? (
                  <SeriesEndFields value={normalizeRecurrenceEnd(draft.recurrenceEnd, draft.date)} minDate={draft.date} onChange={(end) => set("recurrenceEnd", end)} />
                ) : null}
              </FormSection>
              <FormSection title={copy.place}>
                <View style={styles.reference}>
                  <PickerField
                    label={copy.location}
                    value={draft.locationId}
                    options={options.locations}
                    onSelect={(value) => {
                      set("locationId", value);
                      const location = locations.find((item) => item.id === value);
                      if (location) set("city", location.city);
                    }}
                    placeholder={copy.location}
                    required
                  />
                  <InlineLink label={ar ? "مكان جديد" : "New place"} onPress={() => router.push("/location/form?returnTo=class" as never)} />
                </View>
                {draft.city ? (
                  <Text style={[type.meta, { color: colors.muted }, writing]}>
                    {copy.city}: {draft.city}
                  </Text>
                ) : null}
              </FormSection>
              <FormSection title={copy.notes}>
                <TextField label={copy.notes} value={draft.notes ?? ""} onChangeText={(value) => set("notes", value)} placeholder={ar ? "أضف ملاحظات..." : "Add notes..."} multiline />
              </FormSection>
              {saveError ? <FormNotice message={saveError} /> : null}
            </ScrollView>
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
              <PrimaryButton
                icon="check"
                label={saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : existing ? copy.saveChanges : copy.save}
                disabled={saving}
                onPress={save}
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  flex: { flex: 1 },
  rowReverse: { flexDirection: "row-reverse" },
  content: { gap: space.xxl, paddingBottom: space.xxl, paddingHorizontal: space.gutter, paddingTop: space.sm },
  reference: { gap: 2 },
  pair: { flexDirection: "row", gap: space.md },
  footer: { borderTopWidth: hairline, paddingHorizontal: space.gutter, paddingVertical: space.md },
});
