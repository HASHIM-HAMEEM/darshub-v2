import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { FormSection, TextField } from "@/components/form-ui";
import { IconButton, PrimaryButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { useState } from "react";

export default function TeacherFormScreen() {
  const { addTeacher } = useDars();
  const [name, setName] = useState(""); const [title, setTitle] = useState("Shaykh"); const [subjects, setSubjects] = useState(""); const [location, setLocation] = useState(""); const [bio, setBio] = useState("");
  const save = () => { if (!name.trim() || !subjects.trim()) { Alert.alert("Add a name and subject", "Both help students recognize the teacher in their directory."); return; } const id = addTeacher({ name: name.trim(), title: title.trim() || undefined, subjects: subjects.split(",").map((item) => item.trim()).filter(Boolean), mainLocation: location.trim() || undefined, bio: bio.trim() || undefined }); router.replace(`/teacher/${id}` as never); };
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content}><ScreenTitle title="Add teacher" action={<IconButton icon="close" label="Close form" onPress={() => router.back()} />} /><FormSection title="Teacher details"><TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Shaykh Mahmoud" required /><TextField label="Title" value={title} onChangeText={setTitle} placeholder="Shaykh, Ustadh…" /><TextField label="Subjects taught" value={subjects} onChangeText={setSubjects} placeholder="Hadith, Fiqh" required /><TextField label="Main location" value={location} onChangeText={setLocation} placeholder="Where they teach most often" /><TextField label="Short bio / notes" value={bio} onChangeText={setBio} placeholder="A helpful note about their classes" multiline /></FormSection><PrimaryButton label="Save teacher" icon="check" onPress={save} /></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { gap: 16, padding: 16, paddingBottom: 36 } });
