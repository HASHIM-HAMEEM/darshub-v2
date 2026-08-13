import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { FormSection, TextField } from "@/components/form-ui";
import { IconButton, PrimaryButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";

export default function LocationFormScreen() {
  const { addLocation } = useDars(); const [name, setName] = useState(""); const [address, setAddress] = useState(""); const [city, setCity] = useState("Cairo"); const [area, setArea] = useState(""); const [mapLink, setMapLink] = useState(""); const [notes, setNotes] = useState("");
  const save = () => { if (!name.trim() || !city.trim() || !area.trim()) { Alert.alert("Add place details", "Name, city, and area are needed for a useful location entry."); return; } const id = addLocation({ name: name.trim(), address: address.trim(), city: city.trim(), area: area.trim(), mapLink: mapLink.trim() || undefined, notes: notes.trim() || undefined }); router.replace(`/location/${id}` as never); };
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content}><ScreenTitle title="Add location" action={<IconButton icon="close" label="Close form" onPress={() => router.back()} />} /><FormSection title="Place details"><TextField label="Place name" value={name} onChangeText={setName} placeholder="e.g. Masjid Al-Huda" required /><TextField label="Address" value={address} onChangeText={setAddress} placeholder="Street or detailed address" /><TextField label="City" value={city} onChangeText={setCity} placeholder="Cairo" required /><TextField label="Area" value={area} onChangeText={setArea} placeholder="e.g. Nasr City" required /><TextField label="Google Maps link" value={mapLink} onChangeText={setMapLink} placeholder="Optional map link" /><TextField label="Notes" value={notes} onChangeText={setNotes} placeholder="Entrance or meeting note" multiline /></FormSection><PrimaryButton label="Save location" icon="check" onPress={save} /></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { gap: 16, padding: 16, paddingBottom: 36 } });
