import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FormSection, PickerField, TextField } from "@/components/form-ui";
import { IconButton, PrimaryButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { goBackOrHome } from "@/lib/navigation";
import { subjects, type Book } from "@/lib/types/dars";

const studyStatuses: NonNullable<Book["studyStatus"]>[] = ["Current study", "Planned", "Completed"];

export default function BookFormScreen() {
  const { id, returnTo } = useLocalSearchParams<{ id?: string; returnTo?: string }>(); const colors = useColors(); const { books, saveBook } = useDars(); const existing = useMemo(() => books.find((item) => item.id === id), [books, id]);
  const [name, setName] = useState(""); const [author, setAuthor] = useState(""); const [subject, setSubject] = useState("Hadith"); const [description, setDescription] = useState(""); const [status, setStatus] = useState<NonNullable<Book["studyStatus"]>>("Current study"); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!existing) return; setName(existing.name); setAuthor(existing.author); setSubject(existing.subject); setDescription(existing.description ?? ""); setStatus(existing.studyStatus ?? "Current study"); }, [existing]);
  const save = () => { if (saving) return; setSaving(true); const result = saveBook({ name, author, subject, description: description || undefined, studyStatus: status }, existing?.id); if (!result.ok) { setError(result.message); setSaving(false); return; } if (returnTo === "class") { router.back(); return; } router.replace(`/book/${result.id}` as never); };
  return <ScreenContainer><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><ScreenTitle eyebrow={existing ? "Update book" : "New book"} title={existing ? "Edit book" : "Add book"} action={<IconButton icon="close" label="Close form" onPress={goBackOrHome} />} /><Text style={[styles.intro, { color: colors.muted }]}>{existing ? "Changes appear everywhere this book is selected." : "Save the essentials now; descriptions stay optional."}</Text><FormSection title="Book details"><TextField label="Book name" value={name} onChangeText={(value) => { setName(value); setError(""); }} placeholder="e.g. Bulugh al-Maram" required /><TextField label="Author" value={author} onChangeText={(value) => { setAuthor(value); setError(""); }} placeholder="e.g. Ibn Hajar" required /><PickerField label="Subject" value={subject} options={subjects.map((item) => ({ label: item, value: item }))} onSelect={setSubject} /><PickerField label="Study status" value={status} options={studyStatuses.map((item) => ({ label: item, value: item }))} onSelect={(value) => setStatus(value as NonNullable<Book["studyStatus"]>)} /><TextField label="Description" value={description} onChangeText={setDescription} placeholder="Optional study note" multiline /></FormSection>{error ? <View style={[styles.notice, { backgroundColor: colors.wash, borderColor: colors.error }]}><Text style={[styles.noticeText, { color: colors.error }]}>{error}</Text></View> : null}<PrimaryButton label={saving ? "Saving…" : existing ? "Save changes" : "Save book"} icon="check" disabled={saving} onPress={save} /></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { gap: 16, padding: 16, paddingBottom: 36 }, intro: { fontSize: 13.5, lineHeight: 20, marginTop: -5 }, notice: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12 }, noticeText: { fontSize: 13, fontWeight: "600" } });
