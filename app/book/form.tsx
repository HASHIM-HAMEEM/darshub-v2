import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { FormSection, PickerField, TextField } from "@/components/form-ui";
import { IconButton, PrimaryButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { subjects } from "@/lib/types/dars";

export default function BookFormScreen() {
  const { addBook } = useDars(); const [name, setName] = useState(""); const [author, setAuthor] = useState(""); const [subject, setSubject] = useState("Hadith"); const [description, setDescription] = useState(""); const [status, setStatus] = useState("Current study");
  const save = () => { if (!name.trim() || !author.trim()) { Alert.alert("Add the book and author", "These details make your study library useful at a glance."); return; } const id = addBook({ name: name.trim(), author: author.trim(), subject, description: description.trim() || undefined, studyStatus: status as "Current study" | "Planned" | "Completed" }); router.replace(`/book/${id}` as never); };
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content}><ScreenTitle eyebrow="Build your library" title="Add book" action={<IconButton icon="close" label="Close form" onPress={() => router.back()} />} /><FormSection title="Book details"><TextField label="Book name" value={name} onChangeText={setName} placeholder="e.g. Bulugh al-Maram" required /><TextField label="Author" value={author} onChangeText={setAuthor} placeholder="e.g. Ibn Hajar" required /><PickerField label="Subject" value={subject} options={subjects.map((item) => ({ label: item, value: item }))} onSelect={setSubject} /><PickerField label="Study status" value={status} options={[{ label: "Current study", value: "Current study" }, { label: "Planned", value: "Planned" }, { label: "Completed", value: "Completed" }]} onSelect={setStatus} /><TextField label="Description" value={description} onChangeText={setDescription} placeholder="A short reference note" multiline /></FormSection><PrimaryButton label="Save book" icon="check" onPress={save} /></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 } });
