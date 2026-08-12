import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { FormSection, PickerField, TextField } from "@/components/form-ui";
import { IconButton, PrimaryButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { haptic } from "@/lib/haptics";
import { subjects, type ClassDraft, type DarsClass } from "@/lib/types/dars";

const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };

function createDraft(existing: DarsClass | undefined, defaults: { teacherId: string; bookId: string; locationId: string; city: string }): ClassDraft {
  if (existing) {
    const { id: _id, ...draft } = existing;
    return { ...draft, endTime: draft.endTime ?? "", notes: draft.notes ?? "", recurrenceRule: draft.recurrenceRule ?? "", language: draft.language ?? "Arabic" };
  }
  return { title: "", subject: "Hadith", teacherId: defaults.teacherId, bookId: defaults.bookId, date: today(), startTime: "19:00", endTime: "", locationId: defaults.locationId, city: defaults.city, notes: "", type: "one-time", recurrenceRule: "", language: "Arabic", status: "upcoming" };
}

export default function ClassFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { classes, teachers, books, locations, saveClass } = useDars();
  const existing = useMemo(() => classes.find((item) => item.id === id), [classes, id]);
  const hydratedClassId = useRef<string | undefined>(existing?.id);
  const [draft, setDraft] = useState<ClassDraft>(() => createDraft(existing, { teacherId: teachers[0]?.id ?? "", bookId: books[0]?.id ?? "", locationId: locations[0]?.id ?? "", city: locations[0]?.city ?? "Cairo" }));
  useEffect(() => {
    if (!existing || hydratedClassId.current === existing.id) return;
    hydratedClassId.current = existing.id;
    setDraft(createDraft(existing, { teacherId: teachers[0]?.id ?? "", bookId: books[0]?.id ?? "", locationId: locations[0]?.id ?? "", city: locations[0]?.city ?? "Cairo" }));
  }, [books, existing, locations, teachers]);
  useEffect(() => {
    if (existing) return;
    setDraft((current) => ({
      ...current,
      teacherId: current.teacherId || teachers[0]?.id || "",
      bookId: current.bookId || books[0]?.id || "",
      locationId: current.locationId || locations[0]?.id || "",
      city: current.locationId ? current.city : locations[0]?.city || current.city,
    }));
  }, [books, existing, locations, teachers]);
  const set = (key: keyof ClassDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const options = {
    subjects: subjects.map((subject) => ({ label: subject, value: subject })),
    teachers: teachers.map((teacher) => ({ label: teacher.name, value: teacher.id })),
    books: books.map((book) => ({ label: book.name, value: book.id })),
    locations: locations.map((location) => ({ label: `${location.name} · ${location.city}`, value: location.id })),
  };

  const save = () => {
    if (!draft.title.trim() || !draft.teacherId || !draft.bookId || !draft.locationId || !draft.date || !draft.startTime) {
      Alert.alert("A few details are needed", "Please add a title, teacher, book, date, time, and location before saving.");
      return;
    }
    const selectedLocation = locations.find((location) => location.id === draft.locationId);
    const savedId = saveClass({ ...draft, title: draft.title.trim(), city: selectedLocation?.city ?? draft.city, endTime: draft.endTime || undefined, notes: draft.notes?.trim() || undefined, recurrenceRule: draft.type === "recurring" ? draft.recurrenceRule || "Weekly" : undefined }, existing?.id);
    haptic.success();
    router.replace(`/class/${savedId}` as never);
  };

  const needsSetup = !teachers.length || !books.length || !locations.length;
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><ScreenTitle title={existing ? "Edit class" : "Add a class"} action={<IconButton icon="close" label="Close form" onPress={() => router.back()} />} />{needsSetup ? <View style={styles.guide}><View style={styles.guideIcon}><MaterialIcons name="auto-stories" size={20} color="#164D3D" /></View><View style={styles.guideCopy}><Text style={styles.guideTitle}>Set up your class details</Text><Text style={styles.guideText}>Add the missing references first. They will be selected here automatically.</Text></View><View style={styles.guideActions}>{!teachers.length ? <PrimaryButton label="Teacher" icon="person-add" onPress={() => router.push("/teacher/form" as never)} /> : null}{!books.length ? <PrimaryButton label="Book" icon="menu-book" onPress={() => router.push("/book/form" as never)} /> : null}{!locations.length ? <PrimaryButton label="Location" icon="add-location-alt" onPress={() => router.push("/location/form" as never)} /> : null}</View></View> : null}<FormSection title="Class details"><TextField label="Class title" value={draft.title} onChangeText={(value) => set("title", value)} placeholder="e.g. Explanation of Riyad as-Salihin" required /><PickerField label="Subject" value={draft.subject} options={options.subjects} onSelect={(value) => set("subject", value)} placeholder="Choose a subject" /><PickerField label="Teacher / scholar" value={draft.teacherId} options={options.teachers} onSelect={(value) => set("teacherId", value)} placeholder="Choose a teacher" /><PickerField label="Book" value={draft.bookId} options={options.books} onSelect={(value) => set("bookId", value)} placeholder="Choose a book" /></FormSection><FormSection title="Time"><TextField label="Date" value={draft.date} onChangeText={(value) => set("date", value)} placeholder="YYYY-MM-DD" required /><View style={styles.row}><View style={styles.flex}><TextField label="Start time" value={draft.startTime} onChangeText={(value) => set("startTime", value)} placeholder="19:00" required /></View><View style={styles.flex}><TextField label="End time" value={draft.endTime ?? ""} onChangeText={(value) => set("endTime", value)} placeholder="20:15" /></View></View><PickerField label="Class type" value={draft.type} options={[{ label: "One-time class", value: "one-time" }, { label: "Recurring class", value: "recurring" }]} onSelect={(value) => set("type", value)} />{draft.type === "recurring" ? <TextField label="Recurrence rule" value={draft.recurrenceRule ?? ""} onChangeText={(value) => set("recurrenceRule", value)} placeholder="e.g. Weekly on Wednesday" /> : null}</FormSection><FormSection title="Place"><PickerField label="Location" value={draft.locationId} options={options.locations} onSelect={(value) => { set("locationId", value); const location = locations.find((item) => item.id === value); if (location) set("city", location.city); }} placeholder="Choose a location" /><TextField label="City" value={draft.city} onChangeText={(value) => set("city", value)} placeholder="Cairo" /></FormSection><FormSection title="Notes"><PickerField label="Status" value={draft.status} options={[{ label: "Upcoming", value: "upcoming" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }]} onSelect={(value) => set("status", value)} /><PickerField label="Language" value={draft.language ?? ""} options={[{ label: "Arabic", value: "Arabic" }, { label: "English", value: "English" }, { label: "Both Arabic & English", value: "Arabic & English" }]} onSelect={(value) => set("language", value)} /><TextField label="Notes" value={draft.notes ?? ""} onChangeText={(value) => set("notes", value)} placeholder="Anything to remember" multiline /></FormSection><PrimaryButton label={existing ? "Save changes" : "Save class"} icon="check" onPress={save} /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: 14, padding: 20, paddingBottom: 48 }, row: { flexDirection: "row", gap: 12 }, flex: { flex: 1 }, guide: { backgroundColor: "#EEF2E9", borderColor: "#D5DED4", borderRadius: 16, borderWidth: 1, gap: 10, padding: 14 }, guideIcon: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, height: 40, justifyContent: "center", width: 40 }, guideCopy: { gap: 2 }, guideTitle: { color: "#183C30", fontSize: 15, fontWeight: "800" }, guideText: { color: "#50645B", fontSize: 12.5, lineHeight: 18 }, guideActions: { flexDirection: "row", gap: 8 }, });
