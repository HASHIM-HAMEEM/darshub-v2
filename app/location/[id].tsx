import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Linking, FlatList, StyleSheet, Text, View } from "react-native";
import { ClassCard, EmptyState, IconButton, PrimaryButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { goBackOrHome } from "@/lib/navigation";

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const colors = useColors(); const { locations, classes, teachers, books } = useDars(); const location = locations.find((item) => item.id === id); const linked = classes.filter((item) => item.locationId === id);
  if (!location) return <ScreenContainer><EmptyState title="Location not found" message="This place is no longer in your location list." actionLabel="Back to locations" onAction={() => router.replace("/locations" as never)} /></ScreenContainer>;
  return <ScreenContainer><FlatList data={linked} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <View style={styles.item}><ClassCard item={item} teachers={teachers} books={books} locations={locations} /></View>} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Class location" title={location.name} action={<IconButton icon="close" label="Close location" onPress={goBackOrHome} />} /><View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.addressRow}><MaterialIcons name="location-on" size={20} color={colors.tint} /><Text style={[styles.address, { color: colors.text }]}>{location.area}, {location.city}</Text></View>{location.address ? <Text style={[styles.addressNote, { color: colors.muted }]}>{location.address}</Text> : null}{location.notes ? <Text style={[styles.notes, { color: colors.text }]}>{location.notes}</Text> : null}<PrimaryButton label="Open map" icon="map" onPress={() => location.mapLink ? Linking.openURL(location.mapLink) : undefined} disabled={!location.mapLink} /></View><Text style={[styles.heading, { color: colors.text }]}>Classes here</Text></View>} ListEmptyComponent={<EmptyState icon="location-on" title="No linked classes" message="Classes held at this location will appear here." />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, header: { gap: 18, paddingBottom: 8 }, hero: { borderBottomWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, gap: 11, paddingVertical: 15 }, addressRow: { alignItems: "center", flexDirection: "row", gap: 8 }, address: { fontSize: 16, fontWeight: "800" }, addressNote: { fontSize: 14 }, notes: { fontSize: 14, lineHeight: 21 }, heading: { fontSize: 15, fontWeight: "800", marginTop: 2 }, item: { marginTop: 2 } });
