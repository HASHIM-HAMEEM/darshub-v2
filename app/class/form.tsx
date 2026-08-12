import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { FormSection, PickerField, TextField } from "@/components/form-ui";
import { IconButton, PrimaryButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { subjects, type ClassDraft } from "@/lib/types/dars";

const today = () => new Date().toISOString().slice(0, 10);

export default function ClassFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { classes, teachers, books, locations, saveClass } = useDars();
  const existing = useMemo(() => classes.find((item) => item.id === id), [classes, id]);
  const [draft, setDraft] = useState<ClassDraft>(() => existing ? { ...existing, id: undefined } as unknown as ClassDraft : {
    title: "", subject: "Hadith", teacherId: teachers[0]?.id ?? "", bookId: books[0]?.id ?? "", date: today(), startTime: "19:00", endTime: "", locationId: locations[0]?.id ?? "", city: locations[0]?.city ?? "Cairo", notes: "", type: "one-time", recurrenceRule: "", language: "Arabic", status: "upcoming",
  });
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
    router.replace(`/class/${savedId}` as never);
  };

  return <ScreenContainer><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><ScreenTitle eyebrow={existing ? "Update your schedule" : "A quiet moment to plan"} title={existing ? "Edit class" : "Add a class"} action={<IconButton icon="close" label="Close form" onPress={() => router.back()} />} /><FormSection title="Class details"><TextField label="Class title" value={draft.title} onChangeText={(value) => set("title", value)} placeholder="e.g. Explanation of Riyad as-Salihin" required /><PickerField label="Subject" value={draft.subject} options={options.subjects} onSelect={(value) => set("subject", value)} placeholder="Choose a subject" /><PickerField label="Teacher / scholar" value={draft.teacherId} options={options.teachers} onSelect={(value) => set("teacherId", value)} placeholder="Choose a teacher" /><PickerField label="Book" value={draft.bookId} options={options.books} onSelect={(value) => set("bookId", value)} placeholder="Choose a book" /></FormSection><FormSection title="Time"><TextField label="Date" value={draft.date} onChangeText={(value) => set("date", value)} placeholder="YYYY-MM-DD" required /><View style={styles.row}><View style={styles.flex}><TextField label="Start time" value={draft.startTime} onChangeText={(value) => set("startTime", value)} placeholder="19:00" required /></View><View style={styles.flex}><TextField label="End time" value={draft.endTime ?? ""} onChangeText={(value) => set("endTime", value)} placeholder="20:15" /></View></View><PickerField label="Class type" value={draft.type} options={[{ label: "One-time class", value: "one-time" }, { label: "Recurring class", value: "recurring" }]} onSelect={(value) => set("type", value)} />{draft.type === "recurring" ? <TextField label="Recurrence rule" value={draft.recurrenceRule ?? ""} onChangeText={(value) => set("recurrenceRule", value)} placeholder="e.g. Weekly on Wednesday" /> : null}</FormSection><FormSection title="Place"><PickerField label="Location" value={draft.locationId} options={options.locations} onSelect={(value) => { set("locationId", value); const location = locations.find((item) => item.id === value); if (location) set("city", location.city); }} placeholder="Choose a location" /><TextField label="City" value={draft.city} onChangeText={(value) => set("city", value)} placeholder="Cairo" /></FormSection><FormSection title="Extra notes"><PickerField label="Status" value={draft.status} options={[{ label: "Upcoming", value: "upcoming" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }]} onSelect={(value) => set("status", value)} /><PickerField label="Language" value={draft.language ?? ""} options={[{ label: "Arabic", value: "Arabic" }, { label: "English", value: "English" }, { label: "Both Arabic & English", value: "Arabic & English" }]} onSelect={(value) => set("language", value)} /><TextField label="Notes" value={draft.notes ?? ""} onChangeText={(value) => set("notes", value)} placeholder="Anything to remember before class" multiline /></FormSection><PrimaryButton label={existing ? "Save changes" : "Save class"} icon="check" onPress={save} /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, row: { flexDirection: "row", gap: 12 }, flex: { flex: 1 } });
